import { useState } from 'react';
import { createOrganization, joinOrganization } from '../services/authService';
import { Building2, Users, ArrowRight, Check } from 'lucide-react';

export default function OrganizationSetup({ onComplete }) {
  const [step, setStep] = useState(1); // 1: elegir opción, 2: formulario
  const [setupType, setSetupType] = useState(null); // 'new' o 'join'
  const [organizationName, setOrganizationName] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (setupType === 'new') {
        if (!organizationName.trim()) {
          setError('Debes ingresar el nombre de tu centro');
          setLoading(false);
          return;
        }
        await createOrganization(organizationName);
      } else {
        if (!organizationId.trim()) {
          setError('Debes ingresar el ID de la organización');
          setLoading(false);
          return;
        }
        await joinOrganization(organizationId.trim());
      }
      
      // Notificar que se completó
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error en setup:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      
      if (error.message && (error.message.includes('no encontrada') || error.message.includes('not found'))) {
        setError('ID de organización no válido. Verifica que el código sea correcto.');
      } else if (error.code === 'permission-denied') {
        setError('No tienes permiso para acceder a esta organización. Verifica el código.');
      } else {
        setError(`Error: ${error.message || 'Error al configurar la organización. Intenta nuevamente.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Paso 1: Elegir tipo de configuración
  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido!</h2>
            <p className="text-gray-600">
              Antes de continuar, configura tu centro u organización
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Crear nueva organización */}
            <button
              onClick={() => {
                setSetupType('new');
                setStep(2);
              }}
              className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Crear Mi Centro</h3>
                  <p className="text-sm text-gray-600">
                    Soy el primero. Quiero crear un nuevo centro y gestionar mis pacientes.
                  </p>
                </div>
                <div className="mt-2 text-blue-600 font-medium flex items-center gap-1">
                  Comenzar <ArrowRight size={16} />
                </div>
              </div>
            </button>

            {/* Unirse a organización */}
            <button
              onClick={() => {
                setSetupType('join');
                setStep(2);
              }}
              className="group p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Unirme a un Centro</h3>
                  <p className="text-sm text-gray-600">
                    Mi centro ya existe. Tengo un código de invitación para unirme.
                  </p>
                </div>
                <div className="mt-2 text-purple-600 font-medium flex items-center gap-1">
                  Continuar <ArrowRight size={16} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Paso 2: Formulario
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            setupType === 'new' ? 'bg-blue-100' : 'bg-purple-100'
          }`}>
            {setupType === 'new' ? (
              <Building2 className="w-10 h-10 text-blue-600" />
            ) : (
              <Users className="w-10 h-10 text-purple-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {setupType === 'new' ? 'Crear Mi Centro' : 'Unirme a un Centro'}
          </h2>
          <p className="text-sm text-gray-600">
            {setupType === 'new' 
              ? 'Elige un nombre para tu centro u organización' 
              : 'Ingresa el código que te proporcionó tu administrador'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
              <div className="text-red-600 mt-0.5">⚠️</div>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {setupType === 'new' ? (
            <div>
              <label htmlFor="orgName" className="block text-gray-700 font-medium mb-2">
                Nombre del Centro/Organización
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Building2 size={20} />
                </div>
                <input
                  id="orgName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Ej: Centro de Terapia ABC"
                  required
                  autoFocus
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                💡 Este nombre será visible para todos los miembros de tu equipo
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="orgId" className="block text-gray-700 font-medium mb-2">
                Código de Invitación
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Users size={20} />
                </div>
                <input
                  id="orgId"
                  type="text"
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-mono text-sm"
                  placeholder="Pega el código aquí"
                  required
                  autoFocus
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                💡 El administrador de tu centro te proporcionó este código
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                setupType === 'new'
                  ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                  : 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400'
              } disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Configurando...</span>
                </>
              ) : (
                <>
                  <Check size={20} />
                  <span>Continuar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
