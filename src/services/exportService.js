import { getProfile } from './profileService';
import { getButtons } from './buttonService';

// Exportar perfil completo a JSON
export const exportProfile = async (profileId) => {
  try {
    const profile = await getProfile(profileId);
    const allButtons = await getButtons();
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      profile: {
        name: profile.name,
        description: profile.description,
        tags: profile.tags,
        photo_url: profile.photo_url
      },
      buttons: allButtons,
      stats: profile.stats
    };
    
    // Crear archivo JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Crear link de descarga
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aac-backup-${profile.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting profile:', error);
    throw error;
  }
};

// Importar configuración desde JSON
export const importConfiguration = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validar estructura
        if (!data.version || !data.profile) {
          throw new Error('Archivo inválido');
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error('Error al leer el archivo: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
};

// Exportar solo estadísticas
export const exportStats = async (profileId) => {
  try {
    const profile = await getProfile(profileId);
    
    const statsData = {
      profile: profile.name,
      exportDate: new Date().toISOString(),
      stats: profile.stats,
      summary: {
        total_phrases: profile.stats?.total_phrases || 0,
        total_clicks: profile.stats?.total_button_clicks || 0,
        most_used: Object.entries(profile.stats?.most_used_buttons || {})
          .map(([id, data]) => ({ text: data.text, count: data.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      }
    };
    
    const dataStr = JSON.stringify(statsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aac-stats-${profile.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting stats:', error);
    throw error;
  }
};
