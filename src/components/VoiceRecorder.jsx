/**
 * Componente de Grabador de Voz
 * Permite grabar y guardar frases personalizadas
 */

import { useState, useEffect } from 'react';
import { Mic, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { voiceRecorderService } from '../services/voiceRecorderService';
import { useI18n } from '../services/i18nService';

export default function VoiceRecorder({ onRecordingSaved }) {
  const { t } = useI18n();
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState(null);

  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    const hasPermission = await voiceRecorderService.checkMicrophonePermission();
    setPermission(hasPermission);
  };

  const handleStartRecording = async () => {
    setLoading(true);
    setError(null);

    const success = await voiceRecorderService.startRecording();
    if (success) {
      setIsRecording(true);
    } else {
      setError('No se pudo acceder al micrófono');
    }
    setLoading(false);
  };

  const handleStopRecording = async () => {
    setLoading(true);
    const recording = await voiceRecorderService.stopRecording();
    
    if (recording) {
      setRecordings([...recordings, {
        id: Date.now(),
        url: recording.url,
        blob: recording.blob,
        timestamp: new Date()
      }]);
      
      if (onRecordingSaved) {
        onRecordingSaved(recording);
      }
    }

    setIsRecording(false);
    setLoading(false);
  };

  const handlePlayRecording = (url) => {
    voiceRecorderService.playRecording(url);
  };

  const handleDeleteRecording = (id) => {
    setRecordings(recordings.filter(r => r.id !== id));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Mic size={24} />
        {t('voiceRecorder.title')}
      </h2>

      {/* Estado de permisos */}
      {permission === false && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{t('voiceRecorder.microphoneRequired')}</span>
        </div>
      )}

      {/* Botones de control */}
      <div className="flex gap-2 mb-6">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            disabled={loading || permission === false}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <Mic size={20} />}
            {t('voiceRecorder.startRecording')}
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-semibold"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <Mic size={20} />}
            {t('voiceRecorder.stopRecording')}
          </button>
        )}
      </div>

      {/* Indicador de grabación */}
      {isRecording && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-300">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="font-semibold">{t('voiceRecorder.recording')}</span>
          </div>
        </div>
      )}

      {/* Grabaciones guardadas */}
      {recordings.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">{t('voiceRecorder.savedRecordings')}</h3>
          <div className="space-y-2">
            {recordings.map(recording => (
              <div
                key={recording.id}
                className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(recording.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePlayRecording(recording.url)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    ▶ {t('voiceRecorder.play')}
                  </button>
                  <button
                    onClick={() => handleDeleteRecording(recording.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
