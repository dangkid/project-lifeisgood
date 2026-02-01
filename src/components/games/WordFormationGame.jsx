import { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Clock, ArrowLeft, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveGameResult } from '../../services/gameProgressService.js';
import { auth } from '../../config/firebase.js';

// Base de datos de palabras con sílabas
const wordPuzzles = [
  {
    id: 1,
    word: 'Gato',
    syllables: ['Ga', 'to'],
    hint: 'Animal doméstico que maúlla',
    difficulty: 'easy'
  },
  {
    id: 2,
    word: 'Escuela',
    syllables: ['Es', 'cue', 'la'],
    hint: 'Lugar donde aprendemos',
    difficulty: 'easy'
  },
  {
    id: 3,
    word: 'Computadora',
    syllables: ['Com', 'pu', 'ta', 'do', 'ra'],
    hint: 'Máquina para trabajar y jugar',
    difficulty: 'medium'
  },
  {
    id: 4,
    word: 'Libélula',
    syllables: ['Li', 'bé', 'lu', 'la'],
    hint: 'Insecto volador junto al agua',
    difficulty: 'medium'
  },
  {
    id: 5,
    word: 'Mariposa',
    syllables: ['Ma', 'ri', 'po', 'sa'],
    hint: 'Insecto de colores hermosos con alas',
    difficulty: 'easy'
  },
  {
    id: 6,
    word: 'Refrigerador',
    syllables: ['Re', 'fri', 'ge', 'ra', 'dor'],
    hint: 'Aparato para mantener comida fría',
    difficulty: 'hard'
  },
  {
    id: 7,
    word: 'Televisión',
    syllables: ['Te', 'le', 'vi', 'sión'],
    hint: 'Aparato para ver programas',
    difficulty: 'medium'
  },
  {
    id: 8,
    word: 'Bicicleta',
    syllables: ['Bi', 'ci', 'cle', 'ta'],
    hint: 'Vehículo de dos ruedas',
    difficulty: 'medium'
  },
  {
    id: 9,
    word: 'Elefante',
    syllables: ['E', 'le', 'fan', 'te'],
    hint: 'Animal grande con trompa',
    difficulty: 'medium'
  },
  {
    id: 10,
    word: 'Sandía',
    syllables: ['San', 'día'],
    hint: 'Fruta grande y verde por fuera',
    difficulty: 'easy'
  }
];

