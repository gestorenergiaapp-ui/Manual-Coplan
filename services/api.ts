import { Page, FaqItem, StoredUser, ContentBlock, ContentType, SearchResult } from '../types';
import { INITIAL_PAGES } from '../data/content';
import { INITIAL_FAQS } from '../data/content';
import { DUMMY_USERS } from '../data/users';

// --- STORAGE KEYS ---
const DB_INITIALIZED_KEY = 'db_initialized';
const DB_PAGES_KEY = 'db_pages';
const DB_FAQS_KEY = 'db_faqs';
const DB_USERS_KEY = 'db_users';
const DB_LOGO_KEY = 'db_logo';
const DB_CURRENT_USER_KEY = 'db_current_user';

// --- ASYNC SIMULATION ---
const asyncDelay = (ms: number = 100) => new Promise(res => setTimeout(res, ms));

// --- HELPERS ---
const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const setInStorage = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

// Recursive helper to find and update a page immutably
const findAndUpdatePage = (pages: Page[], path: string[], action: (page: Page) => Page): Page[] => {
  return pages.map(p => {
    if (p.id === path[0]) {
      if (path.length === 1) {
        return action(p);
      }
      if (p.children) {
        return { ...p, children: findAndUpdatePage(p.children, path.slice(1), action) };
      }
    }
    return p;
  });
};

// Recursive helper to find and delete a page immutably
const findAndDeletePage = (pages: Page[], path: string[]): Page[] => {
    if (path.length === 1) {
        return pages.filter(p => p.id !== path[0]);
    }
    return pages.map(p => {
        if (p.id === path[0] && p.children) {
            return { ...p, children: findAndDeletePage(p.children, path.slice(1)) };
        }
        return p;
    });
}

// --- API FUNCTIONS ---

/**
 * Seeds the localStorage database with initial data if it hasn't been done before.
 */
export const initializeDatabase = () => {
    const isInitialized = getFromStorage(DB_INITIALIZED_KEY, false);
    if (!isInitialized) {
        console.log('Initializing local database...');
        setInStorage(DB_PAGES_KEY, INITIAL_PAGES);
        setInStorage(DB_FAQS_KEY, INITIAL_FAQS);
        setInStorage(DB_USERS_KEY, DUMMY_USERS);
        setInStorage(DB_LOGO_KEY, null);
        setInStorage(DB_INITIALIZED_KEY, true);
    }
};

// --- CONTENT API ---

export const getPages = async (): Promise<Page[]> => {
    await asyncDelay();
    return getFromStorage<Page[]>(DB_PAGES_KEY, []);
};

export const getFaqs = async (): Promise<FaqItem[]> => {
    await asyncDelay();
    return getFromStorage<FaqItem[]>(DB_FAQS_KEY, []);
};

export const getLogo = async (): Promise<string | null> => {
    await asyncDelay();
    return getFromStorage<string | null>(DB_LOGO_KEY, null);
};

export const updateLogo = async (url: string | null): Promise<void> => {
    await asyncDelay();
    setInStorage(DB_LOGO_KEY, url);
};

export const updatePageContent = async (path: string[], newContent: ContentBlock[]): Promise<Page[]> => {
    await asyncDelay();
    const currentPages = await getPages();
    const action = (page: Page): Page => ({ ...page, content: newContent });
    const updatedPages = findAndUpdatePage(currentPages, path, action);
    setInStorage(DB_PAGES_KEY, updatedPages);
    return updatedPages;
};

export const addPage = async (parentPath: string[] | null, title: string, icon: string): Promise<Page[]> => {
    await asyncDelay();
    const currentPages = await getPages();
    const newPage: Page = {
        id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `_${new Date().getTime()}`,
        title,
        icon,
        content: [
            { id: `c_${new Date().getTime()}`, type: ContentType.H1, content: title },
            { id: `c_${new Date().getTime()+1}`, type: ContentType.P, content: 'Adicione seu conteúdo aqui.' }
        ]
    };

    let updatedPages;
    if (parentPath === null) {
        const specialPagesIds = ['faq', 'contato'];
        const regularPages = currentPages.filter(p => !specialPagesIds.includes(p.id));
        const specialPages = currentPages.filter(p => specialPagesIds.includes(p.id));
        updatedPages = [...regularPages, newPage, ...specialPages];
    } else {
        const action = (page: Page): Page => ({
            ...page,
            children: [...(page.children || []), newPage],
        });
        updatedPages = findAndUpdatePage(currentPages, parentPath, action);
    }
    setInStorage(DB_PAGES_KEY, updatedPages);
    return updatedPages;
};

