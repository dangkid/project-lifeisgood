import { useState } from 'react';
import { Download, Upload, FileJson, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { exportProfile, exportStats, importConfiguration } from '../../services/exportService';
import { generateProgressReport } from '../../services/reportService';

export default function ExportImportManager({ profile, onImport }) {
  const [showModal, setShowModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleExportProfile = async () => {
    setExporting(true);
    setMessage(null);
    try {
      await exportProfile(profile.id);
      setMessage({ type: 'success', text: 'Backup descargado exitosamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al exportar: ' + error.message });
    } finally {
      setExporting(false);
    }
  };

  const handleExportStats = async () => {
    setExporting(true);
    setMessage(null);
    try {
      await exportStats(profile.id);
      setMessage({ type: 'success', text: 'Estadísticas descargadas' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al exportar estadísticas' });
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateReport = async () => {
    setExporting(true);
    setMessage(null);
    try {
      await generateProgressReport(profile.id);
      setMessage({ type: 'success', text: 'Reporte PDF generado' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al generar reporte' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);
    try {
      const data = await importConfiguration(file);
      setMessage({ type: 'success', text: 'Configuración importada correctamente' });
      if (onImport) {
        onImport(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Download size={20} />
        Exportar/Importar
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Datos</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mensaje */}
            {message && (
              <div
                className={`mb-4 p-4 rounded-lg flex items-start gap-2 ${
                  message.type === 'success'
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-red-50 border-2 border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <p
                  className={`text-sm ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {/* Exportar Perfil Completo */}
              <button
                onClick={handleExportProfile}
                disabled={exporting}
                className="w-full flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 p-4 rounded-lg transition-colors disabled:opacity-50"
              >
                <FileJson className="w-6 h-6 text-blue-600" />
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">Backup Completo</p>
                  <p className="text-sm text-gray-600">Perfil + Botones + Estadísticas</p>
                </div>
                <Download className="w-5 h-5 text-blue-600" />
              </button>

              {/* Exportar Solo Estadísticas */}
              <button
                onClick={handleExportStats}
                disabled={exporting}
                className="w-full flex items-center gap-3 bg-green-50 hover:bg-green-100 border-2 border-green-200 p-4 rounded-lg transition-colors disabled:opacity-50"
              >
                <FileJson className="w-6 h-6 text-green-600" />
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">Solo Estadísticas</p>
                  <p className="text-sm text-gray-600">Datos de uso en JSON</p>
                </div>
                <Download className="w-5 h-5 text-green-600" />
              </button>

              {/* Generar Reporte PDF */}
              <button
                onClick={handleGenerateReport}
                disabled={exporting}
                className="w-full flex items-center gap-3 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 p-4 rounded-lg transition-colors disabled:opacity-50"
              >
                <FileText className="w-6 h-6 text-purple-600" />
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">Reporte PDF</p>
                  <p className="text-sm text-gray-600">Para terapeutas y médicos</p>
                </div>
                <Download className="w-5 h-5 text-purple-600" />
              </button>

              {/* Importar Configuración */}
              <label className="w-full flex items-center gap-3 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 p-4 rounded-lg transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-orange-600" />
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">Importar Backup</p>
                  <p className="text-sm text-gray-600">Restaurar desde archivo JSON</p>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={importing}
                  className="hidden"
                />
              </label>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                💡 <strong>Tip:</strong> Guarda backups regularmente para no perder tu
                progreso. Los archivos JSON pueden compartirse entre dispositivos.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
