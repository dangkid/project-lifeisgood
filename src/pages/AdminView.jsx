import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getButtons, deleteButton } from '../services/buttonService';
import { signOut } from '../services/authService';
import { Plus, Edit, Trash2, LogOut, Image as ImageIcon, Music, Users, MessageCircle, ArrowLeft } from 'lucide-react';
import ButtonForm from '../components/admin/ButtonForm';
import AdminProfileManager from '../components/admin/AdminProfileManager';
import Tutorial from '../components/Tutorial';
import { getTimeContextLabel } from '../utils/timeContext';

export default function AdminView({ onLogout, isTherapist = false, user }) {
  const navigate = useNavigate();
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingButton, setEditingButton] = useState(null);
  const [activeTab, setActiveTab] = useState('buttons'); // 'buttons' o 'profiles'

  // Obtener nombre del especialista del email
  const getSpecialistName = () => {
    if (!user?.email) return 'Especialista';
    // Extraer nombre del email (antes del @)
    const emailName = user.email.split('@')[0];
    // Capitalizar y formatear (reemplazar . _ - con espacios)
    return emailName
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    loadButtons();
  }, []);

  const loadButtons = async () => {
    try {
      setLoading(true);
      const data = await getButtons();
      setButtons(data);
    } catch (error) {
      console.error('Error loading buttons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este botón?')) return;

    try {
      await deleteButton(id);
      await loadButtons();
    } catch (error) {
      console.error('Error deleting button:', error);
      alert('Error al eliminar el botón');
    }
  };

  const handleEdit = (button) => {
    setEditingButton(button);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingButton(null);
    loadButtons();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Limpiar localStorage
      localStorage.removeItem('therapistSession');
      localStorage.removeItem('isTherapist');
      localStorage.removeItem('selectedPatientId');
      onLogout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-4xl font-bold text-gray-800">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:px-8">
          {/* Botón volver atrás - Responsive */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-blue-600 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="font-medium">Volver al Inicio</span>
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              {isTherapist ? (
                <>
                  <div className="flex items-center gap-2 sm:gap-3 mb-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        Bienvenido, {getSpecialistName()}
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-600 truncate max-w-[200px] sm:max-w-none">{user?.email}</p>
                    </div>
                  </div>
                  <p className="text-green-600 font-medium mt-2 text-sm sm:text-base">Panel de Especialista - Gestiona tus pacientes y recursos</p>
                </>
              ) : (
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Panel de Administración</h1>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/comunicador')}
                className="flex items-center justify-center gap-1 sm:gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white
                           px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg text-base sm:text-xl font-medium transition-colors flex-1 sm:flex-initial"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">Comunicador</span>
                <span className="sm:hidden">Comunicar</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1 sm:gap-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white
                           px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg text-base sm:text-xl font-medium transition-colors"
              >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 lg:px-8">
        {/* Tabs - Responsive con scroll horizontal en móviles */}
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex gap-2 sm:gap-4 border-b border-gray-300 min-w-max sm:min-w-0">
            <button
              onClick={() => setActiveTab('buttons')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-lg transition-colors whitespace-nowrap ${
                activeTab === 'buttons'
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <ImageIcon size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Botones de Comunicación</span>
                <span className="sm:hidden">Botones</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-lg transition-colors whitespace-nowrap ${
                activeTab === 'profiles'
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <Users size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Perfiles de Pacientes</span>
                <span className="sm:hidden">Pacientes</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'buttons' ? (
          <>
            {/* Add Button - Responsive */}
            <div className="mb-6 sm:mb-8">
              <button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark active:bg-blue-700 text-white
                           px-4 sm:px-8 py-3 sm:py-4 rounded-lg text-lg sm:text-2xl font-bold transition-colors shadow-lg"
              >
                <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
                Crear Nuevo Botón
              </button>
            </div>

            {/* Buttons List - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {buttons.map(button => (
            <div
              key={button.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {button.image_url ? (
                  <img
                    src={button.image_url}
                    alt={button.text}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Type Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold ${
                  button.type === 'story' ? 'bg-success text-white' : 'bg-primary text-white'
                }`}>
                  {button.type === 'story' ? (
                    <div className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      Historia
                    </div>
                  ) : (
                    'Comunicación'
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{button.text}</h3>
                {button.type === 'story' && button.audio_url && (
                  <p className="text-gray-600 text-sm mb-3 truncate">
                    <Music className="w-4 h-4 inline mr-1" />
                    {button.audio_url}
                  </p>
                )}
                
                {/* Time Context Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {button.time_context.map(context => (
                    <span
                      key={context}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {getTimeContextLabel(context)}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(button)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                               text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(button.id)}
                    className="flex items-center justify-center bg-danger hover:bg-danger-dark
                               text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {buttons.length === 0 && (
          <div className="text-center py-20">
            <p className="text-3xl text-gray-500">No hay botones creados</p>
            <p className="text-xl text-gray-400 mt-2">Crea el primero haciendo clic en el botón de arriba</p>
          </div>
        )}
          </>
        ) : (
          /* Tab de Perfiles */
          <AdminProfileManager />
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ButtonForm
              button={editingButton}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </div>
        </div>
      )}
      
      {/* Tutorial */}
      <Tutorial type="admin" />
    </div>
  );
}
