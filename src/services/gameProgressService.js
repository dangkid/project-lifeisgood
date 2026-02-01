import { db, auth } from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  increment,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

/**
 * Servicio para gestionar el progreso y puntuación de juegos por usuario
 */

// Obtener o crear documento de progreso del usuario
export const getUserGameProgress = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');

  const progressRef = doc(db, 'userGameProgress', user.uid);
  const snapshot = await getDoc(progressRef);
  
  if (!snapshot.exists()) {
    // Crear documento inicial
    const initialData = {
      userId: user.uid,
      totalPoints: 0,
      gamesCompleted: 0,
      totalGamesPlayed: 0,
      achievements: [],
      games: {},
      lastUpdated: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    await setDoc(progressRef, initialData);
    return initialData;
  }
  
  return snapshot.data();
};

// Obtener progreso de un juego específico
export const getGameProgress = async (gameId) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');

  const progressRef = doc(db, 'userGameProgress', user.uid);
  const snapshot = await getDoc(progressRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.data().games?.[gameId] || null;
};

// Guardar resultado de juego
export const saveGameResult = async (gameId, gameTitle, result) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');

  const progressRef = doc(db, 'userGameProgress', user.uid);
  const snapshot = await getDoc(progressRef);
  
  if (!snapshot.exists()) {
    await getUserGameProgress();
  }

  const gameResultData = {
    gameId,
    gameTitle,
    score: result.score || 0,
    points: result.points || 0,
    moves: result.moves || 0,
    time: result.time || 0,
    difficulty: result.difficulty || 'medium',
    completed: result.completed || false,
    completedAt: serverTimestamp(),
    stats: result.stats || {},
    accuracy: result.accuracy || 0
  };

  // Obtener datos actuales
  const currentData = snapshot.data();
  const currentGameStats = currentData.games?.[gameId] || {
    attempts: 0,
    bestScore: 0,
    totalPoints: 0,
    completed: false,
    totalTime: 0,
    bestTime: 0,
    history: []
  };

  // Actualizar estadísticas
  const updatedStats = {
    ...currentGameStats,
    attempts: (currentGameStats.attempts || 0) + 1,
    bestScore: Math.max(currentGameStats.bestScore || 0, gameResultData.score),
    totalPoints: (currentGameStats.totalPoints || 0) + gameResultData.points,
    totalTime: (currentGameStats.totalTime || 0) + gameResultData.time,
    completed: gameResultData.completed || currentGameStats.completed,
    bestTime: gameResultData.completed && (!currentGameStats.bestTime || gameResultData.time < currentGameStats.bestTime) 
      ? gameResultData.time 
      : currentGameStats.bestTime,
    lastPlayed: serverTimestamp(),
    history: [...(currentGameStats.history || []), gameResultData].slice(-10) // Últimas 10 partidas
  };

  // Calcular puntos totales
  const pointsEarned = gameResultData.points;
  
  // Actualizar documento
  await updateDoc(progressRef, {
    [`games.${gameId}`]: updatedStats,
    totalPoints: increment(pointsEarned),
    gamesCompleted: gameResultData.completed ? increment(1) : increment(0),
    totalGamesPlayed: increment(1),
    lastUpdated: serverTimestamp()
  });

  // Verificar y otorgar logros
  await checkAndAwardAchievements(user.uid, currentData.totalPoints + pointsEarned);

  return updatedStats;
};

// Obtener estadísticas generales del usuario
export const getUserGameStats = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');

  const progressRef = doc(db, 'userGameProgress', user.uid);
  const snapshot = await getDoc(progressRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const data = snapshot.data();
  const games = data.games || {};
  
  // Calcular estadísticas derivadas
  const stats = {
    totalPoints: data.totalPoints || 0,
    gamesCompleted: data.gamesCompleted || 0,
    totalGamesPlayed: data.totalGamesPlayed || 0,
    gameDetails: {},
    achievements: data.achievements || [],
    averageScore: 0,
    totalPlayTime: 0
  };

  let totalScore = 0;
  let gamesWithScores = 0;
  
  Object.entries(games).forEach(([gameId, gameData]) => {
    stats.gameDetails[gameId] = {
      ...gameData,
      averageScore: gameData.attempts > 0 ? (gameData.totalPoints / gameData.attempts).toFixed(2) : 0
    };
    
    if (gameData.bestScore) {
      totalScore += gameData.bestScore;
      gamesWithScores++;
    }
    stats.totalPlayTime += gameData.totalTime || 0;
  });

  stats.averageScore = gamesWithScores > 0 ? (totalScore / gamesWithScores).toFixed(2) : 0;
  
  return stats;
};

// Otorgar logros (achievements)
const checkAndAwardAchievements = async (userId, totalPoints) => {
  const progressRef = doc(db, 'userGameProgress', userId);
  const snapshot = await getDoc(progressRef);
  
  if (!snapshot.exists()) return;
  
  const data = snapshot.data();
  const currentAchievements = data.achievements || [];
  const newAchievements = [];

  const achievementsList = [
    { id: 'first_game', name: 'Primeros Pasos', points: 50, condition: () => data.totalGamesPlayed >= 1 },
    { id: 'ten_games', name: 'Principiante', points: 100, condition: () => data.totalGamesPlayed >= 10 },
    { id: 'fifty_games', name: 'Experimentado', points: 500, condition: () => data.totalGamesPlayed >= 50 },
    { id: 'hundred_games', name: 'Experto', points: 1000, condition: () => data.totalGamesPlayed >= 100 },
    { id: 'thousand_points', name: 'Puntuación Magistral', points: 250, condition: () => totalPoints >= 1000 },
    { id: 'five_thousand_points', name: 'Campeón', points: 1000, condition: () => totalPoints >= 5000 },
  ];

  achievementsList.forEach(achievement => {
    if (!currentAchievements.find(a => a.id === achievement.id) && achievement.condition()) {
      newAchievements.push({
        ...achievement,
        unlockedAt: serverTimestamp()
      });
    }
  });

  if (newAchievements.length > 0) {
    await updateDoc(progressRef, {
      achievements: [...currentAchievements, ...newAchievements]
    });
  }
};

// Obtener historial de partidas
export const getGameHistory = async (gameId, limit = 10) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');

  const progressRef = doc(db, 'userGameProgress', user.uid);
  const snapshot = await getDoc(progressRef);
  
  if (!snapshot.exists()) {
    return [];
  }
  
  const gameData = snapshot.data().games?.[gameId];
  return gameData?.history?.slice(-limit) || [];
};

// Resetear progreso de un juego (opcional)
export const resetGameProgress = async (gameId) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');

  const progressRef = doc(db, 'userGameProgress', user.uid);
  
  await updateDoc(progressRef, {
    [`games.${gameId}`]: {
      attempts: 0,
      bestScore: 0,
      totalPoints: 0,
      completed: false,
      totalTime: 0,
      bestTime: 0,
      history: []
    }
  });
};
