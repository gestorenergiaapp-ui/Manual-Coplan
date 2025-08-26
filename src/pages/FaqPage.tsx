import React, { useState } from 'react';
import { useContent } from '../hooks/useContent';
import { useAuth } from '../hooks/useAuth';
import { ChevronDownIcon, PencilIcon, CheckIcon, XMarkIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/solid';

const AddFaqForm: React.FC<{onAdd: (q: string, a: string) => void}> = ({ onAdd }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question && answer) {
            onAdd(question, answer);
            setQuestion('');
            setAnswer('');
            setIsOpen(false);
        }
    }

    if (!isOpen) {
        return (
            <div className="text-center mt-8 pt-6 border-t">
                <button onClick={() => setIsOpen(true)} className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-md hover:opacity-90">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Adicionar Nova Pergunta
                </button>
            </div>
        )
    }

    return (
        <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4 text-center">Adicionar Nova Pergunta</h2>
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                 <div>
                    <label className="font-bold text-gray-700">Pergunta:</label>
                    <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} required className="w-full mt-1 p-2 border rounded"/>
                </div>
                <div>
                    <label className="font-bold text-gray-700">Resposta:</label>
                    <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} required className="w-full mt-1 p-2 border rounded" rows={4}></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                     <button type="submit" className="p-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"><CheckIcon className="h-5 w-5 mr-1" /> Adicionar</button>
                     <button type="button" onClick={() => setIsOpen(false)} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center"><XMarkIcon className="h-5 w-5 mr-1" /> Cancelar</button>
                </div>
            </form>
        </div>
    )
}


const FaqPage: React.FC = () => {
    const { faqs, updateFaq, addFaq, deleteFaq } = useContent();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    const handleAddFaq = (question: string, answer: string) => {
        addFaq({ question, answer });
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-4xl font-bold text-brand-dark mb-8 text-center">Perguntas Frequentes (FAQ)</h1>
            <div className="space-y-4">
                {faqs.map((faq) => (
                    <FaqItemComponent 
                        key={faq.id} 
                        faq={faq} 
                        isAdmin={isAdmin}
                        onUpdate={updateFaq}
                        onDelete={deleteFaq}
                    />
                ))}
            </div>
            {isAdmin && <AddFaqForm onAdd={handleAddFaq} />}
        </div>
    );
};

interface FaqItemComponentProps {
    faq: { id: string, question: string, answer: string };
    isAdmin: boolean;
    onUpdate: (id: string, question: string, answer: string) => void;
    onDelete: (id: string) => void;
}

const FaqItemComponent: React.FC<FaqItemComponentProps> = ({ faq, isAdmin, onUpdate, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedQuestion, setEditedQuestion] = useState(faq.question);
    const [editedAnswer, setEditedAnswer] = useState(faq.answer);

    const handleSave = () => {
        onUpdate(faq.id, editedQuestion, editedAnswer);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setEditedQuestion(faq.question);
        setEditedAnswer(faq.answer);
        setIsEditing(false);
    }

    if (isEditing) {
        return (
             <div className="border border-brand-accent border-dashed rounded-lg p-4">
                <div className="space-y-2">
                    <label className="font-bold text-gray-700">Pergunta:</label>
                    <input type="text" value={editedQuestion} onChange={(e) => setEditedQuestion(e.target.value)} className="w-full p-2 border rounded"/>
                    <label className="font-bold text-gray-700">Resposta:</label>
                    <textarea value={editedAnswer} onChange={(e) => setEditedAnswer(e.target.value)} className="w-full p-2 border rounded" rows={4}></textarea>
                </div>
                <div className="flex justify-end space-x-2 mt-2">
                     <button onClick={handleSave} className="p-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"><CheckIcon className="h-5 w-5 mr-1" /> Salvar</button>
                     <button onClick={handleCancel} className="p-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"><XMarkIcon className="h-5 w-5 mr-1" /> Cancelar</button>
                </div>
            </div>
        )
    }

    return (
        <div className="border border-gray-200 rounded-lg group">
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex justify-between items-center p-4 text-left font-semibold text-brand-primary focus:outline-none"
                >
                    <span>{faq.question}</span>
                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isAdmin && (
                    <div className="absolute top-2 right-10 flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setIsEditing(true)} className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 mr-1">
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDelete(faq.id)} className="p-1 bg-gray-200 text-red-500 rounded hover:bg-gray-300">
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 text-gray-600">
                    <p className="whitespace-pre-wrap">{faq.answer}</p>
                </div>
            )}
        </div>
    );
};

export default FaqPage;