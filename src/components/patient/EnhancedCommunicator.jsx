import { useState, useCallback } from 'react';
import { Send, RotateCcw, Volume2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { communicationStatsService } from '../../services/communicationStatsService';
import EnhancedSearchBar from './EnhancedSearchBar';
import FavoritesPanel from './FavoritesPanel';
import ContextBoardSelector from './ContextBoardSelector';
import CommunicationStatsPanel from './CommunicationStatsPanel';
import KeyboardShortcuts from './KeyboardShortcuts';
import UserPreferencesPanel from './UserPreferencesPanel';
import ReportExportPanel from './ReportExportPanel';
import GestureHandler from './GestureHandler';

export default function EnhancedCommunicator({
  userId,
  profileId,
  userName,
  stats = {},
  communications = [],
  onCommunicate,
  isOpen = true
}) {
  const { isDark } = useApp();
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedContext, setSelectedContext] = useState('home');
  const [showPanel, setShowPanel] = useState('search'); // search, favorites, stats, preferences
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleAddText = useCallback((text) => {
    setCurrentMessage(prev => prev + (prev ? ' ' : '') + text);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim()) return;

    try {
      // Registrar comunicación en estadísticas
      await communicationStatsService.recordCommunication(
        userId,
        profileId,
        currentMessage,
        'general'
      );

      // Callback al padre
      onCommunicate?.({
        text: currentMessage,
        context: selectedContext,
        timestamp: new Date(),
        category: 'general'
      });

      // Hablar si está activado
      if (window.speechSynthesis) {
        handleSpeak(currentMessage);
      }

      setCurrentMessage('');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  }, [currentMessage, userId, profileId, selectedContext, onCommunicate]);

  const handleSpeak = (text) => {
    if (!window.speechSynthesis) return;

    // Cancelar síntesis anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleClear = useCallback(() => {
    setCurrentMessage('');
  }, []);

  const handleContextChange = useCallback((contextId) => {
    setSelectedContext(contextId);
  }, []);

  const handleSwipeRight = useCallback(() => {
    // Cambiar panel siguiente
    const panels = ['search', 'favorites', 'stats', 'preferences'];
    const currentIndex = panels.indexOf(showPanel);
    const nextIndex = (currentIndex + 1) % panels.length;
    setShowPanel(panels[nextIndex]);
  }, [showPanel]);

  const handleSwipeLeft = useCallback(() => {
    // Cambiar panel anterior
    const panels = ['search', 'favorites', 'stats', 'preferences'];
    const currentIndex = panels.indexOf(showPanel);
    const prevIndex = (currentIndex - 1 + panels.length) % panels.length;
    setShowPanel(panels[prevIndex]);
  }, [showPanel]);

  const handleDoubleTap = useCallback(() => {
    handleSendMessage();
  }, [handleSendMessage]);

  if (!isOpen) return null;

  return (
    <GestureHandler
      onSwipeRight={handleSwipeRight}
      onSwipeLeft={handleSwipeLeft}
      onDoubleTap={handleDoubleTap}
      enabled={true}
    >
      <div className={`flex flex-col h-full rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg overflow-hidden`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Comunicador</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                {selectedContext}
              </span>
            </div>
          </div>

          {/* Main Input Area */}
          <div className="space-y-2">
            {/* Search Bar */}
            <EnhancedSearchBar
              userId={userId}
              profileId={profileId}
              onSelect={handleAddText}
              userData={{ topWords: stats?.topWords || [] }}
            />

            {/* Current Message Display */}
            <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} min-h-12 flex items-center`}>
              <p className={`text-sm leading-relaxed ${
                currentMessage
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400 italic'
              }`}>
                {currentMessage || 'Escribe o selecciona palabras...'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSpeak(currentMessage)}
                disabled={!currentMessage || isSpeaking}
                className={`flex-1 px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  !currentMessage || isSpeaking
                    ? `${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                    : `${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`
                }`}
                title="Hablar (Ctrl+Space)"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Hablar</span>
              </button>

              <button
                onClick={handleClear}
                disabled={!currentMessage}
                className={`flex-1 px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  !currentMessage
                    ? `${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                    : `${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white`
                }`}
                title="Limpiar (Ctrl+L)"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Limpiar</span>
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!currentMessage}
                className={`flex-1 px-3 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                  !currentMessage
                    ? `${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                    : `${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`
                }`}
                title="Enviar (Enter o Doble tap)"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Enviar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full">
            {showPanel === 'search' && (
              <div className="h-full overflow-y-auto">
                <ContextBoardSelector
                  userId={userId}
                  profileId={profileId}
                  onContextChange={handleContextChange}
                  isOpen={true}
                />
              </div>
            )}

            {showPanel === 'favorites' && (
              <div className="h-full overflow-y-auto">
                <FavoritesPanel
                  userId={userId}
                  profileId={profileId}
                  onSelectPhrase={handleAddText}
                  isOpen={true}
                />
              </div>
            )}

            {showPanel === 'stats' && (
              <div className="h-full overflow-y-auto">
                <CommunicationStatsPanel
                  userId={userId}
                  profileId={profileId}
                  isOpen={true}
                />
              </div>
            )}

            {showPanel === 'preferences' && (
              <div className="h-full overflow-y-auto">
                <UserPreferencesPanel
                  userId={userId}
                  onPreferencesChange={(prefs) => {
                    console.log('Preferences updated:', prefs);
                  }}
                  isOpen={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700 flex gap-0 bg-gray-50 dark:bg-gray-750">
          {[
            { id: 'search', label: 'Contexto' },
            { id: 'favorites', label: 'Favoritos' },
            { id: 'stats', label: 'Estadísticas' },
            { id: 'preferences', label: 'Configuración' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setShowPanel(tab.id)}
              className={`flex-1 px-2 py-3 text-xs font-medium transition-colors border-b-2 ${
                showPanel === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : `border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Floating Elements */}
        <KeyboardShortcuts
          onSearch={() => setShowPanel('search')}
          onSpeak={() => handleSpeak(currentMessage)}
          onClear={handleClear}
          favorites={[]}
          isOpen={true}
        />

        {/* Hidden Report Panel - Trigger via menu */}
        <ReportExportPanel
          userId={userId}
          userName={userName}
          stats={stats}
          communications={communications}
          isOpen={false}
        />
      </div>
    </GestureHandler>
  );
}
