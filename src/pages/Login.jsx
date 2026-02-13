import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn, getCurrentUserData, hasUserOrganization } from '../services/authService';
import { LogIn, ArrowLeft, Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import EmailVerification from '../components/EmailVerification';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await signIn(email, password);
      
      // Verificar si el email está verificado (advertencia, no bloqueo)
      if (!user.emailVerified) {
        console.warn('Usuario con email no verificado');
        // Mostrar advertencia pero permitir continuar
      }
      
      // Obtener datos del usuario con rol desde Firestore
      const userData = await getCurrentUserData();
      const userRole = userData?.role || 'user';
      
      console.log('Usuario autenticado con rol:', userRole);
      
      if (onLogin) onLogin();
      
      // Verificar si el usuario tiene organización
      const hasOrg = await hasUserOrganization();
      
      if (!hasOrg) {
        // Usuario sin organización - redirigir a onboarding
        navigate('/onboarding');
        return;
      }
      
      // Redirigir según el rol del usuario (si tiene organización)
      switch (userRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'therapist':
          navigate('/panel-educativo'); // O una ruta específica para terapeutas
          break;
        case 'user':
        default:
          navigate('/'); // Usuarios normales van a la página de inicio
          break;
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde.');
      } else {
        setError('Error al iniciar sesión. Verifica tus credenciales.');
      }
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
            <p className="text-gray-600">Accede a tu cuenta de AAC Comunicador</p>
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
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link to="/registro" className="text-blue-600 hover:text-blue-700 font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>¿Olvidaste tu contraseña? Contacta al administrador del sistema.</p>
        </div>
      </div>

      {/* Modal de Verificación de Email */}
      {showVerification && unverifiedUser && (
        <EmailVerification 
          user={unverifiedUser}
          onClose={(verified) => {
            setShowVerification(false);
            if (verified) {
              // Email verificado, continuar al admin
              if (onLogin) onLogin();
              navigate('/admin');
            } else {
              // No verificó, limpiar estado
              setUnverifiedUser(null);
              setError('Debes verificar tu email para continuar');
            }
          }}
        />
      )}
    </div>
  );
}
