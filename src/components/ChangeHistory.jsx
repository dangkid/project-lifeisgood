/**
 * Componente para ver historial de cambios
 * Muestra versiones anteriores de documentos (tipo Git)
 */

import { useState, useEffect } from 'react';
import { History, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import ChangeHistoryService from '../services/changeHistoryService';

export default function ChangeHistory({ organizationId, documentType, documentId }) {
  const [history, setHistory] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = ChangeHistoryService.subscribeToDocumentHistory(
      organizationId,
      documentType,
      documentId,
      (hist) => {
        setHistory(hist);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [organizationId, documentType, documentId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.toDate());
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeColor = (type) => {
    const colors = {
      added: 'text-green-600',
      modified: 'text-blue-600',
      removed: 'text-red-600'
    };
    return colors[type] || 'text-gray-600';
  };

  if (loading) {
    return <div className="text-center py-4">Cargando historial...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No hay cambios registrados aún
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <History size={20} />
        Historial de Cambios
      </h3>

      {history.map((change, idx) => (
        <div key={change.id} className="border rounded-lg dark:border-gray-600 overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center transition-colors"
          >
            <div className="text-left">
              <div className="font-semibold">{change.description}</div>
              <div className="text-sm text-gray-500">
                Por {change.userId} — {formatDate(change.timestamp)}
              </div>
            </div>
            {expandedIndex === idx ? <ChevronUp /> : <ChevronDown />}
          </button>

          {/* Detalles */}
          {expandedIndex === idx && (
            <div className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-600 p-4 space-y-3">
              {change.changes && change.changes.map((ch, chIdx) => (
                <div key={chIdx} className="text-sm space-y-1">
                  <div className={`font-semibold ${getChangeColor(ch.type)}`}>
                    {ch.field} ({ch.type})
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Antes</div>
                      <div className="font-mono text-sm bg-red-50 dark:bg-red-900 p-2 rounded">
                        {ch.oldValue === null ? '(vacío)' : String(ch.oldValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Después</div>
                      <div className="font-mono text-sm bg-green-50 dark:bg-green-900 p-2 rounded">
                        {ch.newValue === null ? '(vacío)' : String(ch.newValue)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón para revertir (si quieres implementar) */}
              <button
                className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <Undo2 size={16} />
                Revertir a esta versión
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
