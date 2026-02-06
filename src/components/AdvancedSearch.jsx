/**
 * Búsqueda Avanzada
 * Componente para búsqueda filtrada de botones, perfiles y recursos
 */

import { useState, useEffect } from 'react';
import { Search, Filter, X, Loader2, AlertCircle } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  searchButtons,
  searchProfiles,
  getAvailableCategories,
  getAvailableColors,
  globalSearch
} from '../services/searchService';

export default function AdvancedSearch({ organizationId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  // Estado de búsqueda
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState('all'); // all, buttons, profiles

  // Resultados
  const [buttonResults, setButtonResults] = useState([]);
  const [profileResults, setProfileResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);

  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  
  const [filters, setFilters] = useState({
    category: null,
    color: null,
    type: null
  });

  // Paginación
  const [page, setPage] = useState(1);
  const [lastDocs, setLastDocs] = useState({});

  // Cargar opciones de filtro
  useEffect(() => {
    loadFilterOptions();
  }, [organizationId]);

  const loadFilterOptions = async () => {
    try {
      if (!organizationId) return;
      const [catsData, colsData] = await Promise.all([
        getAvailableCategories(organizationId),
        getAvailableColors(organizationId)
      ]);
      setCategories(catsData);
      setColors(colsData);
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  // Filtrar botones educacionales
  const isEducationalButton = (button) => {
    if (!button) return false;
    const title = (button.title || '').toLowerCase();
    const shortText = (button.shortText || '').toLowerCase();
    const text = (button.text || '').toLowerCase();
    
    // Excluir botones con títulos educacionales
    return title.includes('comunicaducación') || 
           title.includes('comunicajuegos') ||
           title.includes('aprende jugando') ||
           shortText.includes('comunicaducación') ||
           shortText.includes('comunicajuegos') ||
           shortText.includes('aprende jugando') ||
           text.includes('comunicaducación') ||
           text.includes('comunicajuegos') ||
           text.includes('aprende jugando');
  };

  // Ejecutar búsqueda
  const performSearch = async () => {
    if (!searchText.trim() || !organizationId) {
      setButtonResults([]);
      setProfileResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);
    setPage(1);
    setLastDocs({});

    try {
      if (searchType === 'all') {
        // Búsqueda global
        const result = await globalSearch(organizationId, searchText);
        const filteredButtons = result.buttons.filter(btn => !isEducationalButton(btn));
        setButtonResults(filteredButtons);
        setProfileResults(result.profiles);
        setTotalResults(filteredButtons.length + result.profiles.length);
      } else if (searchType === 'buttons') {
        // Búsqueda de botones
        const result = await searchButtons(organizationId, {
          text: searchText,
          category: filters.category,
          color: filters.color,
          limit: 20
        });
        const filteredButtons = result.data.filter(btn => !isEducationalButton(btn));
        setButtonResults(filteredButtons);
        setLastDocs(prev => ({ ...prev, buttons: result.lastDoc }));
        setTotalResults(filteredButtons.length);
      } else if (searchType === 'profiles') {
        // Búsqueda de perfiles
        const result = await searchProfiles(organizationId, {
          text: searchText,
          type: filters.type,
          limit: 20
        });
        setProfileResults(result.data);
        setLastDocs(prev => ({ ...prev, profiles: result.lastDoc }));
        setTotalResults(result.data.length);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Error al realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar búsqueda cuando cambie el texto o los filtros
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchText.trim() || (filters.category || filters.color || filters.type)) {
        performSearch();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchText, filters, searchType]);

  // Cambiar tipo de búsqueda
  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setFilters({ category: null, color: null, type: null });
    setPage(1);
  };

  // Actualizar filtro
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value
    }));
    setPage(1);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchText('');
    setFilters({ category: null, color: null, type: null });
    setButtonResults([]);
    setProfileResults([]);
    setTotalResults(0);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Búsqueda Avanzada</h2>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar botones, perfiles, recursos..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchText && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter size={20} />
            Filtros
          </button>
        </div>
      </div>

      {/* Tabs de tipo de búsqueda */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { value: 'all', label: 'Todo' },
          { value: 'buttons', label: '🔘 Botones' },
          { value: 'profiles', label: '👤 Perfiles' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => handleSearchTypeChange(tab.value)}
            className={`px-4 py-2 font-medium transition-colors ${
              searchType === tab.value
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Filtros</h3>

          {/* Filtro de categoría (solo para botones) */}
          {(searchType === 'buttons' || searchType === 'all') && categories.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', cat)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.category === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtro de color (solo para botones) */}
          {(searchType === 'buttons' || searchType === 'all') && colors.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => updateFilter('color', color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      filters.color === color ? 'ring-2 ring-offset-2 ring-blue-600' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Filtro de tipo (solo para perfiles) */}
          {(searchType === 'profiles' || searchType === 'all') && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Tipo de Perfil
              </label>
              <div className="flex flex-wrap gap-2">
                {['patient', 'therapist', 'admin'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateFilter('type', type)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.type === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    {type === 'patient' ? '👤 Paciente' : type === 'therapist' ? '👨‍⚕️ Terapeuta' : '👑 Admin'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <span className="ml-3 text-gray-600">Buscando...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Resultados */}
      {!loading && !error && totalResults === 0 && searchText && (
        <div className="text-center py-8">
          <Search className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">No se encontraron resultados para "{searchText}"</p>
        </div>
      )}

      {/* Botones */}
      {(searchType === 'buttons' || searchType === 'all') && buttonResults.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🔘 Botones ({buttonResults.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buttonResults.map(button => (
              <div
                key={button.id}
                className="p-4 rounded-lg border-2 transition-all hover:shadow-md"
                style={{ borderColor: button.color || '#e5e7eb' }}
              >
                <div
                  className="w-full p-4 rounded-lg text-white font-semibold text-center mb-3 transition-transform hover:scale-105"
                  style={{ backgroundColor: button.color || '#3b82f6' }}
                >
                  {button.title}
                </div>
                <p className="text-sm text-gray-600 mb-2">{button.shortText}</p>
                {button.category && (
                  <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                    {button.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perfiles */}
      {(searchType === 'profiles' || searchType === 'all') && profileResults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            👤 Perfiles ({profileResults.length})
          </h3>
          <div className="space-y-3">
            {profileResults.map(profile => (
              <div
                key={profile.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{profile.name}</h4>
                    {profile.description && (
                      <p className="text-sm text-gray-600 mt-1">{profile.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {profile.type || 'Otro'}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {profile.status || 'Activo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen de resultados */}
      {!loading && totalResults > 0 && (
        <div className="text-center text-sm text-gray-500 mt-6 pt-6 border-t">
          Mostrando {totalResults} resultado{totalResults !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
