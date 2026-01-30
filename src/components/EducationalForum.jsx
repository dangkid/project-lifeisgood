import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, User, Clock, ThumbsUp, Users, ArrowLeft, Tag, MessageCircle, TrendingUp, Filter, Plus } from 'lucide-react';
import { getCurrentOrganization } from '../services/organizationService';

export default function EducationalForum({ currentUser }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Autismo' });
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrganization();
    // En una implementación real, cargaríamos posts desde Firestore
    // Por ahora, inicializamos vacío
  }, []);

  const loadOrganization = async () => {
    const org = await getCurrentOrganization();
    setOrganization(org);
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES');
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const newPostObj = {
      id: Date.now(),
      title: newPost.title,
      author: currentUser?.displayName || 'Usuario',
      content: newPost.content,
      category: newPost.category,
      likes: 0,
      replies: 0,
      timestamp: new Date().toISOString(),
      organizationId: organization?.id || 'global',
    };

    setPosts([newPostObj, ...posts]);
    setNewPost({ title: '', content: '', category: 'Autismo' });
  };

  const handleLikePost = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleReply = (postId) => {
    // En una implementación real, abriría un modal o expandiría un formulario
    alert('Funcionalidad de respuesta en desarrollo');
  };

  const categories = ['Autismo', 'Afasia', 'Tecnología', 'Educación', 'Recursos', 'Experiencias'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Foro del Centro</h1>
              <p className="text-gray-600">
                {organization ? `Foro exclusivo para ${organization.name}` : 'Comparte experiencias y aprende con otros profesionales'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors bg-white border border-blue-200 hover:border-blue-300 px-4 py-2 rounded-lg shadow-sm"
          >
            <ArrowLeft size={20} />
            Volver al Panel
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">{posts.length}</div>
            <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <MessageCircle size={16} />
              Discusiones
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-purple-600">
              {posts.reduce((sum, post) => sum + post.replies, 0)}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <Users size={16} />
              Respuestas
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-green-600">
              {posts.reduce((sum, post) => sum + post.likes, 0)}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <ThumbsUp size={16} />
              Me gusta
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-amber-600">{categories.length}</div>
            <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <Tag size={16} />
              Categorías
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Crear nueva discusión */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={20} />
                Nueva Discusión
              </h3>
              <form onSubmit={handleSubmitPost} className="space-y-4">
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                  placeholder="Título de la discusión"
                  required
                />
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors h-40 resize-none"
                  placeholder="Describe tu pregunta o experiencia..."
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Publicar Discusión
                </button>
              </form>
            </div>

            {/* Categorías */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter size={20} />
                Categorías
              </h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between"
                  >
                    <span className="text-gray-700">{cat}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {posts.filter(p => p.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de Discusiones */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare size={24} />
                  Discusiones Recientes
                </h3>
                <div className="text-sm text-gray-500">
                  {posts.length === 0 ? 'No hay discusiones aún' : `${posts.length} discusiones`}
                </div>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-12 h-12 text-blue-500" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">¡Sé el primero en publicar!</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Este foro es exclusivo para tu centro. Crea la primera discusión para compartir experiencias, hacer preguntas o ayudar a otros profesionales.
                  </p>
                  <button
                    onClick={() => document.querySelector('input')?.focus()}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus size={20} />
                    Crear Primera Discusión
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map(post => (
                    <div key={post.id} className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all hover:shadow-md">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                            <User size={20} />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{post.title}</h4>
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <User size={14} />
                                  <span className="font-medium">{post.author}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Clock size={14} />
                                  <span>{formatRelativeTime(post.timestamp)}</span>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  {post.category}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-600">
                                  <span className="font-bold">{post.replies}</span> respuestas
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => handleLikePost(post.id)}
                              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <ThumbsUp size={18} />
                              <span className="font-medium">{post.likes}</span>
                            </button>
                            <button
                              onClick={() => handleReply(post.id)}
                              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                            >
                              <MessageCircle size={18} />
                              <span className="font-medium">Responder</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}