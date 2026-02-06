import { useState, useEffect } from 'react';
import { Star, Trash2, Pin } from 'lucide-react';
import { favoritesService } from '../../services/favoritesService.js';
import { useApp } from '../../contexts/AppContext';

export default function FavoritesPanel({ 
  userId, 
  profileId, 
  onSelectPhrase,
  isOpen = true
}) {
  const { isDark } = useApp();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [userId, profileId]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const faves = await favoritesService.getFavorites(userId, profileId);
      setFavorites(faves);
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFavorite = async (favoriteId) => {
    try {
      await favoritesService.removeFavorite(userId, favoriteId);
      setFavorites(favorites.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error('Error eliminando favorito:', error);
    }
  };

  const handleTogglePin = async (favorite) => {
    try {
      await favoritesService.togglePin(userId, favorite.id, favorite.isPinned);
      setFavorites(favorites.map(f =>
        f.id === favorite.id ? { ...f, isPinned: !f.isPinned } : f
      ));
    } catch (error) {
      console.error('Error actualizando pin:', error);
    }
  };

  const handleSelectFavorite = async (favorite) => {
    onSelectPhrase(favorite.text);
    // Incrementar uso
    await favoritesService.incrementUsage(userId, favorite.id);
  };

  if (!isOpen) return null;

  const pinnedFavorites = favorites.filter(f => f.isPinned);
  const unpinnedFavorites = favorites.filter(f => !f.isPinned);

  return (
    <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg overflow-hidden`}>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500" />
        <h3 className="font-bold text-gray-900 dark:text-gray-100">Mis Favoritos</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Cargando...
          </div>
        ) : favorites.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            Sin favoritos aún. Marca frases como favoritas.
          </div>
        ) : (
          <>
            {/* Favoritos Anclados */}
            {pinnedFavorites.length > 0 && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                {pinnedFavorites.map(fav => (
                  <button
                    key={fav.id}
                    onClick={() => handleSelectFavorite(fav)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 flex items-center justify-between group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {fav.text}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {fav.usageCount || 0} usos
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(fav);
                        }}
                        className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded"
                        title="Desanclar"
                      >
                        <Pin className="w-4 h-4 text-yellow-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFavorite(fav.id);
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Otros Favoritos */}
            {unpinnedFavorites.map(fav => (
              <button
                key={fav.id}
                onClick={() => handleSelectFavorite(fav)}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {fav.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {fav.usageCount || 0} usos
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(fav);
                    }}
                    className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded"
                    title="Anclar"
                  >
                    <Pin className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFavorite(fav.id);
                    }}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
