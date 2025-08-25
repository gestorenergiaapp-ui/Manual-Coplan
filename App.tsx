
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ContentProvider } from './context/ContentContext';
import { AuthProvider } from './context/AuthContext';
import { AIProvider } from './context/AIContext';
import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import ContentPage from './pages/ContentPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import * as api from './services/api';

// Initialize the database on app startup
api.initializeDatabase();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ContentProvider>
        <AIProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route 
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<HomePage />} />
                <Route path="/page/:pageId" element={<ContentPage />} />
                <Route path="/page/:pageId/:subPageId" element={<ContentPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/contato" element={<ContactPage />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Route>
            </Routes>
          </HashRouter>
        </AIProvider>
      </ContentProvider>
    </AuthProvider>
  );
};

export default App;