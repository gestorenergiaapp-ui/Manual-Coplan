import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { AVAILABLE_ICONS, getIconComponent } from '../utils/iconMap';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface EditPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, icon: string) => void;
  mode: 'add' | 'edit';
  currentPage?: Page;
}

const EditPageModal: React.FC<EditPageModalProps> = ({ isOpen, onClose, onSave, mode, currentPage }) => {
  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('TagIcon');

  useEffect(() => {
    if (mode === 'edit' && currentPage) {
      setTitle(currentPage.title);
      setSelectedIcon(currentPage.icon);
    } else {
      setTitle('');
      setSelectedIcon('TagIcon');
    }
  }, [isOpen, mode, currentPage]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title, selectedIcon);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-brand-dark">{mode === 'add' ? 'Adicionar Nova Página' : 'Editar Página'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <main className="p-6 space-y-4">
            <div>
              <label htmlFor="pageTitle" className="block text-sm font-medium text-gray-700 mb-1">Título da Página</label>
              <input
                id="pageTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Escolha um Ícone</label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-md">
                {AVAILABLE_ICONS.map(iconName => {
                  const Icon = getIconComponent(iconName);
                  const isSelected = selectedIcon === iconName;
                  return (
                    <button
                      type="button"
                      key={iconName}
                      onClick={() => setSelectedIcon(iconName)}
                      className={`flex justify-center items-center p-2 rounded-md transition-colors ${isSelected ? 'bg-brand-secondary/20 border-brand-secondary' : 'bg-gray-200 hover:bg-gray-300'} border-2 ${isSelected ? 'border-brand-secondary' : 'border-transparent'}`}
                    >
                      <Icon className="h-6 w-6 text-brand-primary" />
                    </button>
                  );
                })}
              </div>
            </div>
          </main>
          <footer className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:opacity-90">Salvar</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default EditPageModal;