import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../services/authService';
import { LogIn, ArrowLeft, Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Botón para volver */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Volver al Inicio</span>
      </button>

      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
            <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 text-gray-900 rounded-lg
                             border-2 border-gray-200 focus:border-blue-500 focus:bg-white
                             focus:outline-none transition-all"
                  placeholder="admin@ejemplo.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 text-gray-900 rounded-lg
                             border-2 border-gray-200 focus:border-blue-500 focus:bg-white
                             focus:outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                <div className="text-red-600 mt-0.5">⚠️</div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold
                         py-3.5 rounded-lg transition-all transform hover:scale-[1.02]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         focus:outline-none focus:ring-4 focus:ring-blue-200
                         flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Sistema de administración AAC Comunicador
            </p>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>¿Olvidaste tu contraseña? Contacta al administrador del sistema.</p>
        </div>
      </div>
    </div>
  );
}
