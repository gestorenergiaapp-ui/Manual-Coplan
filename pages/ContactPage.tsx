import React, { useState } from 'react';
import { useContent } from '../hooks/useContent';

const ContactPage: React.FC = () => {
    const { addSuggestion } = useContent();
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && department && message) {
            addSuggestion({ name, department, message });
            setName('');
            setDepartment('');
            setMessage('');
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 5000);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-4xl font-bold text-brand-dark mb-2 text-center">Contato</h1>
            <p className="text-center text-gray-600 mb-8">Tem alguma dúvida ou sugestão de melhoria para este manual? Use o formulário abaixo.</p>
            
            {submitted && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-lg" role="alert">
                    <p className="font-bold">Enviado com sucesso!</p>
                    <p>Obrigado pela sua contribuição.</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                    <input 
                        type="text" 
                        id="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
                    <input 
                        type="text" 
                        id="department" 
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Dúvida / Mensagem</label>
                    <textarea 
                        id="message" 
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                        required
                    ></textarea>
                </div>
                <div>
                    <button 
                        type="submit" 
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-opacity"
                    >
                        Enviar Mensagem
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactPage;