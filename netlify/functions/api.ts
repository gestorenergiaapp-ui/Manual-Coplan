import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { MongoClient, Db, GridFSBucket, ObjectId } from "mongodb";
import { Buffer } from "buffer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { Page, FaqItem, StoredUser, ContentBlock, ContentType } from "../../types";

const { MONGODB_URI, JWT_SECRET } = process.env;

if (!MONGODB_URI || !JWT_SECRET) {
  throw new Error("Missing environment variables: MONGODB_URI and JWT_SECRET are required.");
}

let client: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  // The database name is taken from the MONGODB_URI
  const db = client.db();
  cachedDb = db;
  return db;
}

// --- HELPERS ---

const parseBody = (event: HandlerEvent) => {
    if (!event.body) return null;
    try {
        return JSON.parse(event.body);
    } catch (e) {
        return null;
    }
}

const verifyToken = (event: HandlerEvent): { username: string, role: 'admin' | 'user' } | null => {
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies.auth_token;
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET!) as { username: string, role: 'admin' | 'user' };
    } catch (e) {
        return null;
    }
}

const createResponse = (statusCode: number, body: any, headers: Record<string, string> = {}) => ({
    statusCode,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers }
});

const findAndUpdatePage = (pages: Page[], path: string[], action: (page: Page) => Page): Page[] => {
  return pages.map(p => {
    if (p.id === path[0]) {
      if (path.length === 1) return action(p);
      if (p.children) return { ...p, children: findAndUpdatePage(p.children, path.slice(1), action) };
    }
    return p;
  });
};

const findAndDeletePage = (pages: Page[], path: string[]): Page[] => {
    if (path.length === 1) return pages.filter(p => p.id !== path[0]);
    return pages.map(p => {
        if (p.id === path[0] && p.children) {
            return { ...p, children: findAndDeletePage(p.children, path.slice(1)) };
        }
        return p;
    });
}

const updateAllPages = async (db: Db, pages: Page[]): Promise<Page[]> => {
    const pagesCollection = db.collection<Page>('pages');
    await pagesCollection.deleteMany({});
    if (pages && pages.length > 0) {
        await pagesCollection.insertMany(pages);
    }
    const result = await pagesCollection.find({}).sort({_id: 1}).toArray();
    // The MongoDB driver might return _id, which we don't want on the frontend type.
    // Let's ensure it's removed if it exists.
    return JSON.parse(JSON.stringify(result));
}


// --- MAIN HANDLER ---

