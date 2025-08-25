
import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../hooks/useContent';

const HomePage: React.FC = () => {
    const { pages } = useContent();
    const quickLinks = [
        pages.find(p => p.id === 'diretrizes')?.children?.[0], // Etica
        pages.find(p => p.id === 'faturamento')?.children?.[0], // Pedido Venda
        pages.find(p => p.id === 'faq')
    ].filter(Boolean);

    return (
        <div className="animate-fade-in text-center p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-4xl md:text-5xl font-extrabold text-brand-primary mb-4">Bem-vindo ao Manual de Diretrizes</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Seu guia central para todos os processos e procedimentos da empresa. Utilize o menu lateral para navegar ou a busca para encontrar o que precisa.
            </p>
            <div className="border-t pt-8">
                 <h2 className="text-2xl font-bold text-brand-secondary mb-6">Acesso Rápido</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickLinks.map(page => page && (
                         <Link 
                            key={page.id} 
                            to={page.children ? `/page/${pages.find(p => p.children?.some(c => c.id === page.id))?.id}/${page.id}` : `/${page.id}`} 
                            className="block p-6 bg-brand-light hover:bg-brand-accent/20 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-center mb-3">
                                {page.icon && page.icon({className: "h-10 w-10 text-brand-accent"})}
                            </div>
                            <h3 className="text-xl font-semibold text-brand-primary">{page.title}</h3>
                        </Link>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default HomePage;
