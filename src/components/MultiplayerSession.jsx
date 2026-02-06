import { useState, useEffect } from 'react';
import { Users, MessageSquare, Share2, LogOut, Copy, AlertCircle } from 'lucide-react';
import MultiplayerService from '../services/multiplayerService';
import { useI18n } from '../services/i18nService';

export default function MultiplayerSession({ organizationId, userId, userName }) {
  const { t } = useI18n();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);

  // Cargar sesiones activas
  useEffect(() => {
    const unsubscribe = MultiplayerService.subscribeToActiveSessions(
      organizationId,
      (activeSessions) => setSessions(activeSessions)
    );
    return unsubscribe;
  }, [organizationId]);

  // Suscribirse a sesión activa
  useEffect(() => {
    if (!activeSession) return;

    const unsubscribe = MultiplayerService.subscribeToSession(
      organizationId,
      activeSession,
      (sessionData) => {
        setMessages(sessionData.messages || []);
        setParticipants(sessionData.participants || []);
      }
    );

    return unsubscribe;
  }, [activeSession, organizationId]);

  const handleCreateSession = async () => {
    if (!sessionCode.trim()) return;

    try {
      const newSessionId = await MultiplayerService.createSession(
        organizationId,
        userId,
        { title: sessionCode, description: '' }
      );
      setActiveSession(newSessionId);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleJoinSession = async () => {
    try {
      const sessionId = await MultiplayerService.joinSession(
        organizationId,
        sessionCode,
        userId
      );
      setActiveSession(sessionId);
      setSessionCode('');
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeSession) return;

    try {
      await MultiplayerService.sendMessage(
        organizationId,
        activeSession,
        userId,
        newMessage
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLeaveSession = async () => {
    if (!activeSession) return;

    try {
      await MultiplayerService.leaveSession(organizationId, activeSession, userId);
      setActiveSession(null);
      setMessages([]);
      setParticipants([]);
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  if (!activeSession) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users size={24} />
          {t('multiplayer.groupTherapy')}
        </h2>

        <div className="space-y-4">
          {/* Crear nueva sesión */}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('multiplayer.createSession')}
            </button>
          )}

          {showCreateForm && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder={t('multiplayer.sessionCode')}
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={handleCreateSession}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {t('common.create')}
              </button>
            </div>
          )}

          {/* Unirse a sesión */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder={`${t('multiplayer.sessionCode')}...`}
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              maxLength="6"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 uppercase"
            />
            <button
              onClick={handleJoinSession}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t('multiplayer.joinSession')}
            </button>
          </div>

          {/* Sesiones activas disponibles */}
          {sessions.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">{t('multiplayer.activeSessions')}</h3>
              <div className="space-y-2">
                {sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => {
                      setActiveSession(session.id);
                      setSessionCode('');
                    }}
                    className="w-full p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
                  >
                    <div className="font-semibold">{session.title || 'Sin título'}</div>
                    <div className="text-sm text-gray-500">
                      {session.participants.length} / {session.maxParticipants} {t('multiplayer.participants')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users size={24} />
          {t('multiplayer.groupTherapy')}
        </h2>
        <button
          onClick={handleLeaveSession}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut size={18} />
          {t('multiplayer.leaveSession')}
        </button>
      </div>

      {/* Participantes */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h3 className="font-semibold mb-2">{t('multiplayer.participants')} ({participants.length})</h3>
        <div className="flex flex-wrap gap-2">
          {participants.map((userId, idx) => (
            <div
              key={idx}
              className="px-3 py-1 bg-blue-200 dark:bg-blue-700 rounded-full text-sm"
            >
              {userName}
            </div>
          ))}
        </div>
      </div>

      {/* Mensajes */}
      <div className="border rounded-lg mb-4 h-64 overflow-y-auto dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {t('multiplayer.noMessages')}
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="mb-3 p-2 bg-white dark:bg-gray-800 rounded">
              <div className="text-sm font-semibold text-blue-600">{msg.userId === userId ? 'Tú' : msg.userId}</div>
              <div className="text-sm">{msg.message}</div>
            </div>
          ))
        )}
      </div>

      {/* Input de mensaje */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t('multiplayer.typeMessage')}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare size={18} />
        </button>
      </div>
    </div>
  );
}
