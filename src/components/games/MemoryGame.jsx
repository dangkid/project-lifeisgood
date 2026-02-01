import { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Clock, Home, Apple, Droplets, Users, Circle, Moon, School, Heart, ArrowLeft } from 'lucide-react';
import { getPictogramUrl } from '../../services/arasaacService.js';
import { Link } from 'react-router-dom';
import { saveGameResult, getGameProgress } from '../../services/gameProgressService.js';
import { auth } from '../../config/firebase.js';

// Pictogramas con IDs reales de ARASAAC y nombres en español
const pictograms = [
  { id: 1747, name: 'Casa', icon: Home, color: 'from-primary-500 to-primary-700' },
  { id: 372, name: 'Manzana', icon: Apple, color: 'from-secondary-500 to-secondary-700' },
  { id: 1530, name: 'Agua', icon: Droplets, color: 'from-info-500 to-info-700' },
  { id: 3725, name: 'Familia', icon: Users, color: 'from-accent-500 to-accent-700' },
  { id: 3726, name: 'Pelota', icon: Circle, color: 'from-warning-500 to-warning-700' },
  { id: 3727, name: 'Dormir', icon: Moon, color: 'from-neutral-500 to-neutral-700' },
  { id: 3728, name: 'Escuela', icon: School, color: 'from-primary-500 to-accent-500' },
  { id: 3729, name: 'Amigos', icon: Heart, color: 'from-secondary-500 to-accent-500' },
];