export const updatePageDetails = async (path: string[], newTitle: string, newIcon: string): Promise<Page[]> => {
    await asyncDelay();
    const currentPages = await getPages();
    const action = (page: Page): Page => ({ ...page, title: newTitle, icon: newIcon });
    const updatedPages = findAndUpdatePage(currentPages, path, action);
    setInStorage(DB_PAGES_KEY, updatedPages);
    return updatedPages;
}

export const deletePage = async (path: string[]): Promise<Page[]> => {
    await asyncDelay();
    const currentPages = await getPages();
    const updatedPages = findAndDeletePage(currentPages, path);
    setInStorage(DB_PAGES_KEY, updatedPages);
    return updatedPages;
}

export const addContentBlock = async (path: string[], blockType: ContentType): Promise<Page[]> => {
    await asyncDelay();
    const currentPages = await getPages();
    const newBlock: ContentBlock = {
        id: `block_${new Date().getTime()}`,
        type: blockType,
        content: ''
    };
    switch(blockType) {
        case ContentType.H1: newBlock.content = "Novo Título 1"; break;
        case ContentType.H2: newBlock.content = "Novo Título 2"; break;
        case ContentType.P: newBlock.content = "Novo parágrafo."; break;
        case ContentType.UL:
        case ContentType.OL: newBlock.content = ["Novo item"]; break;
        case ContentType.IMAGE: newBlock.content = ""; break;
        case ContentType.ALERT_INFO: newBlock.content = "Nova informação."; break;
        case ContentType.ALERT_WARNING: newBlock.content = "Novo aviso."; break;
    }
    const action = (page: Page): Page => ({ ...page, content: [...(page.content || []), newBlock] });
    const updatedPages = findAndUpdatePage(currentPages, path, action);
    setInStorage(DB_PAGES_KEY, updatedPages);
    return updatedPages;
}

export const moveContentBlock = async (path: string[], blockId: string, direction: 'up' | 'down'): Promise<Page[]> => {
    await asyncDelay();
    const currentPages = await getPages();
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
    const updatedPages = findAndUpdatePage(currentPages, path, action);
    setInStorage(DB_PAGES_KEY, updatedPages);
    return updatedPages;
}

export const addFaq = async (faq: Omit<FaqItem, 'id'>): Promise<FaqItem[]> => {
    await asyncDelay();
    const faqs = await getFaqs();
    const newFaq = { ...faq, id: `faq_${new Date().getTime()}` };
    const updatedFaqs = [...faqs, newFaq];
    setInStorage(DB_FAQS_KEY, updatedFaqs);
    return updatedFaqs;
};

export const deleteFaq = async (faqId: string): Promise<FaqItem[]> => {
    await asyncDelay();
    const faqs = await getFaqs();
    const updatedFaqs = faqs.filter(f => f.id !== faqId);
    setInStorage(DB_FAQS_KEY, updatedFaqs);
    return updatedFaqs;
};

export const updateFaq = async (faqId: string, data: { question: string, answer: string }): Promise<FaqItem[]> => {
    await asyncDelay();
    const faqs = await getFaqs();
    const updatedFaqs = faqs.map(f => f.id === faqId ? { ...f, ...data } : f);
    setInStorage(DB_FAQS_KEY, updatedFaqs);
    return updatedFaqs;
};

// --- AUTH API ---

export const getUsers = async (): Promise<StoredUser[]> => {
    await asyncDelay();
    return getFromStorage<StoredUser[]>(DB_USERS_KEY, []);
};

export const getCurrentUser = async (): Promise<Omit<StoredUser, 'password'> | null> => {
    await asyncDelay(50);
    return getFromStorage<Omit<StoredUser, 'password'> | null>(DB_CURRENT_USER_KEY, null);
};

