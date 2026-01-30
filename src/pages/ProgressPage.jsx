import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Target, Award, Calendar, CheckCircle, Star, Users, RefreshCw, Download, Upload } from 'lucide-react';
import { getProgressSummary, resetUserProgress, exportProgress, importProgress } from '../services/progressService';

export default function ProgressPage({ user }) {
  const [progress, setProgress] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    loadProgress();
    generateWeeklyData();
  }, []);

  const loadProgress = () => {
    const summary = getProgressSummary();
    setProgress(summary);
  };

  const generateWeeklyData = () => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const data = days.map(day => ({
      day,
      minutes: Math.floor(Math.random() * 60) + 20 // Datos de ejemplo
    }));
    setWeeklyData(data);
  };

  const handleResetProgress = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar todo tu progreso? Esta acción no se puede deshacer.')) {
      resetUserProgress();
      loadProgress();
      alert('¡Progreso reiniciado correctamente! Comienza desde cero.');
    }
  };

  const handleExportProgress = () => {
    const exportData = exportProgress();
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `progreso_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Progreso exportado correctamente. Guarda el archivo para hacer backup.');
  };

  const handleImportProgress = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          if (importProgress(importedData)) {
            loadProgress();
            alert('¡Progreso importado correctamente!');
          } else {
            alert('Error al importar el progreso. El archivo puede estar corrupto.');
          }
        } catch (error) {
          alert('Error al leer el archivo. Asegúrate de que es un archivo JSON válido.');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  if (!progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  // Calcular progreso total con fórmula mejorada
  // Considera: lecciones (40%), precisión (20%), racha (20%), comunicación (10%), juegos (10%)
  const lessonProgress = Math.min((progress.educational.completedLessons / progress.educational.totalLessons) * 100, 100);
  const accuracyProgress = progress.educational.accuracy;
  const streakProgress = Math.min((progress.educational.streakDays / 30) * 100, 100);
  const communicationProgress = Math.min((progress.communication.totalPhrasesCreated / 100) * 100, 100);
  const gamesProgress = progress.games.totalPlayed > 0 ? 50 : 0; // Base si ha jugado
  
  const totalProgress = Math.round(
    (lessonProgress * 0.4) +
    (accuracyProgress * 0.2) +
    (streakProgress * 0.2) +
    (communicationProgress * 0.1) +
    (gamesProgress * 0.1)
  );

  const achievements = [
    { id: 1, title: 'Primeros Pasos', description: 'Completar primera lección', earned: progress.educational.completedLessons > 0, icon: Star },
    { id: 2, title: 'Consistencia', description: 'Practicar 7 días seguidos', earned: progress.educational.streakDays >= 7, icon: Calendar },
    { id: 3, title: 'Memoria Maestra', description: 'Completar juego de memoria', earned: progress.games.memoryBestTime !== null, icon: Award },
    { id: 4, title: 'Comunicador Activo', description: 'Usar 50 frases', earned: progress.communication.totalPhrasesCreated >= 50, icon: Users },
    { id: 5, title: 'Precisión Excelente', description: 'Alcanzar 90% de precisión', earned: progress.educational.accuracy >= 90, icon: Target },
    { id: 6, title: 'Explorador', description: 'Completar 5 lecciones', earned: progress.educational.completedLessons >= 5, icon: Trophy },
  ];

  const learningGoals = [
    { id: 1, title: 'Completar lecciones', progress: lessonProgress, target: 100, current: `${progress.educational.completedLessons}/${progress.educational.totalLessons}` },
    { id: 2, title: 'Mejorar precisión', progress: accuracyProgress, target: 100, current: `${progress.educational.accuracy}%` },
    { id: 3, title: 'Aumentar racha', progress: streakProgress, target: 100, current: `${progress.educational.streakDays} días` },
    { id: 4, title: 'Crear frases', progress: communicationProgress, target: 100, current: `${progress.communication.totalPhrasesCreated} frases` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Progreso
                </h1>
                <p className="text-xs text-neutral-500">Sigue tu evolución</p>
              </div>
              <h1 className="sm:hidden text-lg font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Progreso
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/panel-educativo"
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100"
              >
                Panel
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 rounded-full">
                <div className="w-2 h-2 bg-success-DEFAULT rounded-full animate-pulse"></div>
                <span className="text-sm text-success-dark font-medium">
                  {user?.displayName || user?.email?.split('@')[0] || 'Estudiante'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Tu Progreso de Aprendizaje
          </h2>
          <p className="text-lg text-neutral-600 max-w-3xl">
            Visualiza tu evolución, logros y metas en el camino de la comunicación.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-2xl font-bold text-neutral-900">{totalProgress}%</span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Progreso Total</h3>
            <p className="text-neutral-600 text-sm">Avance general en el programa</p>
            <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-secondary-600" />
              </div>
              <span className="text-2xl font-bold text-neutral-900">{progress.educational.streakDays}</span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Días Activos</h3>
            <p className="text-neutral-600 text-sm">Racha actual de práctica</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-accent-600" />
              </div>
              <span className="text-2xl font-bold text-neutral-900">{progress.educational.completedLessons}/{progress.educational.totalLessons}</span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Lecciones</h3>
            <p className="text-neutral-600 text-sm">Completadas / Totales</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-warning-600" />
              </div>
              <span className="text-2xl font-bold text-neutral-900">{progress.educational.badges}</span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Logros</h3>
            <p className="text-neutral-600 text-sm">Insignias obtenidas</p>
          </div>
        </div>

        {/* Gestión de Progreso */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-neutral-900 mb-4">Gestión de Progreso</h3>
          <p className="text-neutral-600 mb-4">Administra tu progreso de aprendizaje. Puedes reiniciar desde cero o hacer backup.</p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleResetProgress}
              className="flex items-center gap-2 bg-danger-DEFAULT hover:bg-danger-dark text-white px-4 py-3 rounded-lg transition-colors"
            >
              <RefreshCw size={20} />
              Reiniciar Progreso
            </button>
            <button
              onClick={handleExportProgress}
              className="flex items-center gap-2 bg-primary-DEFAULT hover:bg-primary-700 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <Download size={20} />
              Exportar Progreso
            </button>
            <button
              onClick={handleImportProgress}
              className="flex items-center gap-2 bg-success-DEFAULT hover:bg-success-dark text-white px-4 py-3 rounded-lg transition-colors"
            >
              <Upload size={20} />
              Importar Progreso
            </button>
          </div>
          <p className="text-sm text-neutral-500 mt-4">
            <strong>Nota:</strong> El progreso se guarda localmente en tu navegador. Reiniciar borrará todos tus datos actuales.
          </p>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-neutral-900">Actividad Semanal</h3>
            <span className="text-neutral-600">Minutos de práctica por día</span>
          </div>
          <div className="flex items-end justify-between h-48">
            {weeklyData.map((item, index) => {
              const height = (item.minutes / 80) * 100;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-neutral-900 font-bold mb-2">{item.minutes}</div>
                  <div
                    className="w-10 bg-gradient-to-t from-primary-500 to-accent-500 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="mt-2 text-neutral-600 font-medium">{item.day}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Goals */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-primary-500" />
              <h3 className="text-2xl font-bold text-neutral-900">Metas de Aprendizaje</h3>
            </div>
            <div className="space-y-6">
              {learningGoals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-neutral-900">{goal.title}</span>
                    <span className="text-neutral-700 font-bold">{goal.progress}%</span>
                  </div>
                  <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-neutral-500 mt-1">
                    Objetivo: {goal.target}%
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
              Establecer nuevas metas
            </button>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-warning-500" />
              <h3 className="text-2xl font-bold text-neutral-900">Logros</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 ${achievement.earned ? 'bg-success-50 border-success-200' : 'bg-neutral-50 border-neutral-200'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-success-100' : 'bg-neutral-100'}`}>
                        <Icon className={`w-5 h-5 ${achievement.earned ? 'text-success-600' : 'text-neutral-400'}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900">{achievement.title}</h4>
                        <p className="text-sm text-neutral-600">{achievement.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${achievement.earned ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-700'}`}>
                        {achievement.earned ? 'Obtenido' : 'Pendiente'}
                      </span>
                      {achievement.earned && <CheckCircle className="w-5 h-5 text-success-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}