import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useContent } from '../hooks/useContent';
import { Navigate } from 'react-router-dom';
import { ArrowUpOnSquareIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon, PaintBrushIcon, UsersIcon, UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StoredUser } from '../types';

const AdminPage: React.FC = () => {
    const { currentUser, changePassword, getUsers, addUser, deleteUser } = useAuth();
    const { suggestions, logoUrl, updateLogo } = useContent();
    
    const [logoMessage, setLogoMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const [allUsers, setAllUsers] = useState<StoredUser[]>([]);
    const [newUsername, setNewUsername] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [userMessage, setUserMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const fetchUsers = async () => {
        const users = await getUsers();
        // The API returns users without passwords, so we cast it.
        setAllUsers(users as StoredUser[]);
    };

    useEffect(() => {
        fetchUsers();
    }, [getUsers]);


    if (currentUser?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoMessage(null);
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setLogoMessage({type: 'error', text: 'O arquivo é muito grande. O limite é 2MB.'});
                return;
            }
            try {
                await updateLogo(file);
                setLogoMessage({type: 'success', text: 'Logo atualizado com sucesso!'});
            } catch (error) {
                 setLogoMessage({type: 'error', text: 'Falha ao enviar o logo.'});
            }
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);
        if (newPassword.length < 6) {
            setPasswordMessage({type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.'});
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({type: 'error', text: 'As novas senhas não coincidem.'});
            return;
        }
        const success = await changePassword(currentPassword, newPassword);
        if (success) {
            setPasswordMessage({type: 'success', text: 'Senha alterada com sucesso!'});
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setPasswordMessage({type: 'error', text: 'A senha atual está incorreta.'});
        }
    }
    
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserMessage(null);
        if (newUsername.trim() === '' || newUserPassword.trim() === '') {
            setUserMessage({ type: 'error', text: 'Usuário e senha não podem estar vazios.'});
            return;
        }
        const result = await addUser({ username: newUsername, password: newUserPassword });
        setUserMessage({ type: result.success ? 'success' : 'error', text: result.message });
        if (result.success) {
            setNewUsername('');
            setNewUserPassword('');
            fetchUsers();
        }
    }

    const handleDeleteUser = async (username: string) => {
        await deleteUser(username);
        fetchUsers();
    }


    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <h1 className="text-4xl font-bold text-brand-dark mb-8">Admin Dashboard</h1>
            
             {/* User Management Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                 <h2 className="text-xl font-semibold text-brand-primary flex items-center mb-4">
                    <UsersIcon className="h-6 w-6 mr-2" />
                    Gerenciar Usuários
                </h2>
                <div className="space-y-4 mb-6">
                    {allUsers.map(user => (
                        <div key={user.username} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                            <div>
                                <span className="font-bold text-gray-800">{user.username}</span>
                                <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-brand-secondary text-white' : 'bg-gray-200 text-gray-700'}`}>{user.role}</span>
                            </div>
                            <button 
                                onClick={() => handleDeleteUser(user.username)}
                                disabled={user.username === currentUser.username}
                                className="p-1 text-red-500 rounded-md hover:bg-red-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                title={user.username === currentUser.username ? "Não é possível se auto-excluir" : "Excluir usuário"}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleAddUser} className="p-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                        <UserPlusIcon className="h-5 w-5 mr-2" />
                        Adicionar Novo Usuário (Role: user)
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input 
                            type="text" 
                            placeholder="Nome de usuário" 
                            value={newUsername} 
                            onChange={e => setNewUsername(e.target.value)}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                        />
                        <input 
                            type="password" 
                            placeholder="Senha" 
                            value={newUserPassword}
                            onChange={e => setNewUserPassword(e.target.value)}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                        />
                        <button type="submit" className="sm:w-auto justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:opacity-90">
                           Adicionar
                        </button>
                    </div>
                     {userMessage && (
                         <p className={`mt-2 text-sm ${userMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{userMessage.text}</p>
                    )}
                </form>
            </div>

            {/* Brand Customization Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-brand-primary flex items-center mb-4">
                    <PaintBrushIcon className="h-6 w-6 mr-2" />
                    Personalização da Marca
                </h2>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-gray-600 mb-2">Faça o upload do logo da sua empresa. A imagem será exibida na barra lateral.</p>
                        <label className="w-full sm:w-auto inline-flex items-center px-4 py-2 bg-brand-secondary text-white rounded-md cursor-pointer hover:opacity-90 transition-opacity">
                            <ArrowUpOnSquareIcon className="h-5 w-5 mr-2" />
                            <span>Carregar Logo</span>
                            <input type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoFileChange} />
                        </label>
                        {logoMessage && (
                            <p className={`mt-2 text-sm ${logoMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{logoMessage.text}</p>
                        )}
                    </div>
                    <div className="bg-brand-primary p-4 rounded-md flex items-center justify-center">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Prévia do Logo" className="max-h-20" />
                        ): (
                            <p className="text-gray-400">Prévia do Logo</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                 <h2 className="text-xl font-semibold text-brand-primary flex items-center mb-4">
                    <ShieldCheckIcon className="h-6 w-6 mr-2" />
                    Alterar Senha
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                    </div>
                     <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                        <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500">
                             {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                        <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                    </div>
                    {passwordMessage && (
                         <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{passwordMessage.text}</p>
                    )}
                    <div className="text-right">
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>


            {/* Suggestions Section */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-brand-primary">Sugestões e Dúvidas Recebidas</h2>
                    <p className="text-sm text-gray-500">Mensagens enviadas pelo formulário de contato.</p>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                    {suggestions.length > 0 ? (
                        suggestions.map(sug => (
                            <div key={sug.id} className="p-6 hover:bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-bold text-gray-800">{sug.name} <span className="text-sm font-normal text-gray-500">- {sug.department}</span></p>
                                    <p className="text-xs text-gray-400">{new Date(sug.timestamp).toLocaleString('pt-BR')}</p>
                                </div>
                                <p className="text-gray-600 whitespace-pre-wrap">{sug.message}</p>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            <p>Nenhuma sugestão recebida ainda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
