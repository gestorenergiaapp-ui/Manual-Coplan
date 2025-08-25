
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ContentBlock, ContentType } from '../types';
import { PencilIcon, CheckIcon, XMarkIcon, ArrowUpIcon, ArrowDownIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/solid';

interface ContentBlockRendererProps {
  block: ContentBlock;
  onUpdate: (newContent: string | string[]) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ block, onUpdate, onDelete, onMove }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(block.content);

  useEffect(() => {
    setEditValue(block.content);
  }, [block.content]);

  const handleSave = () => {
    onUpdate(editValue);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditValue(block.content);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditValue(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const renderEditable = (content: string, type: 'input' | 'textarea') => {
    const Component = type;
    return (
      <div className="flex-grow">
        <Component
          value={content}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full p-2 border rounded bg-white text-gray-800"
          rows={type === 'textarea' ? 5 : undefined}
        />
      </div>
    );
  };
  
  const renderListEditable = (items: string[]) => (
    <textarea
      value={items.join('\n')}
      onChange={(e) => setEditValue(e.target.value.split('\n'))}
      className="w-full p-2 border rounded bg-white text-gray-800"
      rows={items.length + 2}
    />
  );
  
  const renderImageEditable = () => (
    <div className="w-full p-4 border-2 border-dashed rounded-lg text-center">
      {editValue && typeof editValue === 'string' && <img src={editValue} alt="Preview" className="max-h-40 mx-auto mb-4" />}
      <label className="cursor-pointer bg-brand-secondary text-white px-4 py-2 rounded-lg hover:bg-brand-primary">
          <PhotoIcon className="h-5 w-5 mr-2 inline-block" />
          <span>Escolher Imagem</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
      </label>
    </div>
  );

  const EditControls = () => (
    <div className="absolute top-0 right-0 flex space-x-1 p-1 bg-gray-100 rounded-bl-lg">
      {isEditing ? (
        <>
          <button onClick={handleSave} className="p-1 bg-green-500 text-white rounded hover:bg-green-600" title="Salvar"><CheckIcon className="h-4 w-4" /></button>
          <button onClick={handleCancel} className="p-1 bg-red-500 text-white rounded hover:bg-red-600" title="Cancelar"><XMarkIcon className="h-4 w-4" /></button>
        </>
      ) : (
        <>
          <button onClick={() => onMove('up')} className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300" title="Mover para Cima"><ArrowUpIcon className="h-4 w-4" /></button>
          <button onClick={() => onMove('down')} className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300" title="Mover para Baixo"><ArrowDownIcon className="h-4 w-4" /></button>
          <button onClick={() => setIsEditing(true)} className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300" title="Editar"><PencilIcon className="h-4 w-4" /></button>
          <button onClick={onDelete} className="p-1 bg-gray-200 text-red-500 rounded hover:bg-gray-300" title="Excluir"><TrashIcon className="h-4 w-4" /></button>
        </>
      )}
    </div>
  );

  const renderContent = () => {
    switch (block.type) {
      case ContentType.H1:
        return isEditing ? renderEditable(editValue as string, 'input') : <h1 className="text-4xl font-bold text-brand-dark mb-6">{block.content}</h1>;
      case ContentType.H2:
        return isEditing ? renderEditable(editValue as string, 'input') : <h2 className="text-2xl font-semibold text-brand-dark mt-6 mb-4">{block.content}</h2>;
      case ContentType.P:
        return isEditing ? renderEditable(editValue as string, 'textarea') : <p className="text-gray-700 leading-relaxed mb-4">{block.content}</p>;
      case ContentType.UL:
        return isEditing ? renderListEditable(editValue as string[]) : <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 pl-4">{Array.isArray(block.content) && block.content.map((item, i) => <li key={i}>{item}</li>)}</ul>;
      case ContentType.OL:
        return isEditing ? renderListEditable(editValue as string[]) : <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-4 pl-4">{Array.isArray(block.content) && block.content.map((item, i) => <li key={i}>{item}</li>)}</ol>;
      case ContentType.IMAGE:
        return isEditing ? renderImageEditable() : <div className="my-4">{block.content ? <img src={block.content as string} alt="Conteúdo" className="max-w-full h-auto rounded-lg shadow-md" /> : <div className="p-4 text-center text-gray-400 bg-gray-100 rounded-lg">Imagem não carregada</div>}</div>;
      case ContentType.ALERT_INFO:
        return isEditing ? renderEditable(editValue as string, 'textarea') : <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded-r-lg" role="alert"><p>{block.content}</p></div>;
      case ContentType.ALERT_WARNING:
        return isEditing ? renderEditable(editValue as string, 'textarea') : <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-r-lg" role="alert"><p>{block.content}</p></div>;
      default:
        return null;
    }
  };

  return (
    <div className="relative group my-2">
      {isAdmin && <div className="absolute -left-2 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 bg-brand-accent transition-opacity rounded-full"></div>}
      <div className={`flex items-start space-x-2 ${isEditing ? 'p-4 border border-dashed border-brand-accent rounded-lg' : ''}`}>
        {renderContent()}
      </div>
      {isAdmin && <div className="opacity-0 group-hover:opacity-100 transition-opacity"><EditControls /></div>}
    </div>
  );
};

export default ContentBlockRenderer;
