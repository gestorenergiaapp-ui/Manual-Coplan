import React, { createContext, useState, ReactNode, useCallback, useRef } from 'react';
import type { GoogleGenAI, Chat } from '@google/genai';
import { AIMessage } from '../types';

interface AIContextType {
  isAIChatOpen: boolean;
  messages: AIMessage[];
  isAILoading: boolean;
  openAIChat: (pageContext: string, sitemap: string) => void;
  closeAIChat: () => void;
  sendAIMessage: (message: string) => void;
}

export const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  
  const aiRef = useRef<GoogleGenAI | null>(null);
  const chatRef = useRef<Chat | null>(null);

  const openAIChat = useCallback(async (pageContext: string, sitemap: string) => {
    setIsAIChatOpen(true);
    setMessages([{ role: 'model', text: 'Olá! Sou seu assistente. Conectando...' }]);

    try {
      // Dynamically import the library ONLY when needed to prevent startup crashes.
      const { GoogleGenAI } = await import('@google/genai');
      
      let API_KEY: string | undefined;
      try {
        // This is the safest way to access environment variables that may not exist.
        // A simple `typeof process` check can sometimes be foiled by bundlers.
        API_KEY = process.env.API_KEY;
      } catch (e) {
        API_KEY = undefined;
      }
      
      if (!API_KEY) {
          const errorMsg = "A chave de API não foi configurada no ambiente. A funcionalidade do assistente de IA está desativada.";
          console.error(errorMsg);
          setMessages([{ role: 'model', text: errorMsg }]);
          return;
      }
      
      if (!aiRef.current) {
          aiRef.current = new GoogleGenAI({ apiKey: API_KEY });
      }

      const systemInstruction = `Você é um assistente prestativo especialista no conteúdo do manual da empresa. Sua tarefa é responder perguntas baseando-se ESTRICTAMENTE E SOMENTE no CONTEXTO da página atual. Não invente informações.
Se a resposta não estiver no contexto da página atual, verifique se a pergunta do usuário pode ser respondida por outra seção do manual, usando o MAPA DO SITE fornecido. Se encontrar uma seção relevante, sugira ao usuário que navegue até lá.
Se a resposta não estiver no contexto da página E não houver uma página relevante no mapa do site, responda educadamente que você não encontrou a informação e sugira que o usuário consulte a página de 'FAQ' ou 'Contato'.

CONTEXTO DA PÁGINA ATUAL:
---
${pageContext}
---

MAPA DO SITE:
---
${sitemap}
---`;

      chatRef.current = aiRef.current.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
        }
      });

      setMessages([
          { role: 'model', text: 'Olá! Sou seu assistente. Como posso ajudar com o conteúdo desta página?' }
      ]);
    } catch (error) {
      const errorMsg = "Não foi possível carregar o assistente de IA. Verifique a console para mais detalhes.";
      console.error(errorMsg, error);
      setMessages([{ role: 'model', text: errorMsg }]);
    }
  }, []);

  const closeAIChat = useCallback(() => {
    setIsAIChatOpen(false);
    setMessages([]);
    chatRef.current = null;
  }, []);

  const sendAIMessage = useCallback(async (message: string) => {
    if (!chatRef.current) return;

    setMessages(prev => [...prev, { role: 'user', text: message }]);
    setIsAILoading(true);
    
    try {
      const response = await chatRef.current.sendMessageStream({ message });
      let fullResponse = '';
      // Add a placeholder for the model's response
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of response) {
        fullResponse += chunk.text;
        // Update the last message (the model's response) in the array
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = fullResponse;
            return newMessages;
        });
      }

    } catch (error) {
      console.error('Error sending message to AI:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, ocorreu um erro ao processar sua solicitação.' }]);
    } finally {
      setIsAILoading(false);
    }
  }, []);

  return (
    <AIContext.Provider value={{ isAIChatOpen, messages, isAILoading, openAIChat, closeAIChat, sendAIMessage }}>
      {children}
    </AIContext.Provider>
  );
};