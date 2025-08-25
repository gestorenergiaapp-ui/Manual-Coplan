import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Page } from '../types';
import { useContent } from '../hooks/useContent';
import { useAuth } from '../hooks/useAuth';
import { ChevronDownIcon, Cog6ToothIcon, PencilIcon, TrashIcon, PlusCircleIcon, PlusIcon } from '@heroicons/react/24/solid';
import { getIconComponent } from '../utils/iconMap';
import EditPageModal from './EditPageModal';

interface SidebarProps {
  isOpen: boolean;
}

const Logo = () => {
  const { logoUrl } = useContent();
  return (
    <div className="py-6 px-4 text-center border-b border-white/10">
      {logoUrl ? (
        <img src={logoUrl} alt="Company Logo" className="max-h-16 mx-auto" />
      ) : (
        <>
          <h1 className="text-3xl font-extrabold text-white tracking-wider relative">
              C<span className="text-brand-secondary">O</span>PLAN
          </h1>
          <p className="text-[10px] text-gray-300 font-light tracking-[.2em] -mt-1 uppercase">
              Construtora Planalto
          </p>
        </>
      )}
    </div>
  )
};


const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { pages, addPage } = useContent();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [parentPagePath, setParentPagePath] = useState<string[] | null>(null);

  const handleAddTopLevelPage = () => {
    setModalMode('add');
    setParentPagePath(null);
    setIsModalOpen(true);
  }
  
  const handleSavePage = (title: string, icon: string) => {
      addPage(parentPagePath, title, icon);
      setIsModalOpen(false);
  }

  return (
    <div
      className={`bg-brand-primary text-white ${
        isOpen ? 'w-64' : 'w-0'
      } lg:w-64 transition-all duration-300 ease-in-out flex-shrink-0 flex flex-col`}
    >
      <Logo />
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {pages.map((page) => (
          <SidebarItem key={page.id} page={page} level={0} path={[page.id]} />
        ))}
        {isAdmin && (
           <>
            <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-brand-accent text-white' : 'hover:bg-brand-secondary'
                  }`
                }
              >
                <Cog6ToothIcon className="h-5 w-5 mr-3" />
                <span>Admin Dashboard</span>
            </NavLink>
            <button onClick={handleAddTopLevelPage} className="w-full flex items-center p-2 rounded-lg text-sm hover:bg-brand-secondary transition-colors">
                <PlusCircleIcon className="h-5 w-5 mr-3" />
                <span>Adicionar Página</span>
            </button>
           </>
        )}
      </nav>
      {isModalOpen && (
          <EditPageModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSavePage}
            mode="add"
          />
      )}
    </div>
  );
};

interface SidebarItemProps {
  page: Page;
  level: number;
  path: string[];
}

const SidebarItem: React.FC<SidebarItemProps> = ({ page, level, path }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const { updatePageDetails, deletePage, addPage } = useContent();
  const initialOpenState = location.pathname.startsWith(`/page/${path.join('/')}`);
  const [isOpen, setIsOpen] = useState(initialOpenState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const hasChildren = page.children && page.children.length > 0;
  
  const handleNavClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`Tem certeza que deseja excluir a página "${page.title}"?`)) {
      deletePage(path);
      navigate('/');
    }
  }
  
  const handleAddSubPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // This now needs to open the modal in 'add' mode for a subpage
    // We'll handle this by passing props up, or using a shared context for the modal
    // For simplicity, let's use prompt for this specific case for now, and modal for top-level
    const title = window.prompt(`Digite o título da nova sub-página para "${page.title}":`);
    if (title) {
        // A new modal system would be better here, but this fixes the logic
        addPage(path, title, 'TagIcon'); // Default icon
        if (!isOpen) {
            setIsOpen(true);
        }
    }
  }

  const handleSavePageDetails = (newTitle: string, newIcon: string) => {
      updatePageDetails(path, newTitle, newIcon);
      setIsModalOpen(false);
  }

  const navLinkPath = page.content ? `/page/${path.join('/')}` : (page.id === 'home' ? '/' : `/${page.id}`);
  const IconComponent = getIconComponent(page.icon);

  return (
    <div>
      <NavLink
        to={navLinkPath}
        onClick={handleNavClick}
        className={({ isActive }) =>
          `group flex items-center justify-between w-full p-2 text-sm rounded-lg transition-colors duration-200 ${
            isActive && (!hasChildren || (hasChildren && !isOpen)) ? 'bg-brand-accent text-white' : 'hover:bg-brand-secondary'
          }`
        }
        style={{ paddingLeft: `${1 + level * 1.5}rem` }}
      >
        <div className="flex items-center overflow-hidden">
            <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="truncate">{page.title}</span>
        </div>
        <div className="flex items-center flex-shrink-0">
          {isAdmin && (
            <div className="hidden group-hover:flex items-center ml-2">
                {hasChildren && <button onClick={handleAddSubPage} className="p-1 hover:text-white"><PlusIcon className="h-4 w-4" /></button>}
                {page.id !== 'home' && page.id !== 'faq' && page.id !== 'contato' && <>
                    <button onClick={handleEdit} className="p-1 hover:text-white"><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={handleDelete} className="p-1 hover:text-white"><TrashIcon className="h-4 w-4" /></button>
                </>}
            </div>
          )}
          {hasChildren && <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        </div>
      </NavLink>
      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {page.children?.map((child) => (
            <SidebarItem key={child.id} page={child} level={level + 1} path={path.concat(child.id)} />
          ))}
        </div>
      )}
       {isModalOpen && (
          <EditPageModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSavePageDetails}
            mode="edit"
            currentPage={page}
          />
      )}
    </div>
  );
};

export default Sidebar;