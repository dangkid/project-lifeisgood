import { useState, useEffect } from 'react';
import { Building2, Users, Copy, Check, Edit2, Save, X, Trash2, UserCog, Shield } from 'lucide-react';
import { db, auth } from '../../config/firebase';
import { doc, updateDoc, collection, query, where, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import { getOrganizationMembers, getOrganizationInviteCode } from '../../services/organizationService';

export default function OrganizationManagement({ organization, onUpdate }) {
  const [members, setMembers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(organization?.name || '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    if (organization?.id) {
      loadMembers();
      loadInviteCode();
      loadCurrentUserRole();
    }
  }, [organization]);

  const loadMembers = async () => {
    try {
      const membersList = await getOrganizationMembers(organization.id);
      setMembers(membersList);
    } catch (error) {
      console.error('Error cargando miembros:', error);
    }
  };

  const loadInviteCode = async () => {
    try {
      const code = await getOrganizationInviteCode(organization.id);
      setInviteCode(code);
    } catch (error) {
      console.error('Error cargando código:', error);
    }
  };

  const loadCurrentUserRole = async () => {
    try {
      const memberDoc = await getDoc(doc(db, 'organizations', organization.id, 'members', auth.currentUser.uid));
      if (memberDoc.exists()) {
        setCurrentUserRole(memberDoc.data().role);
      }
    } catch (error) {
      console.error('Error cargando rol:', error);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'organizations', organization.id), {
        name: editedName.trim()
      });
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error actualizando nombre:', error);
      alert('Error al actualizar el nombre');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('¿Estás seguro de eliminar este miembro?')) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'organizations', organization.id, 'members', memberId));
      
      // Actualizar documento del usuario
      await updateDoc(doc(db, 'users', memberId), {
        organizationId: null,
        role: null
      });
      
      await loadMembers();
      alert('Miembro eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando miembro:', error);
      alert('Error al eliminar miembro');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'organizations', organization.id, 'members', memberId), {
        role: newRole
      });
      
      await updateDoc(doc(db, 'users', memberId), {
        role: newRole
      });
      
      await loadMembers();
    } catch (error) {
      console.error('Error cambiando rol:', error);
      alert('Error al cambiar rol');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Información del Centro */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Información del Centro</h2>
              <p className="text-sm text-gray-500">Gestiona los datos de tu organización</p>
            </div>
          </div>
        </div>

        {/* Nombre del Centro */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Nombre del Centro
          </label>
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Nombre del centro"
              />
              <button
                onClick={handleSaveName}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                Guardar
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedName(organization.name);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <X size={18} />
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-800">{organization?.name}</span>
              {isAdmin && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Edit2 size={16} />
                  Editar
                </button>
              )}
            </div>
          )}
        </div>

        {/* Código de Invitación */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código de Invitación
          </label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg font-mono text-lg font-bold text-blue-700">
              {inviteCode}
            </div>
            <button
              onClick={handleCopyCode}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copiado
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copiar
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Comparte este código con otros profesionales para que se unan a tu centro
          </p>
        </div>
      </div>

      {/* Gestión de Miembros */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Miembros del Centro</h2>
            <p className="text-sm text-gray-500">{members.length} miembro(s) activo(s)</p>
          </div>
        </div>

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  member.role === 'admin' ? 'bg-amber-100' : member.role === 'especialista' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {member.role === 'admin' ? (
                    <Shield className="w-5 h-5 text-amber-600" />
                  ) : (
                    <UserCog className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {member.displayName || member.email.split('@')[0]}
                    {member.id === auth.currentUser?.uid && (
                      <span className="ml-2 text-xs text-blue-600">(Tú)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && member.id !== auth.currentUser?.uid ? (
                  <>
                    <select
                      value={member.role}
                      onChange={(e) => handleChangeRole(member.id, e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      disabled={loading}
                    >
                      <option value="miembro">Miembro</option>
                      <option value="especialista">Especialista</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={loading}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </>
                ) : (
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    member.role === 'admin'
                      ? 'bg-amber-100 text-amber-700'
                      : member.role === 'especialista'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {member.role === 'admin' ? 'Administrador' : member.role === 'especialista' ? 'Especialista' : 'Miembro'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