export default function WordFormationGame() {
  const [currentWord, setCurrentWord] = useState(0);
  const [selectedSyllables, setSelectedSyllables] = useState([]);
  const [availableSyllables, setAvailableSyllables] = useState([]);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  // Inicializar
  useEffect(() => {
    setLoading(false);
    initializeNewWord();
  }, []);

  // Temporizador
  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  // Verificar si juego terminó
  useEffect(() => {
    if (currentWord >= wordPuzzles.length && gameStarted) {
      setGameOver(true);
      saveGameResultToFirestore();
    }
  }, [currentWord, gameStarted]);

  const initializeNewWord = () => {
    if (currentWord >= wordPuzzles.length) return;
    
    const puzzle = wordPuzzles[currentWord];
    const shuffled = [...puzzle.syllables].sort(() => Math.random() - 0.5);
    setAvailableSyllables(shuffled);
    setSelectedSyllables([]);
    setFeedback(null);
  };

  const selectSyllable = (syllable, index) => {
    setSelectedSyllables([...selectedSyllables, { syllable, originalIndex: index }]);
    setAvailableSyllables(availableSyllables.filter((_, i) => i !== index));
    setMoves(moves + 1);
    setGameStarted(true);
  };

  const removeSyllable = (index) => {
    const syllable = selectedSyllables[index];
    setSelectedSyllables(selectedSyllables.filter((_, i) => i !== index));
    setAvailableSyllables([...availableSyllables, syllable.syllable]);
  };

  const resetWord = () => {
    initializeNewWord();
    setMoves(0);
    setFeedback(null);
  };

  const checkAnswer = () => {
    const userWord = selectedSyllables.map(s => s.syllable).join('');
    const correctWord = wordPuzzles[currentWord].word;
    
    if (userWord.toLowerCase() === correctWord.toLowerCase()) {
      setCorrect(correct + 1);
      setFeedback({
        type: 'success',
        message: `¡Correcto! "${correctWord}" es la palabra correcta.`
      });
      
      // Avanzar a siguiente palabra después de 1.5 segundos
      setTimeout(() => {
        setCurrentWord(currentWord + 1);
        initializeNewWord();
      }, 1500);
    } else {
      setIncorrect(incorrect + 1);
      setFeedback({
        type: 'error',
        message: `Intenta nuevamente. Formaste "${userWord}" pero la palabra correcta es "${correctWord}".`
      });
    }
  };

  const skipWord = () => {
    setCurrentWord(currentWord + 1);
    initializeNewWord();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveGameResultToFirestore = async () => {
    if (!auth.currentUser) return;
    
    setSaving(true);
    try {
      const accuracy = correct > 0 ? ((correct / wordPuzzles.length) * 100).toFixed(2) : 0;
      const points = Math.max(100, (correct * 180) - (time * 5) - (incorrect * 40));
      
      await saveGameResult('word-formation', 'Formación de Palabras', {
        score: correct,
        points: Math.max(100, points),
        moves: moves,
        time: time,
        difficulty: 'medium',
        completed: correct === wordPuzzles.length,
        stats: {
          totalWords: wordPuzzles.length,
          correctWords: correct,
          incorrectWords: incorrect,
          accuracy: accuracy
        },
        accuracy: accuracy
      });
    } catch (error) {
      console.error('Error guardando resultado:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando juego...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Link
              to="/juegos"
              className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver a Juegos</span>
            </Link>
            <div className="hidden md:block w-px h-6 bg-neutral-300"></div>
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">Formación de Palabras</h2>
              <p className="text-neutral-600">Combina sílabas para formar palabras</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-5 rounded-2xl text-center shadow-lg border-2 border-orange-300">
            <div className="text-3xl font-bold text-white">{currentWord + 1}/{wordPuzzles.length}</div>
            <div className="text-sm text-orange-100 font-medium mt-1">Progreso</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-5 rounded-2xl text-center shadow-lg border-2 border-green-300">
            <div className="text-3xl font-bold text-white">{correct}</div>
            <div className="text-sm text-green-100 font-medium mt-1">Correctas</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-5 rounded-2xl text-center shadow-lg border-2 border-red-300">
            <div className="text-3xl font-bold text-white">{incorrect}</div>
            <div className="text-sm text-red-100 font-medium mt-1">Incorrectas</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-5 rounded-2xl text-center shadow-lg border-2 border-blue-300">
            <div className="text-3xl font-bold text-white">{formatTime(time)}</div>
            <div className="text-sm text-blue-100 font-medium mt-1">Tiempo</div>
            <Clock className="w-5 h-5 mx-auto mt-2 text-white" />
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-8 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-600 to-red-600 h-full transition-all duration-700"
            style={{ width: `${(currentWord / wordPuzzles.length) * 100}%` }}
          />
        </div>

        {/* Mensaje de fin de juego */}
        {gameOver ? (
          <div className="mb-8 p-8 bg-gradient-to-r from-success-500 via-success-600 to-success-700 text-white rounded-3xl text-center animate-pulse shadow-2xl border-4 border-success-300">
            <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-300" />
            <h3 className="text-3xl font-bold mb-3">¡Juego Completado!</h3>
            <p className="text-xl mb-3">Formaste correctamente <span className="font-bold text-yellow-300">{correct}/{wordPuzzles.length}</span> palabras</p>
            <p className="text-lg mb-2">Precisión: <span className="font-bold text-yellow-300">{((correct / wordPuzzles.length) * 100).toFixed(1)}%</span></p>
            <p className="text-lg mb-2">Tiempo total: <span className="font-bold text-yellow-300">{formatTime(time)}</span></p>
            {saving && (
              <p className="text-sm mt-4 text-yellow-50">Guardando tu progreso...</p>
            )}
            <div className="mt-6">
              <Link
                to="/juegos"
                className="inline-block bg-white text-success-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Volver a Juegos
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Pista */}
            <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
              <p className="text-yellow-900 font-medium">
                💡 Pista: {wordPuzzles[currentWord]?.hint}
              </p>
            </div>

            {/* Sílabas disponibles */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Selecciona las sílabas en orden:</h3>
              <div className="flex flex-wrap gap-2">
                {availableSyllables.map((syllable, index) => (
                  <button
                    key={index}
                    onClick={() => selectSyllable(syllable, index)}
                    className="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md text-lg"
                  >
                    {syllable}
                  </button>
                ))}
              </div>
            </div>

            {/* Palabra construida */}
            <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-300 min-h-20">
              {selectedSyllables.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedSyllables.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => removeSyllable(index)}
                        className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-3 py-1 rounded-lg font-semibold transition-all transform hover:scale-110 shadow-md text-sm"
                      >
                        {item.syllable} ✕
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-900 font-bold text-2xl">
                    {selectedSyllables.map(s => s.syllable).join('')}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic text-lg">Haz clic en las sílabas para formar la palabra...</p>
              )}
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`mb-6 p-4 rounded-xl font-semibold text-center ${
                feedback.type === 'success' 
                  ? 'bg-green-100 border-2 border-green-500 text-green-700' 
                  : 'bg-red-100 border-2 border-red-500 text-red-700'
              }`}>
                {feedback.message}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-4 flex-wrap">
              {selectedSyllables.length === wordPuzzles[currentWord]?.syllables.length && !feedback && (
                <button
                  onClick={checkAnswer}
                  className="flex-1 bg-gradient-to-r from-success-500 to-success-700 hover:from-success-600 hover:to-success-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Verificar Palabra</span>
                </button>
              )}
              <button
                onClick={resetWord}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Shuffle size={20} />
                <span>Reintentar</span>
              </button>
              <button
                onClick={skipWord}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
              >
                Saltar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
