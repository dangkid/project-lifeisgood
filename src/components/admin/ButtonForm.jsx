import { useState } from 'react';
import { createButton, updateButton } from '../../services/buttonService';
import { searchPictograms } from '../../services/arasaacService';
import { Search, Link } from 'lucide-react';

export default function ButtonForm({ button, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    text: button?.text || '',
    audio_url: button?.audio_url || '',
    image_url: button?.image_url || '',
    type: button?.type || 'communication',
    category: button?.category || 'necesidades',
    time_context: button?.time_context || ['always'],
    priority: button?.priority || 0,
    voice_gender: button?.voice_gender || 'female',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ARASAAC integration state
  const [imageMode, setImageMode] = useState('arasaac'); // 'arasaac' or 'url'
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pictograms, setPictograms] = useState([]);
  const [searchingPictograms, setSearchingPictograms] = useState(false);

  const handleSearchPictograms = async () => {
    if (!searchKeyword.trim()) return;
    
    setSearchingPictograms(true);
    setError(''); // Clear previous errors
    try {
      const results = await searchPictograms(searchKeyword);
      setPictograms(results || []);
      if (!results || results.length === 0) {
        setError('No se encontraron pictogramas para "' + searchKeyword + '"');
      }
    } catch (err) {
      console.error('Error searching ARASAAC:', err);
      setError('Error al buscar pictogramas. Verifica tu conexión a internet.');
      setPictograms([]);
    } finally {
      setSearchingPictograms(false);
    }
  };

  const handleSelectPictogram = (pictogram) => {
    setFormData({ ...formData, image_url: pictogram.imageUrl });
    setPictograms([]); // Clear search results
    setSearchKeyword(''); // Clear search keyword
  };

  const handleTimeContextChange = (context) => {
    let newContexts = [...formData.time_context];
    
    if (context === 'always') {
      newContexts = ['always'];
    } else {
      newContexts = newContexts.filter(c => c !== 'always');
      
      if (newContexts.includes(context)) {
        newContexts = newContexts.filter(c => c !== context);
      } else {
        newContexts.push(context);
      }
      
      if (newContexts.length === 0) {
        newContexts = ['always'];
      }
    }
    
    setFormData({ ...formData, time_context: newContexts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);
    setError('');

    try {
      if (button) {
        await updateButton(button.id, formData);
      } else {
        await createButton(formData);
      }
      // Success - close form immediately
      onSuccess();
    } catch (err) {
      console.error('Error saving button:', err);
      setError(err.message || 'Error al guardar el botón');
      setLoading(false); // Only reset loading on error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        {button ? 'Editar Botón' : 'Crear Nuevo Botón'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tipo de botón */}
      <div>
        <label className="block text-xl font-medium text-gray-900 mb-3">
          Tipo de Botón
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="communication"
              checked={formData.type === 'communication'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-5 h-5"
            />
            <span className="text-lg">Comunicación (Voz)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="story"
              checked={formData.type === 'story'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-5 h-5"
            />
            <span className="text-lg">Cuento (Audio)</span>
          </label>
        </div>
      </div>

      {/* Texto */}
      <div>
        <label className="block text-xl font-medium text-gray-900 mb-3">
          {formData.type === 'communication' ? 'Texto a Pronunciar' : 'Título del Cuento'}
        </label>
        <input
          type="text"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary"
          placeholder={formData.type === 'communication' ? 'Ej: Tengo sed' : 'Ej: La liebre y la tortuga'}
          required
        />
      </div>

      {/* Voz (solo para comunicación) */}
      {formData.type === 'communication' && (
        <>
          <div>
            <label className="block text-xl font-medium text-gray-900 mb-3">
              Voz del Mensaje
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="female"
                  checked={formData.voice_gender === 'female'}
                  onChange={(e) => setFormData({ ...formData, voice_gender: e.target.value })}
                  className="w-5 h-5"
                />
                <span className="text-lg">👩 Voz Femenina</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="male"
                  checked={formData.voice_gender === 'male'}
                  onChange={(e) => setFormData({ ...formData, voice_gender: e.target.value })}
                  className="w-5 h-5"
                />
                <span className="text-lg">👨 Voz Masculina</span>
              </label>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xl font-medium text-gray-900 mb-3">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary"
            >
              <option value="necesidades">🏠 Necesidades</option>
              <option value="emociones">❤️ Emociones</option>
              <option value="comida">🍽️ Comida</option>
              <option value="actividades">😊 Actividades</option>
            </select>
          </div>
        </>
      )}

      {/* URL de Audio (solo para cuentos) */}
      {formData.type === 'story' && (
        <div>
          <label className="block text-xl font-medium text-gray-900 mb-3">
            URL del Audio
          </label>
          <input
            type="url"
            value={formData.audio_url}
            onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary"
            placeholder="https://ejemplo.com/audio.mp3"
            required={formData.type === 'story'}
          />
          <p className="text-sm text-gray-600 mt-2">
            Sube tu audio a un servicio como <a href="https://soundcloud.com" target="_blank" className="text-primary underline">SoundCloud</a> o <a href="https://drive.google.com" target="_blank" className="text-primary underline">Google Drive</a>
          </p>
        </div>
      )}

      {/* Contexto Temporal */}
      <div>
        <label className="block text-xl font-medium text-gray-900 mb-3">
          ¿Cuándo mostrar este botón?
        </label>
        <div className="space-y-2">
          {['always', 'morning', 'afternoon', 'night'].map((context) => (
            <label key={context} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.time_context.includes(context)}
                onChange={() => handleTimeContextChange(context)}
                className="w-5 h-5"
              />
              <span className="text-lg">
                {context === 'morning' && 'Mañana (08:00-14:00)'}
                {context === 'afternoon' && 'Tarde (14:00-20:00)'}
                {context === 'night' && 'Noche (20:00-08:00)'}
                {context === 'always' && 'Siempre Visible'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Prioridad */}
      <div>
        <label className="block text-xl font-medium text-gray-900 mb-3">
          Prioridad (orden de visualización)
        </label>
        <input
          type="number"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary"
          min="0"
        />
        <p className="text-sm text-gray-600 mt-2">
          Los botones con mayor prioridad aparecen primero. Por defecto: 0
        </p>
      </div>

      {/* Imagen - Tabs para ARASAAC o URL */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <label className="block text-xl font-medium text-gray-900 mb-4">
          Imagen
        </label>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b-2 border-gray-300">
          <button
            type="button"
            onClick={() => setImageMode('arasaac')}
            className={`px-6 py-2 text-lg font-medium transition-colors ${
              imageMode === 'arasaac'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="inline w-5 h-5 mr-2" />
            Buscar Pictograma ARASAAC
          </button>
          <button
            type="button"
            onClick={() => setImageMode('url')}
            className={`px-6 py-2 text-lg font-medium transition-colors ${
              imageMode === 'url'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Link className="inline w-5 h-5 mr-2" />
            URL Personalizada
          </button>
        </div>

        {/* ARASAAC Search */}
        {imageMode === 'arasaac' && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchPictograms())}
                className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary"
                placeholder="Buscar: agua, baño, dolor..."
              />
              <button
                type="button"
                onClick={handleSearchPictograms}
                disabled={searchingPictograms}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 font-medium"
              >
                {searchingPictograms ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            {/* Search Results */}
            {pictograms.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mb-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                {pictograms.map((pictogram) => (
                  <div
                    key={pictogram.id}
                    onClick={() => handleSelectPictogram(pictogram)}
                    className="cursor-pointer border-2 border-gray-200 bg-white rounded-lg p-2 hover:border-primary hover:shadow-md transition-all"
                  >
                    <img
                      src={pictogram.thumbnailUrl}
                      alt={Array.isArray(pictogram.keywords) ? pictogram.keywords[0] : 'pictogram'}
                      className="w-full h-24 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImagen%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <p className="text-xs text-center mt-1 text-gray-600 truncate">
                      {Array.isArray(pictogram.keywords) ? pictogram.keywords[0] : 'Sin nombre'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* URL Input */}
        {imageMode === 'url' && (
          <div>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary"
              placeholder="https://ejemplo.com/imagen.png"
            />
            <p className="text-sm text-gray-600 mt-2">
              Sube tu imagen a <a href="https://imgur.com/upload" target="_blank" className="text-primary underline">Imgur</a> o <a href="https://cloudinary.com" target="_blank" className="text-primary underline">Cloudinary</a> y pega la URL aquí
            </p>
          </div>
        )}

        {/* Image Preview */}
        {formData.image_url && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
            <img
              src={formData.image_url}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
            />
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary text-white px-8 py-4 text-xl font-bold rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {loading ? 'Guardando...' : button ? 'Actualizar' : 'Crear Botón'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 text-xl font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
