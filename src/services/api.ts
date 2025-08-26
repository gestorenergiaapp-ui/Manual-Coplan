import { Page, FaqItem, StoredUser, ContentBlock, ContentType, SearchResult, Suggestion } from '../types';

// --- API HELPERS ---
const apiFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`/api${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    if (response.status === 204) {
        return null as T;
    }
    return response.json();
};


// --- CONTENT API ---
export const getContent = async (): Promise<{ pages: Page[], faqs: FaqItem[], logoUrl: string | null }> => {
    return apiFetch('/content');
};

export const uploadLogo = async (file: File): Promise<{ url: string }> => {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>(resolve => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });
    return apiFetch('/logo', {
        method: 'POST',
        body: JSON.stringify({ file: dataUrl })
    });
}

export const uploadImage = async (file: File): Promise<{ url: string }> => {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>(resolve => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });
    return apiFetch('/images', {
        method: 'POST',
        body: JSON.stringify({ file: dataUrl })
    });
}

export const updatePageContent = (path: string[], newContent: ContentBlock[]): Promise<Page[]> => {
    return apiFetch('/page/content', { method: 'PATCH', body: JSON.stringify({ path, content: newContent }) });
};

export const addPage = (parentPath: string[] | null, title: string, icon: string): Promise<Page[]> => {
    return apiFetch('/page', { method: 'POST', body: JSON.stringify({ parentPath, title, icon }) });
};

export const updatePageDetails = (path: string[], newTitle: string, newIcon: string): Promise<Page[]> => {
    return apiFetch('/page/details', { method: 'PATCH', body: JSON.stringify({ path, title: newTitle, icon: newIcon }) });
}

export const deletePage = (path: string[]): Promise<Page[]> => {
    return apiFetch('/page', { method: 'DELETE', body: JSON.stringify({ path }) });
}

export const addContentBlock = (path: string[], blockType: ContentType): Promise<Page[]> => {
    return apiFetch('/page/block', { method: 'POST', body: JSON.stringify({ path, blockType }) });
}

export const moveContentBlock = (path: string[], blockId: string, direction: 'up' | 'down'): Promise<Page[]> => {
    return apiFetch('/page/block/move', { method: 'PATCH', body: JSON.stringify({ path, blockId, direction }) });
}

export const addFaq = (faq: Omit<FaqItem, 'id'>): Promise<FaqItem[]> => {
    return apiFetch('/faq', { method: 'POST', body: JSON.stringify(faq) });
};

export const deleteFaq = (faqId: string): Promise<FaqItem[]> => {
    return apiFetch(`/faq/${faqId}`, { method: 'DELETE' });
};

export const updateFaq = (faqId: string, data: { question: string, answer: string }): Promise<FaqItem[]> => {
    return apiFetch(`/faq/${faqId}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const getSuggestions = async (): Promise<Suggestion[]> => {
    return apiFetch('/suggestions');
};

export const addSuggestion = async (suggestion: Omit<Suggestion, 'id' | 'timestamp'>): Promise<Suggestion> => {
    return apiFetch('/suggestions', { method: 'POST', body: JSON.stringify(suggestion) });
};


// --- AUTH API ---
export const getUsers = async (): Promise<StoredUser[]> => {
    return apiFetch('/users');
};

export const getCurrentUser = async (): Promise<Omit<StoredUser, 'password'> | null> => {
    return apiFetch('/current-user');
};

export const loginUser = async (username: string, password: string): Promise<Omit<StoredUser, 'password'> | null> => {
    return apiFetch('/login', { method: 'POST', body: JSON.stringify({ username, password }) });
};

export const logoutUser = async (): Promise<void> => {
    await apiFetch('/logout', { method: 'POST' });
};

export const addUser = async (user: Pick<StoredUser, 'username' | 'password'>): Promise<{ success: boolean, message: string }> => {
    try {
        await apiFetch('/users', { method: 'POST', body: JSON.stringify(user) });
        return { success: true, message: 'Usuário adicionado com sucesso!' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

export const deleteUser = async (username: string): Promise<void> => {
    await apiFetch(`/users/${username}`, { method: 'DELETE' });
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
        await apiFetch('/change-password', { method: 'POST', body: JSON.stringify({ oldPassword, newPassword }) });
        return true;
    } catch {
        return false;
    }
};

// --- SEARCH API ---
// This remains a frontend implementation for simplicity, as it reads from the already-fetched content state.
// A backend implementation would be more scalable for large amounts of content.
export const searchContent = async (pages: Page[], faqs: FaqItem[], query: string): Promise<SearchResult[]> => {
    if (!query) return [];
    
    const results: SearchResult[] = [];
    const term = query.toLowerCase();
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    
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

    // Search Pages
    const searchInPages = (pageList: Page[], currentPath: string[], currentPathTitles: string[]) => {
        for (const page of pageList) {
            const newPath = [...currentPath, page.id];
            const newPathTitles = [...currentPathTitles, page.title];

            if (page.title.toLowerCase().includes(term)) {
                results.push({
                    type: 'Page', id: page.id, title: page.title.replace(regex, '<mark class="bg-yellow-200">$&</mark>'),
                    path: newPath, pathTitles: newPathTitles, snippet: 'Correspondência encontrada no título da página.'
                });
            }

            if (page.content) {
                for (const block of page.content) {
                    const contentString = Array.isArray(block.content) ? block.content.join(' ') : String(block.content);
                    if (contentString && contentString.toLowerCase().includes(term)) {
                        if (!results.some(r => r.type === 'Page' && r.id === page.id)) {
                             results.push({
                                type: 'Page', id: page.id, title: page.title, path: newPath,
                                pathTitles: newPathTitles, snippet: createSnippet(contentString, term, regex)
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
        if (faq.question.toLowerCase().includes(term) || faq.answer.toLowerCase().includes(term)) {
             results.push({
                type: 'FAQ', id: faq.id, title: faq.question.replace(regex, '<mark class="bg-yellow-200">$&</mark>'),
                path: ['faq'], pathTitles: ['FAQ'], snippet: createSnippet(faq.answer, term, regex)
            });
        }
    }
    
    return results;
};