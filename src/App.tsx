import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import DatabaseCheck from './components/DatabaseCheck';
import { getCurrentUser } from './lib/auth';
import { Loader } from 'lucide-react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="flex items-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-amber-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-400 rounded-full blur-2xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Database Check Component */}
        <DatabaseCheck />

        {/* Login Form */}
        <LoginForm onLoginSuccess={handleLoginSuccess} />

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Portal exclusivo para agências de turismo parceiras
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;