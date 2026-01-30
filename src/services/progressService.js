// Servicio para manejar el progreso del usuario desde cero
// Almacena datos en localStorage para persistencia local

const STORAGE_KEY = 'user_progress_data';

// Estructura inicial de progreso
const initialProgress = {
  // Progreso educativo
  educational: {
    completedLessons: 0,
    totalLessons: 12,
    accuracy: 0,
    streakDays: 0,
    totalTime: '0h 0min',
    badges: [],
    lastActivity: null
  },
  
  // Progreso en juegos
  games: {
    memoryGame: {
      bestTime: null,
      bestMoves: null,
      gamesPlayed: 0,
      totalMatches: 0
    },
    puzzleGame: {
      completed: 0,
      bestScore: 0
    },
    quizGame: {
      correctAnswers: 0,
      totalQuestions: 0
    }
  },
  
  // Progreso en comunicación
  communication: {
    totalButtonClicks: 0,
    totalPhrasesCreated: 0,
    mostUsedButtons: [],
    dailyUsage: {}
  },
  
  // Metas y logros
  achievements: {
    unlocked: [],
    inProgress: [
      { id: 'first_lesson', title: 'Completa tu primera lección', progress: 0, target: 1 },
      { id: 'memory_master', title: 'Completa el juego de memoria', progress: 0, target: 1 },
      { id: 'communicator_7', title: 'Usa el comunicador 7 días seguidos', progress: 0, target: 7 }
    ]
  },
  
  // Estadísticas generales
  stats: {
    accountCreated: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    totalSessions: 1
  }
};

/**
 * Obtiene el progreso del usuario desde localStorage
 * Si no existe, crea una nueva estructura inicial
 */
export function getUserProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Si no existe, crear progreso inicial
    const newProgress = { ...initialProgress };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    return newProgress;
  } catch (error) {
    console.error('Error getting user progress:', error);
    return { ...initialProgress };
  }
}

/**
 * Guarda el progreso del usuario en localStorage
 */
export function saveUserProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('Error saving user progress:', error);
    return false;
  }
}

/**
 * Reinicia completamente el progreso del usuario
 */
export function resetUserProgress() {
  try {
    const newProgress = { ...initialProgress };
    newProgress.stats.accountCreated = new Date().toISOString();
    newProgress.stats.lastLogin = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    return newProgress;
  } catch (error) {
    console.error('Error resetting user progress:', error);
    return null;
  }
}

/**
 * Actualiza el progreso educativo
 */
export function updateEducationalProgress(updates) {
  const progress = getUserProgress();
  progress.educational = { ...progress.educational, ...updates };
  progress.educational.lastActivity = new Date().toISOString();
  saveUserProgress(progress);
  return progress.educational;
}

/**
 * Registra una lección completada
 */
export function completeLesson(lessonId, score = 100) {
  const progress = getUserProgress();
  
  // Actualizar lecciones completadas
  progress.educational.completedLessons += 1;
  
  // Actualizar precisión
  const totalLessons = progress.educational.completedLessons;
  const currentAccuracy = progress.educational.accuracy || 0;
  const newAccuracy = Math.round(((currentAccuracy * (totalLessons - 1)) + score) / totalLessons);
  progress.educational.accuracy = newAccuracy;
  
  // Verificar logros
  checkAchievements(progress);
  
  saveUserProgress(progress);
  return progress.educational;
}

/**
 * Registra actividad en un juego
 */
export function recordGameActivity(gameId, data) {
  const progress = getUserProgress();
  
  if (!progress.games[gameId]) {
    progress.games[gameId] = {};
  }
  
  // Actualizar estadísticas del juego
  if (gameId === 'memoryGame') {
    progress.games.memoryGame.gamesPlayed += 1;
    
    if (data.time && (!progress.games.memoryGame.bestTime || data.time < progress.games.memoryGame.bestTime)) {
      progress.games.memoryGame.bestTime = data.time;
    }
    
    if (data.moves && (!progress.games.memoryGame.bestMoves || data.moves < progress.games.memoryGame.bestMoves)) {
      progress.games.memoryGame.bestMoves = data.moves;
    }
    
    if (data.matches) {
      progress.games.memoryGame.totalMatches += data.matches;
    }
    
    // Verificar si completó el juego
    if (data.completed) {
      updateAchievementProgress(progress, 'memory_master', 1);
    }
  }
  
  checkAchievements(progress);
  saveUserProgress(progress);
  return progress.games[gameId];
}

