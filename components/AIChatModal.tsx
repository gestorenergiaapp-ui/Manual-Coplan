import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../hooks/useAI';
import { marked } from 'marked';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';

const AIChatModal: React.FC = () => {
    const { isAIChatOpen, messages, isAILoading, closeAIChat, sendAIMessage } = useAI();
    const [userInput, setUserInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages, isAILoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim() && !isAILoading) {
            sendAIMessage(userInput);
            setUserInput('');
        }
    };

    if (!isAIChatOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-end sm:items-center animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-2xl h-[80vh] sm:h-[70vh] flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center">
                        <SparklesIcon className="h-6 w-6 text-brand-secondary mr-2" />
                        <h2 className="text-lg font-semibold text-brand-dark">Assistente Inteligente</h2>
                    </div>
                    <button onClick={closeAIChat} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </header>

                {/* Messages */}
                <main className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-prose p-3 rounded-lg ${
                                    msg.role === 'user'
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-brand-light text-brand-dark'
                                }`}
                            >
                                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                            </div>
                        </div>
                    ))}
                    {isAILoading && (
                        <div className="flex justify-start">
                            <div className="bg-brand-light p-3 rounded-lg flex items-center space-x-2">
                                <span className="h-2 w-2 bg-brand-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-brand-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-brand-secondary rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                {/* Input */}
                <footer className="p-4 border-t">
                    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Pergunte algo sobre esta página..."
                            className="flex-1 w-full px-4 py-2 border rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                            disabled={isAILoading}
                        />
                        <button type="submit" disabled={isAILoading || !userInput.trim()} className="bg-brand-secondary text-white p-3 rounded-full hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default AIChatModal;
