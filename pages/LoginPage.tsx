
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowRightOnRectangleIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/solid';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError('Nome de usuário ou senha inválidos.');
    }
  };
  
  if (currentUser) {
      return <Navigate to="/" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-light p-4">
        <div className="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-xl animate-fade-in">
            <div className="px-6 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-brand-primary tracking-wider relative">
                        C<span className="text-brand-secondary">O</span>PLAN
                    </h1>
                    <p className="text-sm text-gray-500 font-light tracking-widest -mt-1 uppercase">
                        Manual de Diretrizes
                    </p>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        Acesse sua conta
                    </h2>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username-address" className="sr-only">Nome de usuário</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                          id="username-address"
                          name="username"
                          type="text"
                          autoComplete="username"
                          required
                          className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary focus:z-10 sm:text-sm"
                          placeholder="Nome de usuário"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="password" className="sr-only">Senha</label>
                      <div className="relative">
                         <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary focus:z-10 sm:text-sm"
                          placeholder="Senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                      <p className="text-center text-sm text-red-600">{error}</p>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors disabled:bg-gray-400"
                    >
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                         <ArrowRightOnRectangleIcon className="h-5 w-5 text-brand-secondary group-hover:text-brand-light" aria-hidden="true" />
                      </span>
                      {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                  </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;