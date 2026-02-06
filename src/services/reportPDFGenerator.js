import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

class ReportPDFGenerator {
  /**
   * Generar reporte PDF de comunicaciones
   * @param {Object} data - Datos del reporte
   * @param {string} data.userName - Nombre del usuario
   * @param {Array} data.communications - Array de comunicaciones
   * @param {Object} data.stats - Estadísticas aggregadas
   * @param {string} data.period - Período del reporte
   * @returns {Promise<void>}
   */
  async generateCommunicationReport(data) {
    const {
      userName,
      communications = [],
      stats = {},
      period = 'Última semana',
      includeCharts = true
    } = data;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.text('Reporte de Comunicación', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(10);
      doc.text(`Usuario: ${userName}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Período: ${period}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPosition);
      yPosition += 15;

      // Estadísticas Generales
      doc.setFontSize(14);
      doc.text('Estadísticas Generales', 20, yPosition);
      yPosition += 10;

      const statsData = [
        ['Métrica', 'Valor'],
        ['Total de comunicaciones', stats.totalCommunications || '0'],
        ['Palabras únicas', stats.uniqueWords || '0'],
        ['Clase más utilizada', stats.topCategory || 'N/A'],
        ['Promedio de palabras por comunicación', (stats.avgWordsPerCommunication || 0).toFixed(2)]
      ];

      doc.autoTable({
        startY: yPosition,
        head: [statsData[0]],
        body: statsData.slice(1),
        margin: { left: 20, right: 20 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Palabras más frecuentes
      if (stats.topWords && stats.topWords.length > 0) {
        doc.setFontSize(14);
        doc.text('Palabras Más Frecuentes', 20, yPosition);
        yPosition += 10;

        const wordsData = [
          ['Palabra', 'Frecuencia'],
          ...stats.topWords.slice(0, 10).map(w => [w.word, w.count.toString()])
        ];

        doc.autoTable({
          startY: yPosition,
          head: [wordsData[0]],
          body: wordsData.slice(1),
          margin: { left: 20, right: 20 }
        });

        yPosition = doc.lastAutoTable.finalY + 10;
      }

      // Comunicaciones Recientes
      if (communications.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Comunicaciones Recientes', 20, yPosition);
        yPosition += 10;

        const commData = [
          ['Fecha', 'Hora', 'Comunicación'],
          ...communications.slice(0, 15).map(c => [
            new Date(c.timestamp?.toDate?.() || c.timestamp).toLocaleDateString('es-ES'),
            new Date(c.timestamp?.toDate?.() || c.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            c.text.substring(0, 40) + (c.text.length > 40 ? '...' : '')
          ])
        ];

        doc.autoTable({
          startY: yPosition,
          head: [commData[0]],
          body: commData.slice(1),
          margin: { left: 20, right: 20 },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 25 },
            2: { cellWidth: pageWidth - 75 }
          }
        });

        yPosition = doc.lastAutoTable.finalY + 10;
      }

      // Estadísticas por Categoría
      if (stats.categoryStats && stats.categoryStats.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Uso por Categoría', 20, yPosition);
        yPosition += 10;

        const catData = [
          ['Categoría', 'Usos'],
          ...stats.categoryStats.map(c => [c.category, c.count.toString()])
        ];

        doc.autoTable({
          startY: yPosition,
          head: [catData[0]],
          body: catData.slice(1),
          margin: { left: 20, right: 20 }
        });
      }

      // Guardar PDF
      const filename = `reporte_comunicacion_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      return { success: true, filename };
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error(`Error al generar reporte: ${error.message}`);
    }
  }

  /**
   * Generar reporte de progreso
   */
  async generateProgressReport(data) {
    const {
      userName,
      achievements = [],
      milestones = [],
      improvements = []
    } = data;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.text('Reporte de Progreso', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFontSize(10);
      doc.text(`Usuario: ${userName}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, yPosition);
      yPosition += 15;

      // Logros
      if (achievements.length > 0) {
        doc.setFontSize(14);
        doc.text('Logros Alcanzados', 20, yPosition);
        yPosition += 8;

        achievements.forEach((achievement, idx) => {
          doc.setFontSize(11);
          doc.text(`• ${achievement.title}`, 25, yPosition);
          yPosition += 6;
          if (achievement.description) {
            doc.setFontSize(9);
            doc.text(achievement.description, 30, yPosition, { maxWidth: pageWidth - 50 });
            yPosition += 4;
          }
        });

        yPosition += 5;
      }

      // Hitos
      if (milestones.length > 0) {
        doc.setFontSize(14);
        doc.text('Hitos Alcanzados', 20, yPosition);
        yPosition += 8;

        milestones.forEach((milestone) => {
          doc.setFontSize(11);
          doc.text(`• ${milestone.title} (${milestone.date})`, 25, yPosition);
          yPosition += 6;
        });

        yPosition += 5;
      }

      // Áreas de Mejora
      if (improvements.length > 0) {
        doc.setFontSize(14);
        doc.text('Áreas de Mejora Sugeridas', 20, yPosition);
        yPosition += 8;

        improvements.forEach((improvement) => {
          doc.setFontSize(11);
          doc.text(`• ${improvement.area}`, 25, yPosition);
          yPosition += 6;
          if (improvement.suggestion) {
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(improvement.suggestion, 30, yPosition, { maxWidth: pageWidth - 50 });
            doc.setTextColor(0);
            yPosition += 4;
          }
        });
      }

      const filename = `reporte_progreso_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      return { success: true, filename };
    } catch (error) {
      console.error('Error generando reporte de progreso:', error);
      throw new Error(`Error al generar reporte de progreso: ${error.message}`);
    }
  }

  /**
   * Exportar a CSV
   */
  async exportToCSV(data, filename = 'communicate_export') {
    try {
      const {
        headers = [],
        rows = []
      } = data;

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true };
    } catch (error) {
      console.error('Error exportando CSV:', error);
      throw new Error(`Error al exportar CSV: ${error.message}`);
    }
  }

  /**
   * Genera resumen para enviar por email
   */
  generateEmailSummary(data) {
    const {
      userName,
      totalCommunications,
      topWord,
      topCategory,
      period
    } = data;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Resumen de Comunicación</h2>
        <p>Hola ${userName},</p>
        <p>Aquí está tu resumen de comunicación del ${period}:</p>
        
        <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Total de comunicaciones:</strong> ${totalCommunications}</p>
          <p><strong>Palabra más usada:</strong> ${topWord || 'N/A'}</p>
          <p><strong>Categoría preferida:</strong> ${topCategory || 'N/A'}</p>
        </div>
        
        <p>¡Sigue practicando! Cada comunicación te acerca a tus objetivos.</p>
        <p>---<br>Equipo de Life is Good</p>
      </div>
    `;

    return {
      subject: `Resumen de Comunicación - ${period}`,
      html,
      text: `Resumen para ${userName}: ${totalCommunications} comunicaciones. Palabra preferida: ${topWord}. Categoría: ${topCategory}.`
    };
  }
}

export const reportPDFGenerator = new ReportPDFGenerator();
export default reportPDFGenerator;
