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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
    };
    fetchData();
  }, []);

  const updateLogo = useCallback(async (url: string | null) => {
    await api.updateLogo(url);
    setLogoUrl(url);
  }, []);

  const updatePageContent = useCallback(async (path: string[], newContent: ContentBlock[]) => {
    const updatedPages = await api.updatePageContent(path, newContent);
    setPages(updatedPages);
  }, []);

  const updateFaq = useCallback(async (faqId: string, question: string, answer: string) => {
    const updatedFaqs = await api.updateFaq(faqId, { question, answer });
    setFaqs(updatedFaqs);
  }, []);

  const addSuggestion = useCallback((suggestion: Omit<Suggestion, 'id' | 'timestamp'>) => {
    // Suggestions remain session-based
    const newSuggestion: Suggestion = {
      ...suggestion,
      id: `sug_${new Date().getTime()}`,
      timestamp: new Date().toISOString(),
    };
    setSuggestions(prev => [newSuggestion, ...prev]);
  }, []);

  const addPage = useCallback(async (parentPath: string[] | null, title: string, icon: string) => {
    const updatedPages = await api.addPage(parentPath, title, icon);
    setPages(updatedPages);
  }, []);
  
  const updatePageDetails = useCallback(async (path: string[], newTitle: string, newIcon: string) => {
    const updatedPages = await api.updatePageDetails(path, newTitle, newIcon);
    setPages(updatedPages);
  }, []);

  const deletePage = useCallback(async (path: string[]) => {
      const updatedPages = await api.deletePage(path);
      setPages(updatedPages);
  }, []);

  const addContentBlock = useCallback(async (path: string[], blockType: ContentType) => {
      const updatedPages = await api.addContentBlock(path, blockType);
      setPages(updatedPages);
  }, []);

  const moveContentBlock = useCallback(async (path: string[], blockId: string, direction: 'up' | 'down') => {
      const updatedPages = await api.moveContentBlock(path, blockId, direction);
      setPages(updatedPages);
  }, []);

  const addFaq = useCallback(async (faq: Omit<FaqItem, 'id'>) => {
    const updatedFaqs = await api.addFaq(faq);
    setFaqs(updatedFaqs);
  }, []);

  const deleteFaq = useCallback(async (faqId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta pergunta?')) {
        const updatedFaqs = await api.deleteFaq(faqId);
        setFaqs(updatedFaqs);
    }
  }, []);


  return (
    <ContentContext.Provider value={{ pages, faqs, suggestions, logoUrl, loading, updateLogo, updatePageContent, addSuggestion, updateFaq, addPage, updatePageDetails, deletePage, addContentBlock, moveContentBlock, addFaq, deleteFaq }}>
      {children}
    </ContentContext.Provider>
  );
};