/**
 * Registra uso del comunicador
 */
export function recordCommunicationActivity(buttonId, phrase = null) {
  const progress = getUserProgress();
  
  // Contar clics
  progress.communication.totalButtonClicks += 1;
  
  // Contar frases creadas
  if (phrase) {
    progress.communication.totalPhrasesCreated += 1;
  }
  
  // Actualizar botones más usados
  const buttonIndex = progress.communication.mostUsedButtons.findIndex(b => b.id === buttonId);
  if (buttonIndex >= 0) {
    progress.communication.mostUsedButtons[buttonIndex].count += 1;
  } else {
    progress.communication.mostUsedButtons.push({
      id: buttonId,
      count: 1,
      lastUsed: new Date().toISOString()
    });
  }
  
  // Ordenar por uso
  progress.communication.mostUsedButtons.sort((a, b) => b.count - a.count);
  
  // Mantener solo los top 10
  progress.communication.mostUsedButtons = progress.communication.mostUsedButtons.slice(0, 10);
  
  // Actualizar uso diario
  const today = new Date().toISOString().split('T')[0];
  if (!progress.communication.dailyUsage[today]) {
    progress.communication.dailyUsage[today] = 0;
  }
  progress.communication.dailyUsage[today] += 1;
  
  checkAchievements(progress);
  saveUserProgress(progress);
  return progress.communication;
}

/**
 * Verifica y actualiza logros
 */
function checkAchievements(progress) {
  const today = new Date().toISOString().split('T')[0];
  
  // Verificar racha diaria
  const dates = Object.keys(progress.communication.dailyUsage).sort();
  if (dates.length > 0) {
    let streak = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      const currentDate = new Date(dates[i]);
      const prevDate = new Date(dates[i - 1]);
      const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    progress.educational.streakDays = streak;
    
    // Actualizar logro de racha
    updateAchievementProgress(progress, 'communicator_7', Math.min(streak, 7));
  }
  
  // Verificar primera lección
  if (progress.educational.completedLessons >= 1) {
    updateAchievementProgress(progress, 'first_lesson', 1);
  }
}

/**
 * Actualiza el progreso de un logro
 */
function updateAchievementProgress(progress, achievementId, progressValue) {
  const achievement = progress.achievements.inProgress.find(a => a.id === achievementId);
  if (achievement) {
    achievement.progress = Math.max(achievement.progress, progressValue);
    
    // Si se completó, mover a desbloqueados
    if (achievement.progress >= achievement.target) {
      progress.achievements.inProgress = progress.achievements.inProgress.filter(a => a.id !== achievementId);
      progress.achievements.unlocked.push({
        id: achievementId,
        title: achievement.title,
        unlockedAt: new Date().toISOString()
      });
      
      // Agregar insignia si corresponde
      if (!progress.educational.badges.includes(achievementId)) {
        progress.educational.badges.push(achievementId);
      }
    }
  }
}

/**
 * Obtiene estadísticas resumidas para mostrar en dashboards
 */
export function getProgressSummary() {
  const progress = getUserProgress();
  
  return {
    educational: {
      completedLessons: progress.educational.completedLessons,
      totalLessons: progress.educational.totalLessons,
      accuracy: progress.educational.accuracy,
      streakDays: progress.educational.streakDays,
      badges: progress.educational.badges.length
    },
    games: {
      totalPlayed: Object.values(progress.games).reduce((sum, game) => sum + (game.gamesPlayed || 0), 0),
      memoryBestTime: progress.games.memoryGame.bestTime,
      memoryBestMoves: progress.games.memoryGame.bestMoves
    },
    communication: {
      totalButtonClicks: progress.communication.totalButtonClicks,
      totalPhrasesCreated: progress.communication.totalPhrasesCreated,
      dailyUsage: Object.keys(progress.communication.dailyUsage).length
    },
    achievements: {
      unlocked: progress.achievements.unlocked.length,
      inProgress: progress.achievements.inProgress.length
    }
  };
}

/**
 * Exporta el progreso del usuario para backup
 */
export function exportProgress() {
  const progress = getUserProgress();
  return {
    data: progress,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
}

/**
 * Importa progreso desde un backup
 */
export function importProgress(backupData) {
  try {
    if (backupData && backupData.data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backupData.data));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing progress:', error);
    return false;
  }
}