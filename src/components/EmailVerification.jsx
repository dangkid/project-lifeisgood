import { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { resendVerificationEmail } from '../services/authService';

export default function EmailVerification({ user, onClose }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await resendVerificationEmail();
      setMessage('¡Email de verificación enviado! Revisa tu bandeja de entrada.');
      setCanResend(false);
      setCountdown(60); // 60 segundos antes de poder reenviar
    } catch (err) {
      console.error('Error:', err);
      if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Por favor espera unos minutos.');
      } else {
        setError('Error al enviar email. Por favor intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await user.reload();
      if (user.emailVerified) {
        setMessage('¡Email verificado exitosamente! Redirigiendo...');
        setTimeout(() => {
          if (onClose) onClose(true); // true = verificado
        }, 1500);
      } else {
        setError('Email aún no verificado. Por favor revisa tu correo y haz clic en el enlace de verificación.');
      }
    } catch (err) {
      console.error('Error verificando estado:', err);
      setError('Error al verificar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verifica tu email (Opcional)
          </h2>
          <p className="text-gray-600">
            Hemos enviado un email de verificación a:
          </p>
          <p className="font-semibold text-blue-600 mt-1">
            {user?.email}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Puedes continuar sin verificar y hacerlo más tarde
          </p>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Pasos para verificar:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abre tu bandeja de entrada</li>
                <li>Busca el email de verificación</li>
                <li>Haz clic en el enlace de verificación</li>
                <li>Regresa aquí y haz clic en "Ya verifiqué"</li>
              </ol>
              <p className="mt-2 text-xs text-blue-700">
                💡 Si no recibes el email en 5 minutos, puedes continuar sin verificar y hacerlo después.
              </p>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Acciones */}
        <div className="space-y-3">
          <button
            onClick={handleRefreshStatus}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Ya verifiqué mi email
              </>
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={loading || !canResend}
            className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              canResend && !loading
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : countdown > 0 ? (
              <>
                <RefreshCw className="w-5 h-5" />
                Reenviar en {countdown}s
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Reenviar email
              </>
            )}
          </button>

          <button
            onClick={() => onClose && onClose(false)}
            className="w-full text-gray-600 hover:text-gray-800 py-2 rounded-lg font-medium transition-colors"
          >
            Verificar más tarde
          </button>
        </div>

        {/* Nota de ayuda */}
        <p className="text-xs text-gray-500 text-center mt-4">
          ¿No encuentras el email? Revisa tu carpeta de spam o correo no deseado.<br/>
          Los emails pueden tardar hasta 5 minutos en llegar.
        </p>
        
        {/* Opción de continuar */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 text-center">
            ⚡ Puedes hacer clic en "Verificar más tarde" para continuar usando la aplicación y verificar tu email cuando llegue.
          </p>
        </div>
      </div>
    </div>
  );
}