export const loginUser = async (username: string, pass: string): Promise<Omit<StoredUser, 'password'> | null> => {
    await asyncDelay();
    const users = await getUsers();
    const user = users.find(u => u.username === username && u.password === pass);
    if (user) {
        const { password, ...userToAuth } = user;
        setInStorage(DB_CURRENT_USER_KEY, userToAuth);
        return userToAuth;
    }
    return null;
};

export const logoutUser = async (): Promise<void> => {
    await asyncDelay(50);
    localStorage.removeItem(DB_CURRENT_USER_KEY);
};

export const addUser = async (user: Pick<StoredUser, 'username' | 'password'>): Promise<{ success: boolean, message: string }> => {
    await asyncDelay();
    const users = await getUsers();
    if (users.some(u => u.username === user.username)) {
        return { success: false, message: 'Nome de usuário já existe.' };
    }
    const newUser: StoredUser = { ...user, role: 'user'};
    setInStorage(DB_USERS_KEY, [...users, newUser]);
    return { success: true, message: 'Usuário adicionado com sucesso!' };
};

export const deleteUser = async (username: string): Promise<void> => {
    await asyncDelay();
    const users = await getUsers();
    setInStorage(DB_USERS_KEY, users.filter(u => u.username !== username));
};

export const changePassword = async (username: string, oldPass: string, newPass: string): Promise<boolean> => {
    await asyncDelay();
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.username === username && u.password === oldPass);
    if (userIndex !== -1) {
        const updatedUsers = [...users];
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPass };
        setInStorage(DB_USERS_KEY, updatedUsers);
        return true;
    }
    return false;
};

// --- SEARCH API ---

const createSnippet = (text: string, term: string, regex: RegExp): string => {
    const index = text.toLowerCase().indexOf(term);
    if (index === -1) return '';

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + term.length + 50);
    let snippet = text.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet.replace(regex, '<mark class="bg-yellow-200">$&</mark>');
}

export const searchContent = async (query: string): Promise<SearchResult[]> => {
    await asyncDelay(200);
    if (!query) return [];
    
    const results: SearchResult[] = [];
    const term = query.toLowerCase();
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    const pages = await getPages();
    const faqs = await getFaqs();

    // Search Pages
    const searchInPages = (pageList: Page[], currentPath: string[], currentPathTitles: string[]) => {
        for (const page of pageList) {
            const newPath = [...currentPath, page.id];
            const newPathTitles = [...currentPathTitles, page.title];

            // Match in Title
            if (page.title.toLowerCase().includes(term)) {
                results.push({
                    type: 'Page',
                    id: page.id,
                    title: page.title.replace(regex, '<mark class="bg-yellow-200">$&</mark>'),
                    path: newPath,
                    pathTitles: newPathTitles,
                    snippet: 'Correspondência encontrada no título da página.'
                });
            }

            // Match in Content
            if (page.content) {
                for (const block of page.content) {
                    const contentString = Array.isArray(block.content) ? block.content.join(' ') : block.content;
                    if (contentString && contentString.toLowerCase().includes(term)) {
                        // Avoid duplicate page results if title already matched
                        if (!results.some(r => r.type === 'Page' && r.id === page.id)) {
                             results.push({
                                type: 'Page',
                                id: page.id,
                                title: page.title,
                                path: newPath,
                                pathTitles: newPathTitles,
                                snippet: createSnippet(contentString, term, regex)
                            });
                        }
                    }
                }
            }

            if (page.children) {
                searchInPages(page.children, newPath, newPathTitles);
            }
        }
    };
    searchInPages(pages, [], []);

    // Search FAQs
    for (const faq of faqs) {
        let snippet = '';
        let title = faq.question;
        let matched = false;

        if (faq.question.toLowerCase().includes(term)) {
            title = faq.question.replace(regex, '<mark class="bg-yellow-200">$&</mark>');
            snippet = createSnippet(faq.answer, term, regex) || 'Correspondência encontrada na pergunta.';
            matched = true;
        } else if (faq.answer.toLowerCase().includes(term)) {
            snippet = createSnippet(faq.answer, term, regex);
            matched = true;
        }

        if (matched) {
             results.push({
                type: 'FAQ',
                id: faq.id,
                title,
                path: ['faq'],
                pathTitles: ['FAQ'],
                snippet
            });
        }
    }
    
    return results;
};