const handler: Handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const db = await connectToDatabase();

        // Ensure default admin exists
        const users = db.collection<StoredUser>('users');
        const adminExists = await users.findOne({ role: 'admin' });
        if (!adminExists) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            await users.insertOne({ username: 'admin', password: hashedPassword, role: 'admin' });
            console.log('Default admin user created.');
        }
        
        const path = event.path.replace('/.netlify/functions/api', '');
        const user = verifyToken(event);
        const body = parseBody(event);

        // --- PUBLIC ROUTES ---
        if (event.httpMethod === 'POST' && path === '/login') {
            if (!body || !body.username || !body.password) return createResponse(400, { message: 'Missing credentials' });
            
            const usersCollection = db.collection<StoredUser>('users');
            const existingUser = await usersCollection.findOne({ username: body.username });
            if (!existingUser || !bcrypt.compareSync(body.password, existingUser.password)) {
                return createResponse(401, { message: 'Invalid credentials' });
            }

            const { password, ...userToSign } = existingUser;
            const token = jwt.sign(userToSign, JWT_SECRET!, { expiresIn: '1d' });
            
            return createResponse(200, userToSign, {
                'Set-Cookie': cookie.serialize('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 86400 })
            });
        }

        if (event.httpMethod === 'GET' && path.startsWith('/media/')) {
            const bucket = new GridFSBucket(db);
            const fileId = new ObjectId(path.split('/')[2]);
            const downloadStream = bucket.openDownloadStream(fileId);
            
            const chunks: Buffer[] = [];
            for await (const chunk of downloadStream) { chunks.push(chunk); }
            const fileBuffer = Buffer.concat(chunks);
            const file = await db.collection('fs.files').findOne({ _id: fileId });

            return {
                statusCode: 200,
                headers: { 'Content-Type': file?.contentType || 'application/octet-stream' },
                body: fileBuffer.toString('base64'),
                isBase64Encoded: true
            }
        }

        // --- AUTHENTICATION WALL ---
        if (!user) return createResponse(401, { message: 'Unauthorized' });

        // --- PROTECTED ROUTES ---
        
        // GET current user
        if (event.httpMethod === 'GET' && path === '/current-user') return createResponse(200, user);
        
        // LOGOUT
        if (event.httpMethod === 'POST' && path === '/logout') {
            return createResponse(200, { message: 'Logged out' }, {
                'Set-Cookie': cookie.serialize('auth_token', '', { httpOnly: true, path: '/', expires: new Date(0) })
            });
        }
        
        // GET content
        if (event.httpMethod === 'GET' && path === '/content') {
            const pagesCollection = db.collection<Page>('pages');
            const faqsCollection = db.collection<FaqItem>('faqs');
            const configCollection = db.collection('config');

            const [pages, faqs, logoDoc] = await Promise.all([
                pagesCollection.find({}).sort({_id: 1}).toArray(),
                faqsCollection.find({}).toArray(),
                configCollection.findOne({ key: 'logo' })
            ]);
            return createResponse(200, { pages, faqs, logoUrl: logoDoc?.value || null });
        }

        // CHANGE PASSWORD (for current user)
        if (event.httpMethod === 'POST' && path === '/change-password') {
            const { oldPassword, newPassword } = body;
            if (!oldPassword || !newPassword || newPassword.length < 6) return createResponse(400, { message: 'Invalid data' });
            
            const usersCollection = db.collection<StoredUser>('users');
            const currentUserDoc = await usersCollection.findOne({ username: user.username });
            if (!currentUserDoc || !bcrypt.compareSync(oldPassword, currentUserDoc.password)) {
                 return createResponse(401, { message: 'Incorrect current password' });
            }
            const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
            await usersCollection.updateOne({ username: user.username }, { $set: { password: hashedNewPassword }});
            return createResponse(200, { message: 'Password changed successfully' });
        }

        // --- ADMIN-ONLY ROUTES ---
        if (user.role !== 'admin') {
            return createResponse(403, { message: 'Forbidden: Admin access required for this action.' });
        }
        
        const pagesCollection = db.collection<Page>('pages');
        const faqsCollection = db.collection<FaqItem>('faqs');
        
        // PAGE MUTATIONS
        if (event.httpMethod === 'PATCH' && path === '/page/content') {
            const { path: pagePath, content } = body;
            const currentPages = await pagesCollection.find({}).sort({_id: 1}).toArray();
            const action = (page: Page): Page => ({ ...page, content });
            const updatedPages = findAndUpdatePage(currentPages, pagePath, action);
            const finalPages = await updateAllPages(db, updatedPages);
            return createResponse(200, finalPages);
        }

        if (event.httpMethod === 'POST' && path === '/page') {
            const { parentPath, title, icon } = body;
            const newPage: Page = {
                id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `_${new Date().getTime()}`,
                title, icon,
                content: [{ id: `c_${new Date().getTime()}`, type: ContentType.H1, content: title }]
            };
            const currentPages = await pagesCollection.find({}).sort({_id: 1}).toArray();
            let updatedPages;
            if (parentPath === null) {
                const specialPagesIds = ['faq', 'contato'];
                const regularPages = currentPages.filter(p => !specialPagesIds.includes(p.id));
                const specialPages = currentPages.filter(p => specialPagesIds.includes(p.id));
                updatedPages = [...regularPages, newPage, ...specialPages];
            } else {
                const action = (page: Page): Page => ({...page, children: [...(page.children || []), newPage]});
                updatedPages = findAndUpdatePage(currentPages, parentPath, action);
            }
            const finalPages = await updateAllPages(db, updatedPages);
            return createResponse(201, finalPages);
        }

        if (event.httpMethod === 'PATCH' && path === '/page/details') {
            const { path: pagePath, title, icon } = body;
            const currentPages = await pagesCollection.find({}).sort({_id: 1}).toArray();
            const action = (page: Page): Page => ({ ...page, title: title, icon: icon });
            const updatedPages = findAndUpdatePage(currentPages, pagePath, action);
            const finalPages = await updateAllPages(db, updatedPages);
            return createResponse(200, finalPages);
        }
        
        if (event.httpMethod === 'DELETE' && path === '/page') {
            const { path: pagePath } = body;
            const currentPages = await pagesCollection.find({}).sort({_id: 1}).toArray();
            const updatedPages = findAndDeletePage(currentPages, pagePath);
            const finalPages = await updateAllPages(db, updatedPages);
            return createResponse(200, finalPages);
        }

        if (event.httpMethod === 'POST' && path === '/page/block') {
             const { path: pagePath, blockType } = body;
             const currentPages = await pagesCollection.find({}).sort({_id: 1}).toArray();
             const newBlock: ContentBlock = { id: `block_${new Date().getTime()}`, type: blockType, content: '' };
             switch(blockType) {
                case ContentType.H1: newBlock.content = "Novo Título 1"; break;
                case ContentType.H2: newBlock.content = "Novo Título 2"; break;
                case ContentType.P: newBlock.content = "Novo parágrafo."; break;
                case ContentType.UL: case ContentType.OL: newBlock.content = ["Novo item"]; break;
                case ContentType.IMAGE: newBlock.content = ""; break;
                case ContentType.ALERT_INFO: newBlock.content = "Nova informação."; break;
                case ContentType.ALERT_WARNING: newBlock.content = "Novo aviso."; break;
             }
             const action = (page: Page): Page => ({ ...page, content: [...(page.content || []), newBlock] });
             const updatedPages = findAndUpdatePage(currentPages, pagePath, action);
             const finalPages = await updateAllPages(db, updatedPages);
             return createResponse(200, finalPages);
        }
        
        if (event.httpMethod === 'PATCH' && path === '/page/block/move') {
            const { path: pagePath, blockId, direction } = body;
            const currentPages = await pagesCollection.find({}).sort({_id: 1}).toArray();
            const action = (page: Page): Page => {
                if (!page.content) return page;
                const index = page.content.findIndex(b => b.id === blockId);
                if (index === -1) return page;
                const newIndex = direction === 'up' ? index - 1 : index + 1;
                if (newIndex < 0 || newIndex >= page.content.length) return page;
                const newContent = [...page.content];
                const [movedBlock] = newContent.splice(index, 1);
                newContent.splice(newIndex, 0, movedBlock);
                return { ...page, content: newContent };
            }
            const updatedPages = findAndUpdatePage(currentPages, pagePath, action);
            const finalPages = await updateAllPages(db, updatedPages);
            return createResponse(200, finalPages);
        }

        // FAQ MUTATIONS
        if (event.httpMethod === 'POST' && path === '/faq') {
            const newFaq = { ...body, id: `faq_${new Date().getTime()}` };
            await faqsCollection.insertOne(newFaq);
            return createResponse(201, await faqsCollection.find({}).toArray());
        }
        if (event.httpMethod === 'PUT' && path.startsWith('/faq/')) {
            const faqId = path.split('/')[2];
            await faqsCollection.updateOne({ id: faqId }, { $set: body });
            return createResponse(200, await faqsCollection.find({}).toArray());
        }
        if (event.httpMethod === 'DELETE' && path.startsWith('/faq/')) {
            const faqId = path.split('/')[2];
            await faqsCollection.deleteOne({ id: faqId });
            return createResponse(200, await faqsCollection.find({}).toArray());
        }

        // UPLOAD media (logo or image)
        if (event.httpMethod === 'POST' && (path === '/logo' || path === '/images')) {
            const { file: dataUrl } = body;
            if (!dataUrl) return createResponse(400, { message: 'No file provided' });

            const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
            if (!matches) return createResponse(400, { message: 'Invalid file format' });
            
            const buffer = Buffer.from(matches[2], 'base64');
            const bucket = new GridFSBucket(db);
            const uploadStream = bucket.openUploadStream(`file-${Date.now()}`, { contentType: matches[1] });
            uploadStream.end(buffer);

            const fileId = await new Promise<ObjectId>((resolve, reject) => {
                uploadStream.on('finish', () => resolve(uploadStream.id));
                uploadStream.on('error', reject);
            });

            const mediaUrl = `/api/media/${fileId.toHexString()}`;

            if(path === '/logo') {
                await db.collection('config').updateOne({ key: 'logo' }, { $set: { value: mediaUrl } }, { upsert: true });
            }
            return createResponse(200, { url: mediaUrl });
        }

        // USER MANAGEMENT
        const usersCollection = db.collection<StoredUser>('users');
        if (event.httpMethod === 'GET' && path === '/users') {
            const users = await usersCollection.find({}).project({ password: 0 }).toArray();
            return createResponse(200, users);
        }
        if (event.httpMethod === 'POST' && path === '/users') {
            const { username, password } = body;
            if (!username || !password || password.length < 6) return createResponse(400, { message: 'Invalid user data' });
            if(await usersCollection.findOne({ username })) return createResponse(409, { message: 'User already exists' });
            const hashedPassword = bcrypt.hashSync(password, 10);
            await usersCollection.insertOne({ username, password: hashedPassword, role: 'user' });
            return createResponse(201, { message: 'User created' });
        }
        if (event.httpMethod === 'DELETE' && path.startsWith('/users/')) {
            const username = path.split('/')[2];
            if (username === user.username) return createResponse(400, { message: 'Cannot delete self' });
            await usersCollection.deleteOne({ username });
            return createResponse(200, { message: 'User deleted' });
        }

        return createResponse(404, { message: `Route ${event.httpMethod} ${path} not found.` });
    } catch (error) {
        console.error("API Error:", error);
        return createResponse(500, { message: 'Internal Server Error' });
    }
};

export { handler };