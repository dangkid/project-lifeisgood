import { useState } from 'react';
import { signIn } from '../services/authService';
import { LogIn } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      onLogin();
    } catch (error) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <LogIn className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Panel Admin</h1>
          <p className="text-gray-400 text-xl">AAC Life is Good</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-white text-xl font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 text-white text-xl rounded-lg
                         border-2 border-gray-600 focus:border-primary focus:outline-none
                         transition-colors"
              placeholder="admin@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-white text-xl font-medium mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 text-white text-xl rounded-lg
                         border-2 border-gray-600 focus:border-primary focus:outline-none
                         transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-danger/20 border-2 border-danger rounded-lg p-4">
              <p className="text-danger text-lg">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold
                       text-2xl py-4 rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-4 focus:ring-primary"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
