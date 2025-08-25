
import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Page, FaqItem, Suggestion, ContentBlock, ContentType } from '../types';
import * as api from '../services/api';

interface ContentContextType {
  pages: Page[];
  faqs: FaqItem[];
  suggestions: Suggestion[];
  logoUrl: string | null;
  loading: boolean;
  updateLogo: (url: string | null) => Promise<void>;
  updatePageContent: (path: string[], newContent: ContentBlock[]) => Promise<void>;
  addSuggestion: (suggestion: Omit<Suggestion, 'id' | 'timestamp'>) => void;
  updateFaq: (faqId: string, question: string, answer: string) => Promise<void>;
  addPage: (parentId: string | null, title: string) => Promise<void>;
  updatePageTitle: (path: string[], newTitle: string) => Promise<void>;
  deletePage: (path: string[]) => Promise<void>;
  addContentBlock: (path: string[], blockType: ContentType) => Promise<void>;
  moveContentBlock: (path: string[], blockId: string, direction: 'up' | 'down') => Promise<void>;
  addFaq: (faq: Omit<FaqItem, 'id'>) => Promise<void>;
  deleteFaq: (faqId: string) => Promise<void>;
}

export const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
        const [pagesData, faqsData, logoData] = await Promise.all([
            api.getPages(),
            api.getFaqs(),
            api.getLogo()
        ]);
        setPages(pagesData);
        setFaqs(faqsData);
        setLogoUrl(logoData);
    } catch (error) {
        console.error("Failed to fetch initial content data:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateLogo = useCallback(async (url: string | null) => {
    await api.updateLogo(url);
    await fetchData();
  }, [fetchData]);

  const updatePageContent = useCallback(async (path: string[], newContent: ContentBlock[]) => {
    await api.updatePageContent(path, newContent);
    await fetchData();
  }, [fetchData]);

  const updateFaq = useCallback(async (faqId: string, question: string, answer: string) => {
    await api.updateFaq(faqId, { question, answer });
    await fetchData();
  }, [fetchData]);

  const addSuggestion = useCallback((suggestion: Omit<Suggestion, 'id' | 'timestamp'>) => {
    // Suggestions remain session-based and don't need to be persisted in this version
    const newSuggestion: Suggestion = {
      ...suggestion,
      id: `sug_${new Date().getTime()}`,
      timestamp: new Date().toISOString(),
    };
    setSuggestions(prev => [newSuggestion, ...prev]);
  }, []);

  const addPage = useCallback(async (parentId: string | null, title: string) => {
    await api.addPage(parentId, title);
    await fetchData();
  }, [fetchData]);
  
  const updatePageTitle = useCallback(async (path: string[], newTitle: string) => {
    await api.updatePageTitle(path, newTitle);
    await fetchData();
  }, [fetchData]);

  const deletePage = useCallback(async (path: string[]) => {
      await api.deletePage(path);
      await fetchData();
  }, [fetchData]);

  const addContentBlock = useCallback(async (path: string[], blockType: ContentType) => {
      await api.addContentBlock(path, blockType);
      await fetchData();
  }, [fetchData]);

  const moveContentBlock = useCallback(async (path: string[], blockId: string, direction: 'up' | 'down') => {
      await api.moveContentBlock(path, blockId, direction);
      await fetchData();
  }, [fetchData]);

  const addFaq = useCallback(async (faq: Omit<FaqItem, 'id'>) => {
    await api.addFaq(faq);
    await fetchData();
  }, [fetchData]);

  const deleteFaq = useCallback(async (faqId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta pergunta?')) {
        await api.deleteFaq(faqId);
        await fetchData();
    }
  }, [fetchData]);


  return (
    <ContentContext.Provider value={{ pages, faqs, suggestions, logoUrl, loading, updateLogo, updatePageContent, addSuggestion, updateFaq, addPage, updatePageTitle, deletePage, addContentBlock, moveContentBlock, addFaq, deleteFaq }}>
      {children}
    </ContentContext.Provider>
  );
};