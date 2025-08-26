import React from 'react';
import { useParams } from 'react-router-dom';
import { useContent } from '../hooks/useContent';
import { useAuth } from '../hooks/useAuth';
import { Page, ContentBlock, ContentType } from '../types';
import ContentBlockRenderer from '../components/ContentBlockRenderer';

const findPage = (pages: Page[], path: string[]): Page | null => {
    let currentPageLevel: Page[] | undefined = pages;
    let foundPage: Page | null = null;

    for (const segment of path) {
        const page = currentPageLevel?.find(p => p.id === segment);
        if (page) {
            foundPage = page;
            currentPageLevel = page.children;
        } else {
            return null;
        }
    }
    return foundPage;
};

const AddBlock: React.FC<{onAdd: (type: ContentType) => void}> = ({ onAdd }) => {
    const btnClass = "px-3 py-2 border border-brand-secondary text-brand-secondary rounded-lg text-sm font-medium transition-colors hover:bg-brand-secondary hover:text-white";
    return (
        <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
            <h3 className="text-lg font-semibold text-center text-gray-600 mb-4">Adicionar Novo Bloco de Conteúdo</h3>
            <div className="flex flex-wrap justify-center gap-2">
                <button onClick={() => onAdd(ContentType.H1)} className={btnClass}>Título 1</button>
                <button onClick={() => onAdd(ContentType.H2)} className={btnClass}>Título 2</button>
                <button onClick={() => onAdd(ContentType.P)} className={btnClass}>Parágrafo</button>
                <button onClick={() => onAdd(ContentType.UL)} className={btnClass}>Lista</button>
                <button onClick={() => onAdd(ContentType.OL)} className={btnClass}>Lista Numerada</button>
                <button onClick={() => onAdd(ContentType.IMAGE)} className={btnClass}>Imagem</button>
                <button onClick={() => onAdd(ContentType.ALERT_INFO)} className={btnClass}>Alerta (Info)</button>
                <button onClick={() => onAdd(ContentType.ALERT_WARNING)} className={btnClass}>Alerta (Aviso)</button>
            </div>
        </div>
    )
}

const ContentPage: React.FC = () => {
  const { pageId, subPageId, tertiaryPageId } = useParams<{ pageId: string; subPageId?: string, tertiaryPageId?: string }>();
  const { pages, updatePageContent, addContentBlock, moveContentBlock } = useContent();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const path = [pageId, subPageId, tertiaryPageId].filter(Boolean) as string[];
  const page = findPage(pages, path);

  const handleUpdateBlock = (blockId: string, newContent: string | string[]) => {
      if (!page || !page.content) return;
      const newBlocks = page.content.map(b => 
          b.id === blockId ? { ...b, content: newContent } : b
      );
      updatePageContent(path, newBlocks);
  };
  
  const handleDeleteBlock = (blockId: string) => {
      if (!page || !page.content || !window.confirm('Tem certeza que deseja excluir este bloco?')) return;
      const newBlocks = page.content.filter(b => b.id !== blockId);
      updatePageContent(path, newBlocks);
  }
  
  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
      moveContentBlock(path, blockId, direction);
  }

  const handleAddBlock = (type: ContentType) => {
      addContentBlock(path, type);
  }

  if (!page) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-2xl font-bold">Página não encontrada</h2>
        <p>O conteúdo que você está procurando não existe ou foi movido.</p>
      </div>
    );
  }
  
  if (!page.content) {
      // This can happen for pages that are just containers like 'diretrizes'
       return (
          <div className="p-8 text-center text-gray-500">
            <h2 className="text-2xl font-bold">{page.title}</h2>
            <p>Selecione um subtópico no menu para ver o conteúdo.</p>
          </div>
        );
  }


  return (
    <>
        <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-lg max-w-4xl mx-auto animate-fade-in">
            {page.content.map((block) => (
                <ContentBlockRenderer 
                    key={block.id} 
                    block={block} 
                    onUpdate={(newContent) => handleUpdateBlock(block.id, newContent)}
                    onDelete={() => handleDeleteBlock(block.id)}
                    onMove={(direction) => handleMoveBlock(block.id, direction)}
                />
            ))}

            {isAdmin && <AddBlock onAdd={handleAddBlock} />}
        </div>
    </>
  );
};

export default ContentPage;