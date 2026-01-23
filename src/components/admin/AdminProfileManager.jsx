import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Camera, BarChart3, X, Upload, Tag } from 'lucide-react';
import { getProfiles, createProfile, updateProfile, deleteProfile, getProfileStats } from '../../services/profileService';
import { uploadProfilePhoto } from '../../services/storageService';
import ExportImportManager from './ExportImportManager';

export default function AdminProfileManager() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [statsProfile, setStatsProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    photo_url: '', 
    description: '', 
    tags: [] 
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setUploading(true);
    try {
      let photoUrl = formData.photo_url;
      
      // Si hay archivo seleccionado, subirlo primero
      if (selectedFile) {
        const tempId = `temp_${Date.now()}`;
        photoUrl = await uploadProfilePhoto(selectedFile, tempId);
      }
      
      await createProfile({
        ...formData,
        photo_url: photoUrl
      });
      
      await loadProfiles();
      setFormData({ name: '', photo_url: '', description: '', tags: [] });
      setSelectedFile(null);
      setPhotoPreview(null);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Error al crear perfil: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingProfile) return;

    setUploading(true);
    try {
      let photoUrl = formData.photo_url;
      
      // Si hay archivo seleccionado, subirlo
      if (selectedFile) {
        photoUrl = await uploadProfilePhoto(selectedFile, editingProfile.id);
      }
      
      await updateProfile(editingProfile.id, {
        ...formData,
        photo_url: photoUrl
      });
      
      await loadProfiles();
      setFormData({ name: '', photo_url: '', description: '', tags: [] });
      setSelectedFile(null);
      setPhotoPreview(null);
      setEditingProfile(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar perfil: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (!confirm('¿Eliminar este perfil y todas sus estadísticas?')) return;

    try {
      await deleteProfile(profileId);
      await loadProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Error al eliminar perfil');
    }
  };

  const handleShowStats = async (profile) => {
    setStatsProfile(profile);
    setShowStatsModal(true);
    try {
      const profileStats = await getProfileStats(profile.id);
      setStats(profileStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const openEditModal = (profile) => {
    setEditingProfile(profile);
    setFormData({ name: profile.name, photo_url: profile.photo_url || '' });
    setShowEditModal(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Perfiles de Pacientes</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Nuevo Perfil
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfiles...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <User size={48} className="mx-auto mb-3 opacity-50" />
          <p className="mb-2">No hay perfiles de pacientes</p>
          <p className="text-sm">Crea el primer perfil para comenzar</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                {profile.photo_url ? (
                  <img 
                    src={profile.photo_url} 
                    alt={profile.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={32} className="text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{profile.name}</h3>
                  {profile.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {profile.description}
                    </p>
                  )}
                  <div className="text-sm text-gray-600 mt-2">
                    <p>{profile.stats?.total_button_clicks || 0} clics</p>
                    <p>{profile.stats?.total_phrases || 0} frases</p>
                  </div>
                </div>
              </div>
              
              {/* Etiquetas */}
              {profile.tags && profile.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {profile.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {profile.tags.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{profile.tags.length - 3} más
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleShowStats(profile)}
                  className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <BarChart3 size={16} />
                  Stats
                </button>
                <ExportImportManager 
                  profile={profile}
                  onImport={() => loadProfiles()}
                />
                <button
                  onClick={() => openEditModal(profile)}
                  className="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteProfile(profile.id)}
                  className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Perfil */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Nuevo Perfil</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-4">
              {/* Preview de foto */}
              <div className="flex flex-col items-center mb-4">
                {photoPreview || formData.photo_url ? (
                  <img 
                    src={photoPreview || formData.photo_url} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mb-3" 
                  />
                ) : (
                  <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-200 mb-3">
                    <Camera size={40} className="text-blue-600" />
                  </div>
                )}
                
                {/* Botón de subir foto */}
                <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                  <Upload size={18} />
                  Subir Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG o GIF (máx. 5MB)</p>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Nombre del Paciente *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Ej: María González"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Descripción (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Ej: Paciente con autismo nivel 2, le gustan los colores azules..."
                />
              </div>

              {/* Etiquetas */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Etiquetas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Ej: Autismo, 8 años, No verbal..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Tag size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Subiendo...' : 'Crear Perfil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Perfil */}
      {showEditModal && editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Editar Perfil</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Preview de foto */}
              <div className="flex flex-col items-center mb-4">
                {photoPreview || formData.photo_url ? (
                  <img 
                    src={photoPreview || formData.photo_url} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mb-3" 
                  />
                ) : (
                  <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-200 mb-3">
                    <Camera size={40} className="text-blue-600" />
                  </div>
                )}
                
                {/* Botón de subir foto */}
                <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                  <Upload size={18} />
                  Cambiar Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG o GIF (máx. 5MB)</p>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Nombre del Paciente *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Descripción (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Ej: Paciente con autismo nivel 2, le gustan los colores azules..."
                />
              </div>

              {/* Etiquetas */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Etiquetas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Ej: Autismo, 8 años, No verbal..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Tag size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium">
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Estadísticas */}
      {showStatsModal && statsProfile && stats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                {statsProfile.photo_url ? (
                  <img src={statsProfile.photo_url} alt={statsProfile.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={24} className="text-blue-600" />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-800">Estadísticas de {statsProfile.name}</h2>
              </div>
              <button onClick={() => setShowStatsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-800 mb-1">Frases Creadas</p>
                <p className="text-4xl font-bold text-blue-900">{stats.total_phrases}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                <p className="text-sm text-purple-800 mb-1">Botones Presionados</p>
                <p className="text-4xl font-bold text-purple-900">{stats.total_button_clicks}</p>
              </div>
            </div>

            <h3 className="font-bold text-gray-800 mb-3">Botones Más Usados</h3>
            {stats.most_used_buttons.length > 0 ? (
              <div className="space-y-2">
                {stats.most_used_buttons.map((button, index) => (
                  <div key={button.id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-sm">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{button.text}</span>
                    </div>
                    <span className="text-gray-600 font-bold">{button.count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Aún no hay datos de uso</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
