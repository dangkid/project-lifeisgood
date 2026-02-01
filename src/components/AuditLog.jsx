/**
 * Log de Auditoría
 * Componente para visualizar y filtrar el historial de cambios
 */

import { useState, useEffect } from 'react';
import {
  getAuditLogs,
  getAuditStatistics,
  AUDIT_ACTIONS,
  subscribeToAuditLogs,
  exportAuditLogsAsCSV
} from '../services/auditService';
import { AlertCircle, Download, Filter, X, Loader2 } from 'lucide-react';

export default function AuditLog({ organizationId, userEmail = null }) {
  // Estado general
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    action: null,
    documentType: null,
    userId: null,
    days: 30
  });

  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Cargar datos
  useEffect(() => {
    loadAuditData();
  }, [organizationId, filters]);

  const loadAuditData = async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      // Cargar logs con filtros
      const logsData = await getAuditLogs(organizationId, {
        action: filters.action,
        documentType: filters.documentType,
        userId: filters.userId || (userEmail ? userEmail : null),
        limit: 1000
      });

      setLogs(logsData);

      // Cargar estadísticas
      const statsData = await getAuditStatistics(organizationId, {
        days: filters.days
      });
      setStatistics(statsData);

      setPage(1);
    } catch (err) {
      console.error('Error loading audit data:', err);
      setError('Error al cargar el log de auditoría');
    } finally {
      setLoading(false);
    }
  };

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!organizationId) return;

    const unsubscribe = subscribeToAuditLogs(
      organizationId,
      (newLogs) => {
        // Aplicar filtros a los logs en tiempo real
        const filtered = newLogs.filter(log => {
          if (filters.action && log.action !== filters.action) return false;
          if (filters.documentType && log.documentType !== filters.documentType) return false;
          if (filters.userId && log.userId !== filters.userId) return false;
          return true;
        });
        setLogs(filtered.slice(0, 1000));
      },
      { userId: filters.userId || userEmail }
    );

    return () => unsubscribe?.();
  }, [organizationId, filters]);

  // Manejar cambios en filtros
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      action: null,
      documentType: null,
      userId: null,
      days: 30
    });
  };

  // Exportar logs
  const handleExport = async () => {
    try {
      setLoading(true);
      const csv = await exportAuditLogsAsCSV(organizationId, filters);

      // Crear y descargar archivo
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
      element.setAttribute('download', `auditlog_${new Date().toISOString().split('T')[0]}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error('Error exporting logs:', err);
      setError('Error al exportar logs');
    } finally {
      setLoading(false);
    }
  };

  // Obtener icono por acción
  const getActionIcon = (action) => {
    const icons = {
      [AUDIT_ACTIONS.CREATE]: '➕',
      [AUDIT_ACTIONS.UPDATE]: '✏️',
      [AUDIT_ACTIONS.DELETE]: '🗑️',
      [AUDIT_ACTIONS.LOGIN]: '🔓',
      [AUDIT_ACTIONS.LOGOUT]: '🔒',
      [AUDIT_ACTIONS.ROLE_CHANGE]: '👑',
      [AUDIT_ACTIONS.PERMISSION_DENIED]: '⛔'
    };
    return icons[action] || '📋';
  };

  // Obtener color por acción
  const getActionColor = (action) => {
    const colors = {
      [AUDIT_ACTIONS.CREATE]: 'bg-green-100 text-green-800',
      [AUDIT_ACTIONS.UPDATE]: 'bg-blue-100 text-blue-800',
      [AUDIT_ACTIONS.DELETE]: 'bg-red-100 text-red-800',
      [AUDIT_ACTIONS.LOGIN]: 'bg-purple-100 text-purple-800',
      [AUDIT_ACTIONS.LOGOUT]: 'bg-gray-100 text-gray-800',
      [AUDIT_ACTIONS.ROLE_CHANGE]: 'bg-yellow-100 text-yellow-800',
      [AUDIT_ACTIONS.PERMISSION_DENIED]: 'bg-red-100 text-red-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  // Calcular página
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedLogs = logs.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(logs.length / itemsPerPage);

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Historial de Cambios</h2>
        <button
          onClick={handleExport}
          disabled={loading || logs.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          <Download size={20} />
          Exportar CSV
        </button>
      </div>

      {/* Estadísticas */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Acciones</p>
            <p className="text-2xl font-bold text-blue-600">{statistics.totalActions}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Creaciones</p>
            <p className="text-2xl font-bold text-green-600">
              {statistics.actionsByType[AUDIT_ACTIONS.CREATE] || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Actualizaciones</p>
            <p className="text-2xl font-bold text-yellow-600">
              {statistics.actionsByType[AUDIT_ACTIONS.UPDATE] || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Eliminaciones</p>
            <p className="text-2xl font-bold text-red-600">
              {statistics.actionsByType[AUDIT_ACTIONS.DELETE] || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter size={20} />
          {Object.values(filters).some(v => v !== null && v !== 30) ? 'Filtros (Aplicados)' : 'Filtros'}
        </button>

        {showFilters && (
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro de acción */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Tipo de Acción
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(AUDIT_ACTIONS).map(action => (
                    <button
                      key={action}
                      onClick={() => updateFilter('action', action)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        filters.action === action
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                      }`}
                    >
                      {getActionIcon(action)} {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro de tipo documento */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Tipo de Documento
                </label>
                <div className="flex flex-wrap gap-2">
                  {['button', 'profile', 'user', 'organization', 'forum'].map(type => (
                    <button
                      key={type}
                      onClick={() => updateFilter('documentType', type)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        filters.documentType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro de días */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Período
                </label>
                <select
                  value={filters.days}
                  onChange={(e) => setFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>Últimos 7 días</option>
                  <option value={30}>Últimos 30 días</option>
                  <option value={90}>Últimos 90 días</option>
                  <option value={365}>Último año</option>
                </select>
              </div>
            </div>

            {Object.values(filters).some(v => v !== null && v !== 30) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <X size={16} />
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Cargando */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600 mr-3" size={32} />
          <span className="text-gray-600">Cargando historial...</span>
        </div>
      )}

      {/* Lista de logs */}
      {!loading && logs.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">No hay registros de auditoría</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedLogs.map((log) => (
              <div
                key={log.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icono y acción */}
                  <div className="flex-shrink-0">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)} {log.action}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-800">
                        {log.documentType && <span className="text-gray-600">{log.documentType}</span>}
                        {log.documentId && <span className="text-xs text-gray-500 ml-2">#{log.documentId.slice(-8)}</span>}
                      </p>
                      <time className="text-xs text-gray-500 flex-shrink-0">
                        {log.timestamp?.toLocaleString('es-ES') || 'N/A'}
                      </time>
                    </div>

                    {log.userId && (
                      <p className="text-sm text-gray-600 mt-1">
                        Por: <span className="font-semibold">{log.userId}</span>
                      </p>
                    )}

                    {/* Cambios */}
                    {Object.keys(log.changes || {}).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700">
                          Ver detalles ({Object.keys(log.changes).length} cambios)
                        </summary>
                        <div className="mt-2 bg-gray-50 rounded p-2 text-xs text-gray-700 space-y-1">
                          {Object.entries(log.changes).map(([field, change]) => (
                            <div key={field} className="font-mono">
                              <strong>{field}:</strong> {JSON.stringify(change.before)} → {JSON.stringify(change.after)}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 pt-6 border-t">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          )}

          {/* Resumen */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Mostrando {paginatedLogs.length} de {logs.length} registros
          </div>
        </>
      )}
    </div>
  );
}
