import { useState, useEffect } from 'react';
import { getButtons, deleteButton } from '../services/buttonService';
import { signOut } from '../services/authService';
import { Plus, Edit, Trash2, LogOut, Image as ImageIcon, Music, Users } from 'lucide-react';
import ButtonForm from '../components/admin/ButtonForm';
import AdminProfileManager from '../components/admin/AdminProfileManager';
import Tutorial from '../components/Tutorial';
import { getTimeContextLabel } from '../utils/timeContext';

export default function AdminView({ onLogout, isTherapist = false }) {
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingButton, setEditingButton] = useState(null);
  const [activeTab, setActiveTab] = useState('buttons'); // 'buttons' o 'profiles'

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
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {isTherapist ? 'Panel de Especialista' : 'Panel de Administración'}
              </h1>
              {isTherapist && (
                <p className="text-sm text-green-600 mt-1">Gestiona perfiles y botones para tus pacientes</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white
                         px-6 py-3 rounded-lg text-xl font-medium transition-colors"
            >
              <LogOut className="w-6 h-6" />
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('buttons')}
            className={`px-6 py-3 font-bold text-lg transition-colors ${
              activeTab === 'buttons'
                ? 'text-blue-600 border-b-4 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon size={20} />
              Botones de Comunicación
            </div>
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-6 py-3 font-bold text-lg transition-colors ${
              activeTab === 'profiles'
                ? 'text-blue-600 border-b-4 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={20} />
              Perfiles de Pacientes
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'buttons' ? (
          <>
            {/* Add Button */}
            <div className="mb-8">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white
                           px-8 py-4 rounded-lg text-2xl font-bold transition-colors shadow-lg"
              >
                <Plus className="w-8 h-8" />
            Crear Nuevo Botón
          </button>
        </div>

        {/* Buttons List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
