import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getProfile, getProfileStats } from './profileService';

// Generar PDF de reporte
export const generateProgressReport = async (profileId, dateRange = 'monthly') => {
  try {
    const profile = await getProfile(profileId);
    const stats = await getProfileStats(profileId);
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // blue-600
    doc.text('Reporte de Progreso AAC', 20, 20);
    
    // Profile info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Paciente: ${profile.name}`, 20, 35);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 42);
    
    if (profile.description) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const descLines = doc.splitTextToSize(profile.description, 170);
      doc.text(descLines, 20, 50);
    }
    
    // Tags
    if (profile.tags && profile.tags.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(59, 130, 246);
      doc.text(`Etiquetas: ${profile.tags.join(', ')}`, 20, 65);
    }
    
    // Stats summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen de Actividad', 20, 80);
    
    doc.setFontSize(11);
    doc.text(`Total de Frases Creadas: ${stats.total_phrases}`, 30, 90);
    doc.text(`Total de Botones Presionados: ${stats.total_button_clicks}`, 30, 97);
    
    if (stats.last_active) {
      doc.text(
        `Última Actividad: ${stats.last_active.toDate?.().toLocaleDateString('es-ES') || 'N/A'}`,
        30,
        104
      );
    }
    
    // Most used buttons table
    if (stats.most_used_buttons.length > 0) {
      doc.setFontSize(14);
      doc.text('Botones Más Utilizados', 20, 120);
      
      const tableData = stats.most_used_buttons.map((btn, index) => [
        index + 1,
        btn.text,
        btn.count,
        `${((btn.count / stats.total_button_clicks) * 100).toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: 125,
        head: [['#', 'Botón', 'Usos', '% del Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 15 },
          3: { cellWidth: 25 }
        }
      });
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pageCount} - AAC Comunicador - ${new Date().toLocaleDateString('es-ES')}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save
    doc.save(`reporte-aac-${profile.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Generar gráfico de progreso (usando canvas)
export const generateProgressChart = async (profileId) => {
  // Esta función podría generar un canvas con chart.js
  // Por ahora retorna los datos para graficar
  try {
    const stats = await getProfileStats(profileId);
    
    return {
      labels: stats.most_used_buttons.slice(0, 5).map(b => b.text),
      data: stats.most_used_buttons.slice(0, 5).map(b => b.count),
      total_phrases: stats.total_phrases,
      total_clicks: stats.total_button_clicks
    };
  } catch (error) {
    console.error('Error generating chart data:', error);
    throw error;
  }
};
