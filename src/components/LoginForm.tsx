import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Plane, Loader, AlertCircle } from 'lucide-react';
import { signIn } from '../lib/auth';

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn({ email, password });
      onLoginSuccess(result);
    } catch (err: any) {
      console.error('Erro no login:', err);
      
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos. Use as credenciais de teste abaixo.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Email não confirmado. Verifique sua caixa de entrada.');
      } else if (err.message?.includes('User not found')) {
        setError('Usuário não encontrado. Certifique-se de que o usuário foi criado no Supabase.');
      } else if (err.message?.includes('não encontrado na tabela users')) {
        setError('Usuário autenticado mas não vinculado. Verifique se existe um registro na tabela "users" com o auth_id correto.');
      } else {
        setError(`Erro ao fazer login: ${err.message || 'Tente novamente.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = (userType: 'owner' | 'agent') => {
    if (userType === 'owner') {
      setEmail('admin@viagenspremium.com.br');
      setPassword('123456');
    } else {
      setEmail('maria@turmundo.com.br');
      setPassword('123456');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 p-8 border border-blue-100/50 backdrop-blur-sm">
      {/* Logo and Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl mb-4 shadow-lg shadow-blue-600/25">
          <Plane className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pontos e Milhas</h1>
        <p className="text-gray-600 text-sm">Portal para Agências de Turismo</p>
      </div>

      {/* Test Credentials */}
      <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h3 className="text-sm font-medium text-amber-900 mb-3">⚠️ Importante - Contas de Teste:</h3>
        <p className="text-xs text-amber-800 mb-3">
          Estes usuários precisam ser criados manualmente no Supabase Dashboard:
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fillTestCredentials('owner')}
            className="w-full text-left text-xs text-amber-700 hover:text-amber-900 transition-colors p-2 bg-amber-100 rounded"
          >
            <strong>Proprietário:</strong> admin@viagenspremium.com.br (senha: 123456)
          </button>
          <button
            type="button"
            onClick={() => fillTestCredentials('agent')}
            className="w-full text-left text-xs text-amber-700 hover:text-amber-900 transition-colors p-2 bg-amber-100 rounded"
          >
            <strong>Agente:</strong> maria@turmundo.com.br (senha: 123456)
          </button>
        </div>
        <p className="text-xs text-amber-700 mt-2">
          💡 Acesse o Supabase Dashboard → Authentication → Users para criar estes usuários.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Digite sua senha"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
              disabled={loading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Lembrar-me
            </label>
          </div>

          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Esqueci minha senha
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-600/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            {loading ? (
              <Loader className="h-5 w-5 text-blue-300 animate-spin" />
            ) : (
              <Lock className="h-5 w-5 text-blue-300 group-hover:text-blue-200 transition-colors" />
            )}
          </span>
          {loading ? 'Entrando...' : 'Entrar no Portal'}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-center text-xs text-gray-500">
          Não tem uma conta?{' '}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Entre em contato conosco
          </a>
        </p>
      </div>
    </div>
  );
}