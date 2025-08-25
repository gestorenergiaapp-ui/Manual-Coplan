
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as api from '../services/api';
import { SearchResult } from '../types';
import { DocumentTextIcon, QuestionMarkCircleIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            if (!query) {
                setResults([]);
                return;
            }
            setLoading(true);
            const searchResults = await api.searchContent(query);
            setResults(searchResults);
            setLoading(false);
        };

        performSearch();
    }, [query]);

    const getResultUrl = (result: SearchResult) => {
        if (result.type === 'FAQ') {
            return `/faq`;
        }
        return `/page/${result.path.join('/')}`;
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-brand-dark mb-4">
                Resultados da Busca por: <span className="text-brand-secondary">"{query}"</span>
            </h1>

            {loading && (
                 <div className="text-center p-8">
                    <p className="text-gray-600">Buscando...</p>
                </div>
            )}

            {!loading && results.length === 0 && (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700">Nenhum resultado encontrado.</h2>
                    <p className="text-gray-500 mt-2">Tente refinar seus termos de busca ou navegue pelo menu lateral.</p>
                </div>
            )}

            {!loading && results.length > 0 && (
                <div className="space-y-4">
                    {results.map((result, index) => (
                        <Link to={getResultUrl(result)} key={`${result.id}-${index}`} className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:border-brand-secondary border border-transparent transition-all duration-300">
                           <div className="flex items-start space-x-4">
                               <div className="flex-shrink-0">
                                   {result.type === 'Page' 
                                     ? <DocumentTextIcon className="h-8 w-8 text-brand-primary" />
                                     : <QuestionMarkCircleIcon className="h-8 w-8 text-brand-secondary" />
                                   }
                               </div>
                               <div>
                                   <div className="flex items-center text-sm text-gray-500 mb-1">
                                       {result.pathTitles.map((title, i) => (
                                           <React.Fragment key={i}>
                                                <span>{title}</span>
                                                {i < result.pathTitles.length -1 && <ChevronRightIcon className="h-3 w-3 mx-1"/>}
                                           </React.Fragment>
                                       ))}
                                   </div>
                                   <h2 className="text-xl font-semibold text-brand-dark mb-2" dangerouslySetInnerHTML={{ __html: result.title }} />
                                   <p className="text-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: result.snippet }} />
                               </div>
                           </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchPage;