import { useState } from 'react';
import { Download, FileText, Clock, Mail } from 'lucide-react';
import { reportPDFGenerator } from '../../services/reportPDFGenerator';
import { useApp } from '../../contexts/AppContext';

export default function ReportExportPanel({
  userId,
  userName,
  stats,
  communications = [],
  isOpen = true
}) {
  const { isDark } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [reportType, setReportType] = useState('communication');

  const getPeriodLabel = (period) => {
    const labels = {
      week: 'Última semana',
      month: 'Último mes',
      quarter: 'Último trimestre',
      year: 'Último año'
    };
    return labels[period] || period;
  };

  const handleGenerateReport = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      if (reportType === 'communication') {
        await reportPDFGenerator.generateCommunicationReport({
          userName,
          communications,
          stats: {
            ...stats,
            totalCommunications: stats?.totalCount || 0,
            uniqueWords: stats?.topWords?.length || 0,
            topCategory: stats?.categoryStats?.[0]?.category || 'N/A',
            avgWordsPerCommunication: (communications.length > 0 
              ? communications.reduce((sum, c) => sum + (c.text?.split(/\s+/).length || 0), 0) / communications.length
              : 0)
          },
          period: getPeriodLabel(selectedPeriod),
          includeCharts: true
        });
      } else if (reportType === 'progress') {
        // Por ahora usar datos vacíos, en producción vendrían de la base de datos
        await reportPDFGenerator.generateProgressReport({
          userName,
          achievements: [],
          milestones: [],
          improvements: []
        });
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsGenerating(true);

      const headers = ['Fecha', 'Hora', 'Comunicación', 'Categoría', 'Longitud'];
      const rows = communications.map(c => [
        new Date(c.timestamp?.toDate?.() || c.timestamp).toLocaleDateString('es-ES'),
        new Date(c.timestamp?.toDate?.() || c.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        c.text,
        c.category || 'N/A',
        c.text?.split(/\s+/).length || 0
      ]);

      await reportPDFGenerator.exportToCSV({ headers, rows }, `comunicaciones_${userName}`);
    } catch (error) {
      console.error('Error en CSV:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      const summary = reportPDFGenerator.generateEmailSummary({
        userName,
        totalCommunications: stats?.totalCount || 0,
        topWord: stats?.topWords?.[0]?.word || 'N/A',
        topCategory: stats?.categoryStats?.[0]?.category || 'N/A',
        period: getPeriodLabel(selectedPeriod)
      });

      // En producción, enviar a un endpoint backend que maneje el email
      console.log('Email summary:', summary);
      alert('Resumen preparado. En producción se enviaría por email.');
    } catch (error) {
      console.error('Error preparando email:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg overflow-hidden`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <Download className="w-5 h-5 text-green-500" />
        <h3 className="font-bold text-gray-900 dark:text-gray-100">Exportar Reportes</h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Tipo de Reporte */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Tipo de reporte
          </label>
          <div className="flex gap-2">
            {[
              { id: 'communication', label: 'Comunicaciones', icon: FileText },
              { id: 'progress', label: 'Progreso', icon: Clock }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  reportType === type.id
                    ? 'bg-green-500 text-white'
                    : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Período */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Período
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`w-full px-3 py-2 rounded border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            } text-sm`}
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último año</option>
          </select>
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          {/* PDF */}
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isGenerating
                ? `${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                : `${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`
            }`}
          >
            <FileText className="w-4 h-4" />
            {isGenerating ? 'Generando...' : 'Descargar PDF'}
          </button>

          {/* CSV */}
          <button
            onClick={handleExportCSV}
            disabled={isGenerating}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isGenerating
                ? `${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                : `${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`
            }`}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>

          {/* Email */}
          <button
            onClick={handleSendEmail}
            disabled={isGenerating}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isGenerating
                ? `${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                : `${isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`
            }`}
          >
            <Mail className="w-4 h-4" />
            Enviar por Email
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className={`px-4 py-3 border-t border-gray-200 dark:border-gray-700 ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Los reportes incluyen estadísticas completas y comunicaciones del período seleccionado.
        </p>
      </div>
    </div>
  );
}