export default function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [bestScore, setBestScore] = useState(null);
  const [saving, setSaving] = useState(false);

  // Inicializar juego
  const initializeGame = () => {
    const gameCards = [...pictograms, ...pictograms]
      .map((card, index) => ({
        ...card,
        uniqueId: index,
        imageUrl: getPictogramUrl(card.id, 300)
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(gameCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameOver(false);
    setTime(0);
    setGameStarted(true);
    setLoading(false);
    setImageErrors({});
    setImagesLoaded({});
    
    // Pre-cargar imágenes para verificar que funcionan
    gameCards.forEach(card => {
      const img = new Image();
      img.src = card.imageUrl;
      img.onload = () => {
        setImagesLoaded(prev => ({ ...prev, [card.id]: true }));
      };
      img.onerror = () => {
        setImageErrors(prev => ({ ...prev, [card.id]: true }));
        console.warn(`No se pudo cargar la imagen para ${card.name}: ${card.imageUrl}`);
      };
    });
  };

  // Efecto para temporizador
  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  // Efecto para verificar si el juego terminó
  useEffect(() => {
    if (matched.length === pictograms.length && pictograms.length > 0) {
      setGameOver(true);
      // Guardar resultado en Firestore
      saveGameResultToFirestore();
    }
  }, [matched]);

  // Guardar resultado del juego en Firestore
  const saveGameResultToFirestore = async () => {
    if (!auth.currentUser) return;
    
    setSaving(true);
    try {
      const score = moves; // Puntuación basada en movimientos (menor es mejor)
      const points = Math.max(0, 1000 - (moves * 10) - time); // Puntos basados en eficiencia
      
      await saveGameResult('memory-pictograms', 'Memoria de Pictogramas', {
        score: score,
        points: Math.max(100, points),
        moves: moves,
        time: time,
        difficulty: 'medium',
        completed: true,
        stats: {
          pictogramsCount: pictograms.length,
          averageMovesPerPair: (moves / pictograms.length).toFixed(2)
        },
        accuracy: 100
      });
      
      // Actualizar mejor puntuación local si es mejor
      if (!bestScore || score < bestScore) {
        setBestScore(score);
      }
    } catch (error) {
      console.error('Error guardando resultado:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCardClick = (cardId) => {
    if (!gameStarted) setGameStarted(true);
    
    // No hacer nada si la carta ya está volteada o emparejada
    if (flipped.includes(cardId) || matched.includes(cardId) || flipped.length === 2) {
      return;
    }

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.uniqueId === firstId);
      const secondCard = cards.find(c => c.uniqueId === secondId);

      if (firstCard.id === secondCard.id) {
        // Emparejadas
        setMatched([...matched, firstCard.id]);
        setFlipped([]);
      } else {
        // No emparejadas, voltear de nuevo después de un delay
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cargar mejor puntuación del usuario al montar
  useEffect(() => {
    const loadBestScore = async () => {
      if (auth.currentUser) {
        try {
          const progress = await getGameProgress('memory-pictograms');
          if (progress) {
            setBestScore(progress.bestScore);
          }
        } catch (error) {
          console.error('Error cargando mejor puntuación:', error);
        }
      }
      setLoading(false);
    };

    loadBestScore();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando juego de memoria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Header del juego con botón de regresar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Link
              to="/juegos"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver a Juegos</span>
            </Link>
            <div className="hidden md:block w-px h-6 bg-neutral-300"></div>
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">Memoria de Pictogramas</h2>
              <p className="text-neutral-600">Encuentra las parejas de imágenes iguales para mejorar la memoria visual</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={initializeGame}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-900 text-white px-5 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <RefreshCw size={20} />
              Reiniciar Juego
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-5 rounded-2xl text-center shadow-lg border-2 border-primary-300">
            <div className="text-3xl font-bold text-white">{moves}</div>
            <div className="text-sm text-primary-100 font-medium mt-1">Movimientos</div>
            <div className="w-10 h-1 bg-primary-200 rounded-full mx-auto mt-2"></div>
          </div>
          <div className="bg-gradient-to-br from-secondary-500 to-secondary-700 p-5 rounded-2xl text-center shadow-lg border-2 border-secondary-300">
            <div className="text-3xl font-bold text-white">{formatTime(time)}</div>
            <div className="text-sm text-secondary-100 font-medium mt-1">Tiempo</div>
            <Clock className="w-6 h-6 mx-auto mt-2 text-white" />
          </div>
          <div className="bg-gradient-to-br from-accent-500 to-accent-700 p-5 rounded-2xl text-center shadow-lg border-2 border-accent-300">
            <div className="text-3xl font-bold text-white">{matched.length}/{pictograms.length}</div>
            <div className="text-sm text-accent-100 font-medium mt-1">Parejas Encontradas</div>
            <div className="w-10 h-1 bg-accent-200 rounded-full mx-auto mt-2"></div>
          </div>
        </div>

        {/* Mensaje de victoria */}
        {gameOver && (
          <div className="mb-8 p-8 bg-gradient-to-r from-success-500 via-success-600 to-success-700 text-white rounded-3xl text-center animate-pulse shadow-2xl border-4 border-success-300">
            <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-300" />
            <h3 className="text-3xl font-bold mb-3">¡Felicidades!</h3>
            <p className="text-xl mb-3">Completaste el juego en <span className="font-bold text-yellow-300">{moves}</span> movimientos y <span className="font-bold text-yellow-300">{formatTime(time)}</span></p>
            <p className="text-2xl font-bold text-yellow-200">¡Excelente memoria visual!</p>
            {bestScore && bestScore < moves && (
              <p className="text-lg mt-3 text-yellow-100">Tu mejor puntuación anterior: {bestScore} movimientos</p>
            )}
            {bestScore === moves && (
              <p className="text-lg mt-3 text-yellow-100 font-bold">🎯 ¡Igualaste tu mejor puntuación!</p>
            )}
            {(!bestScore || moves < bestScore) && (
              <p className="text-lg mt-3 text-yellow-100 font-bold">🌟 ¡Nuevo récord personal!</p>
            )}
            {saving && (
              <p className="text-sm mt-4 text-yellow-50">Guardando tu progreso...</p>
            )}
            <div className="mt-6">
              <button
                onClick={initializeGame}
                className="bg-white text-success-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Jugar de nuevo
              </button>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="mb-8 p-5 bg-gradient-to-r from-warning-400 to-warning-600 text-white rounded-2xl shadow-lg border-2 border-warning-300">
          <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Instrucciones:
          </h4>
          <p className="text-warning-100 text-lg">Haz clic en dos cartas para voltearlas. Encuentra todas las parejas de pictogramas iguales.</p>
        </div>

        {/* Tablero de juego */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cards.map(card => {
            const isFlipped = flipped.includes(card.uniqueId) || matched.includes(card.id);
            const isMatched = matched.includes(card.id);
            const Icon = card.icon;
            
            return (
              <button
                key={card.uniqueId}
                onClick={() => handleCardClick(card.uniqueId)}
                disabled={isMatched || gameOver}
                className={`
                  h-36 rounded-2xl flex flex-col items-center justify-center
                  transition-all duration-300 transform
                  ${isFlipped ? 'bg-gradient-to-br from-white to-gray-50 shadow-xl scale-105 border-4 border-primary-400' : 'bg-gradient-to-br from-neutral-200 to-neutral-300 hover:from-neutral-300 hover:to-neutral-400'}
                  ${isMatched ? 'bg-gradient-to-br from-success-100 to-success-300 border-4 border-success-500 shadow-success-lg' : ''}
                  ${gameOver ? 'cursor-default' : 'cursor-pointer hover:shadow-2xl hover:scale-102'}
                  relative overflow-hidden
                `}
              >
                {isFlipped ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 mb-3 flex items-center justify-center relative">
                      <div className="relative w-full h-full">
                        {imageErrors[card.id] ? (
                          // Fallback cuando la imagen no carga
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                            <div className="text-white">
                              <Icon className="w-12 h-12" />
                            </div>
                          </div>
                        ) : (
                          // Imagen real de ARASAAC
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="w-full h-full object-contain transition-opacity duration-500"
                            onError={(e) => {
                              // Marcar error en el estado
                              setImageErrors(prev => ({ ...prev, [card.id]: true }));
                              e.target.style.display = 'none';
                            }}
                            onLoad={(e) => {
                              e.target.style.opacity = '1';
                            }}
                            style={{ opacity: imagesLoaded[card.id] ? 1 : 0 }}
                          />
                        )}
                        {/* Indicador de carga */}
                        {!imageErrors[card.id] && !imagesLoaded[card.id] && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-base font-semibold text-neutral-800">{card.name}</div>
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-neutral-500">?</div>
                )}
                
                {/* Indicador de emparejada */}
                {isMatched && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Puntuación y feedback */}
        <div className="mt-10 p-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl shadow-xl border-2 border-gray-700">
          <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            Tu progreso:
          </h4>
          <div className="w-full bg-gray-700 rounded-full h-6 mb-4">
            <div
              className="bg-gradient-to-r from-success-500 to-success-700 h-6 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
              style={{ width: `${(matched.length / pictograms.length) * 100}%` }}
            >
              <span className="text-xs font-bold text-white">{Math.round((matched.length / pictograms.length) * 100)}%</span>
            </div>
          </div>
          <p className="text-lg font-medium text-gray-200 mt-2">
            {matched.length === 0 && '¡Comienza a jugar! Encuentra tu primera pareja.'}
            {matched.length > 0 && matched.length < pictograms.length && `¡Vas bien! Has encontrado ${matched.length} de ${pictograms.length} parejas.`}
            {gameOver && '¡Juego completado! ¿Quieres intentarlo de nuevo más rápido?'}
          </p>
        </div>

        {/* Consejos */}
        <div className="mt-8 p-6 bg-gradient-to-r from-info-500 to-info-700 text-white rounded-2xl shadow-lg border-2 border-info-300">
          <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Consejos para mejorar:
          </h4>
          <ul className="text-lg text-info-100 list-disc pl-6 space-y-3">
            <li className="flex items-start gap-2">
              <span className="font-bold text-info-200">•</span>
              <span>Intenta recordar la posición de los pictogramas que ya has visto</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-info-200">•</span>
              <span>Comienza por las esquinas y bordes para establecer puntos de referencia</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-info-200">•</span>
              <span>Practica regularmente para mejorar tu memoria visual</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}