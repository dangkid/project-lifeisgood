import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getButtons, deleteButton } from '../services/buttonService';
import { signOut, getCurrentUserData, canInviteMembers } from '../services/authService';
import { getCurrentOrganization, getOrganizationInviteCode } from '../services/organizationService';
import { Plus, Edit, Trash2, LogOut, Image as ImageIcon, Music, Users, MessageCircle, ArrowLeft, Building2, Copy, Check, Settings, User, AlertCircle } from 'lucide-react';
import ButtonForm from '../components/admin/ButtonForm';
import AdminProfileManager from '../components/admin/AdminProfileManager';
import OrganizationSetup from '../components/OrganizationSetup';
import OrganizationManagement from '../components/admin/OrganizationManagement';
import Tutorial from '../components/Tutorial';
import Navbar from '../components/Navbar';
import AuditLog from '../components/AuditLog';
import { getTimeContextLabel } from '../utils/timeContext';
import { auth } from '../config/firebase';
import { useApp } from '../contexts/AppContext';
import { useLanguageChange } from '../hooks/useLanguageChange';

export default function AdminView({ onLogout, user }) {
  const navigate = useNavigate();
  const { t, language, isDark, renderKey } = useApp();
  useLanguageChange(); // Hook para forzar re-render cuando cambia idioma
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingButton, setEditingButton] = useState(null);
  const [activeTab, setActiveTab] = useState('buttons'); // 'buttons', 'profiles', 'organization', 'audit'
  const [organization, setOrganization] = useState(null);
  const [userData, setUserData] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [needsOrgSetup, setNeedsOrgSetup] = useState(false);
  const [canInvite, setCanInvite] = useState(false);
  const [, forceUpdate] = useState(0);

  // Forzar re-render cuando cambie el idioma
  useEffect(() => {
    forceUpdate(prev => prev + 1);
  }, [language]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadOrganization();
    await loadButtons();
  };

  const loadOrganization = async () => {
    try {
      const data = await getCurrentUserData();
      setUserData(data);
      
      // Verificar si puede invitar
      const hasInvitePermission = await canInviteMembers();
      setCanInvite(hasInvitePermission);
      
      // Verificar si el usuario necesita configurar su organización
      if (!data || !data.organizationId) {
        setNeedsOrgSetup(true);
        setLoading(false);
        return;
      }
      
      const [org, code] = await Promise.all([
        getCurrentOrganization(),
        getOrganizationInviteCode()
      ]);
      setOrganization(org);
      setInviteCode(code || '');
      setNeedsOrgSetup(false);
    } catch (error) {
      console.error('Error loading organization:', error);
      setLoading(false);
    }
  };

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
      localStorage.clear();
      onLogout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying code:', error);
    }
  };

  const handleOrgSetupComplete = async () => {
    setNeedsOrgSetup(false);
    await loadData();
  };

  // Mostrar setup de organización si es necesario
  if (needsOrgSetup) {
    return <OrganizationSetup onComplete={handleOrgSetupComplete} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-4xl font-bold text-gray-800">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navbar */}
      <Navbar 
        user={user} 
        isTherapist={true}
        onLogout={handleLogout}
      />

      {/* Header - Responsive */}
      <div className="bg-white dark:bg-gray-800 shadow-lg transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:px-8">
          {/* Botón volver atrás - Responsive */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="font-medium">{t('admin.backToPatient')}</span>
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {t('admin.panel')}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Bienvenido, {userData?.displayName || user?.email}
                  </p>
                </div>
              </div>
              
              {/* Info de Organización */}
              {organization && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-blue-900">
                        {organization.name}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Rol: <span className="font-semibold">{userData?.role === 'admin' ? 'Administrador' : userData?.role === 'especialista' ? 'Especialista' : 'Miembro'}</span>
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {organization.memberCount || 1} {organization.memberCount === 1 ? 'miembro' : 'miembros'}
                      </p>
                      {canInvite && inviteCode && (
                        <div className="mt-2">
                          <p className="text-xs text-blue-700 mb-1">Código para invitar miembros:</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-white px-2 py-1 rounded border border-blue-300 font-mono flex-1 overflow-x-auto">
                              {inviteCode}
                            </code>
                            <button
                              onClick={copyInviteCode}
                              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex-shrink-0"
                              title="Copiar código"
                            >
                              {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      )}
                      {!canInvite && userData?.role === 'miembro' && (
                        <div className="mt-2 p-2 bg-amber-100 border border-amber-300 rounded text-xs text-amber-800 flex items-start gap-2">
                          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                          <span>Solo Administradores y Especialistas pueden invitar miembros.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/perfil')}
                className="flex items-center justify-center gap-1 sm:gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white
                           px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-base sm:text-lg font-medium transition-colors"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">{t('common.profile')}</span>
                <span className="sm:hidden">{t('common.profile')}</span>
              </button>
              <button
                onClick={() => navigate('/comunicador')}
                className="flex items-center justify-center gap-1 sm:gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white
                           px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg text-base sm:text-xl font-medium transition-colors flex-1 sm:flex-initial"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">{t('patient.communicator')}</span>
                <span className="sm:hidden">{t('patient.communicator').substring(0, 5)}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1 sm:gap-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white
                           px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg text-base sm:text-xl font-medium transition-colors"
              >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">{t('common.logout')}</span>
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
                  ? 'text-blue-600 dark:text-blue-400 border-b-4 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <ImageIcon size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{t('admin.buttons')}</span>
                <span className="sm:hidden">{t('patient.buttons')}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-lg transition-colors whitespace-nowrap ${
                activeTab === 'profiles'
                  ? 'text-blue-600 dark:text-blue-400 border-b-4 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <Users size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{t('admin.profiles')}</span>
                <span className="sm:hidden">{t('admin.profiles').split(' ')[0]}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('organization')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-lg transition-colors whitespace-nowrap ${
                activeTab === 'organization'
                  ? 'text-blue-600 dark:text-blue-400 border-b-4 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <Settings size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Gestión del Centro</span>
                <span className="sm:hidden">Centro</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-lg transition-colors whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <AlertCircle size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Registro de Auditoría</span>
                <span className="sm:hidden">Auditoría</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'buttons' ? (
          <>
            {/* Add Button - Responsive */}
            <div className="mb-6 sm:mb-8">
              {!canInviteMembers && userData?.role === 'miembro' && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-800 font-medium">Acceso Restringido</p>
                    <p className="text-red-700 text-sm">No tienes permiso para crear o editar botones. Solo Administradores y Especialistas pueden realizar esta acción.</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowForm(true)}
                disabled={!canInviteMembers && userData?.role === 'miembro'}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-8 py-3 sm:py-4 rounded-lg text-lg sm:text-2xl font-bold transition-colors shadow-lg ${
                  canInviteMembers || userData?.role !== 'miembro'
                    ? 'bg-primary hover:bg-primary-dark active:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={(!canInviteMembers && userData?.role === 'miembro') ? 'Solo Administrador y Especialista pueden crear botones' : ''}
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
                    disabled={!canInviteMembers && userData?.role === 'miembro'}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      (canInviteMembers || userData?.role !== 'miembro')
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={(!canInviteMembers && userData?.role === 'miembro') ? 'Solo Administrador y Especialista pueden editar' : ''}
                  >
                    <Edit className="w-5 h-5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(button.id)}
                    disabled={!canInviteMembers && userData?.role === 'miembro'}
                    className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      (canInviteMembers || userData?.role !== 'miembro')
                        ? 'bg-danger hover:bg-danger-dark text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={(!canInviteMembers && userData?.role === 'miembro') ? 'Solo Administrador y Especialista pueden eliminar' : ''}
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
        ) : activeTab === 'profiles' ? (
          /* Tab de Perfiles */
          <AdminProfileManager />
        ) : activeTab === 'organization' ? (
          /* Tab de Gestión del Centro */
          <OrganizationManagement 
            organization={organization}
            onUpdate={loadOrganization}
          />
        ) : (
          /* Tab de Auditoría */
          <AuditLog 
            organizationId={userData?.organizationId}
            userEmail={user?.email}
          />
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
