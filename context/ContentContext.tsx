import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Page, FaqItem, Suggestion, ContentBlock, ContentType } from '../types';
import * as api from '../services/api';

interface ContentContextType {
  pages: Page[];
  faqs: FaqItem[];
  logoUrl: string | null;
  loading: boolean;
  updateLogo: (file: File) => Promise<void>;
  updatePageContent: (path: string[], newContent: ContentBlock[]) => Promise<void>;
  updateFaq: (faqId: string, question: string, answer: string) => Promise<void>;
  addPage: (parentPath: string[] | null, title: string, icon: string) => Promise<void>;
  updatePageDetails: (path: string[], newTitle: string, newIcon: string) => Promise<void>;
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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
          const contentData = await api.getContent();
          setPages(contentData.pages);
          setFaqs(contentData.faqs);
          setLogoUrl(contentData.logoUrl);
      } catch (error) {
          console.error("Failed to fetch initial content data:", error);
      } finally {
          setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updatePagesState = useCallback(async (updateFn: () => Promise<Page[]>) => {
      const updatedPages = await updateFn();
      setPages(updatedPages);
  }, []);
  
  const updateFaqsState = useCallback(async (updateFn: () => Promise<FaqItem[]>) => {
      const updatedFaqs = await updateFn();
      setFaqs(updatedFaqs);
  }, []);

  const updateLogo = useCallback(async (file: File) => {
    const { url } = await api.uploadLogo(file);
    setLogoUrl(url);
  }, []);

  const updatePageContent = useCallback((path: string[], newContent: ContentBlock[]) => {
    return updatePagesState(() => api.updatePageContent(path, newContent));
  }, [updatePagesState]);

  const addPage = useCallback((parentPath: string[] | null, title: string, icon: string) => {
    return updatePagesState(() => api.addPage(parentPath, title, icon));
  }, [updatePagesState]);

  const updatePageDetails = useCallback((path: string[], newTitle: string, newIcon: string) => {
    return updatePagesState(() => api.updatePageDetails(path, newTitle, newIcon));
  }, [updatePagesState]);

  const deletePage = useCallback((path: string[]) => {
    return updatePagesState(() => api.deletePage(path));
  }, [updatePagesState]);

  const addContentBlock = useCallback((path: string[], blockType: ContentType) => {
    return updatePagesState(() => api.addContentBlock(path, blockType));
  }, [updatePagesState]);

  const moveContentBlock = useCallback((path: string[], blockId: string, direction: 'up' | 'down') => {
    return updatePagesState(() => api.moveContentBlock(path, blockId, direction));
  }, [updatePagesState]);

  const updateFaq = useCallback((faqId: string, question: string, answer: string) => {
    return updateFaqsState(() => api.updateFaq(faqId, { question, answer }));
  }, [updateFaqsState]);

  const addFaq = useCallback((faq: Omit<FaqItem, 'id'>) => {
    return updateFaqsState(() => api.addFaq(faq));
  }, [updateFaqsState]);

  const deleteFaq = useCallback((faqId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta pergunta?')) {
        return updateFaqsState(() => api.deleteFaq(faqId));
    }
    return Promise.resolve();
  }, [updateFaqsState]);

  return (
    <ContentContext.Provider value={{ pages, faqs, logoUrl, loading, updateLogo, updatePageContent, updateFaq, addPage, updatePageDetails, deletePage, addContentBlock, moveContentBlock, addFaq, deleteFaq }}>
      {children}
    </ContentContext.Provider>
  );
};