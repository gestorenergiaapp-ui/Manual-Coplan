import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, MagnifyingGlassIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between z-10">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} className="text-gray-600 focus:outline-none lg:hidden">
          <Bars3Icon className="h-6 w-6" />
        </button>
        <form onSubmit={handleSearchSubmit} className="relative ml-4">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            placeholder="Buscar em todo o manual..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>
      <div className="flex items-center space-x-4">
        {currentUser && (
          <>
            <span className="font-medium text-sm text-gray-700 hidden sm:block">
              Bem-vindo, <span className="font-bold">{currentUser.username}</span>
            </span>
            <button onClick={logout} className="flex items-center space-x-2 text-gray-600 hover:text-brand-primary" title="Logout">
              <span className="font-medium text-sm hidden sm:block">Sair</span>
              <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;