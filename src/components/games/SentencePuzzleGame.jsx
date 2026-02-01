import { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Clock, ArrowLeft, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveGameResult } from '../../services/gameProgressService.js';
import { auth } from '../../config/firebase.js';

// Base de datos de frases con palabras en español
const sentencePuzzles = [
  {
    id: 1,
    sentence: 'Me llamo Juan',
    words: ['llamo', 'Me', 'Juan'],
    difficulty: 'easy',
    hint: 'Para presentarse con su nombre'
  },
  {
    id: 2,
    sentence: 'Quiero agua por favor',
    words: ['agua', 'Quiero', 'por', 'favor'],
    difficulty: 'easy',
    hint: 'Solicitar una bebida'
  },
  {
    id: 3,
    sentence: 'Hoy hace mucho calor',
    words: ['Hoy', 'hace', 'mucho', 'calor'],
    difficulty: 'medium',
    hint: 'Describir el clima'
  },
  {
    id: 4,
    sentence: 'Voy a la escuela todos los días',
    words: ['Voy', 'a', 'la', 'escuela', 'todos', 'los', 'días'],
    difficulty: 'medium',
    hint: 'Hablar sobre ir a la escuela'
  },
  {
    id: 5,
    sentence: 'Me gustaría jugar en el parque con mis amigos',
    words: ['Me', 'gustaría', 'jugar', 'en', 'el', 'parque', 'con', 'mis', 'amigos'],
    difficulty: 'hard',
    hint: 'Expresar deseo de actividad social'
  },
  {
    id: 6,
    sentence: 'Tengo hambre y sed',
    words: ['Tengo', 'hambre', 'y', 'sed'],
    difficulty: 'easy',
    hint: 'Expresar necesidades físicas'
  },
  {
    id: 7,
    sentence: 'El gato come pescado',
    words: ['El', 'gato', 'come', 'pescado'],
    difficulty: 'medium',
    hint: 'Describir acción de animal'
  },
  {
    id: 8,
    sentence: 'Mañana voy de vacaciones a la playa',
    words: ['Mañana', 'voy', 'de', 'vacaciones', 'a', 'la', 'playa'],
    difficulty: 'hard',
    hint: 'Expresar plan futuro'
  }
];

export default function SentencePuzzleGame() {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  // Inicializar juego
  useEffect(() => {
    setLoading(false);
    initializeNewPuzzle();
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
    if (currentPuzzle >= sentencePuzzles.length && gameStarted) {
      setGameOver(true);
      saveGameResultToFirestore();
    }
  }, [currentPuzzle, gameStarted]);

  const initializeNewPuzzle = () => {
    if (currentPuzzle >= sentencePuzzles.length) return;
    
    const puzzle = sentencePuzzles[currentPuzzle];
    const shuffled = [...puzzle.words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setSelectedWords([]);
    setFeedback(null);
  };

  const selectWord = (word, index) => {
    setSelectedWords([...selectedWords, { word, originalIndex: index }]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
    setMoves(moves + 1);
    setGameStarted(true);
  };

  const removeWord = (index) => {
    const word = selectedWords[index];
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
    setAvailableWords([...availableWords, word.word]);
  };

  const resetPuzzle = () => {
    initializeNewPuzzle();
    setMoves(0);
    setFeedback(null);
  };

  const checkAnswer = () => {
    const userSentence = selectedWords.map(w => w.word).join(' ');
    const correctSentence = sentencePuzzles[currentPuzzle].sentence;
    
    if (userSentence === correctSentence) {
      setCorrect(correct + 1);
      setFeedback({
        type: 'success',
        message: '¡Correcto! Excelente trabajo.'
      });
      
      // Avanzar a siguiente puzzle después de 1.5 segundos
      setTimeout(() => {
        setCurrentPuzzle(currentPuzzle + 1);
        initializeNewPuzzle();
      }, 1500);
    } else {
      setIncorrect(incorrect + 1);
      setFeedback({
        type: 'error',
        message: 'Intenta nuevamente. La oración no es correcta.'
      });
    }
  };

  const skipPuzzle = () => {
    setCurrentPuzzle(currentPuzzle + 1);
    initializeNewPuzzle();
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
      const accuracy = correct > 0 ? ((correct / sentencePuzzles.length) * 100).toFixed(2) : 0;
      const points = Math.max(100, (correct * 200) - (time * 5) - (incorrect * 50));
      
      await saveGameResult('sentence-puzzle', 'Rompecabezas de Frases', {
        score: correct,
        points: Math.max(100, points),
        moves: moves,
        time: time,
        difficulty: 'medium',
        completed: correct === sentencePuzzles.length,
        stats: {
          totalPuzzles: sentencePuzzles.length,
          correctAnswers: correct,
          incorrectAnswers: incorrect,
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
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver a Juegos</span>
            </Link>
            <div className="hidden md:block w-px h-6 bg-neutral-300"></div>
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">Rompecabezas de Frases</h2>
              <p className="text-neutral-600">Ordena las palabras para formar frases correctas</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-5 rounded-2xl text-center shadow-lg border-2 border-purple-300">
            <div className="text-3xl font-bold text-white">{currentPuzzle + 1}/{sentencePuzzles.length}</div>
            <div className="text-sm text-purple-100 font-medium mt-1">Progreso</div>
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
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-700"
            style={{ width: `${(currentPuzzle / sentencePuzzles.length) * 100}%` }}
          />
        </div>

        {/* Mensaje de victoria */}
        {gameOver ? (
          <div className="mb-8 p-8 bg-gradient-to-r from-success-500 via-success-600 to-success-700 text-white rounded-3xl text-center animate-pulse shadow-2xl border-4 border-success-300">
            <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-300" />
            <h3 className="text-3xl font-bold mb-3">¡Juego Completado!</h3>
            <p className="text-xl mb-3">Respondiste correctamente <span className="font-bold text-yellow-300">{correct}/{sentencePuzzles.length}</span> frases</p>
            <p className="text-lg mb-2">Precisión: <span className="font-bold text-yellow-300">{((correct / sentencePuzzles.length) * 100).toFixed(1)}%</span></p>
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
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
              <p className="text-blue-900 font-medium">
                💡 Pista: {sentencePuzzles[currentPuzzle]?.hint}
              </p>
            </div>

            {/* Palabras disponibles */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Selecciona las palabras en orden:</h3>
              <div className="flex flex-wrap gap-2">
                {availableWords.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => selectWord(word, index)}
                    className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Frase construida */}
            <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-300 min-h-16">
              {selectedWords.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedWords.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => removeWord(index)}
                        className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-3 py-1 rounded-lg font-semibold transition-all transform hover:scale-110 shadow-md text-sm"
                      >
                        {item.word} ✕
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-700 font-medium text-lg">
                    {selectedWords.map(w => w.word).join(' ')}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Haz clic en las palabras para formar la oración...</p>
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
              {selectedWords.length === sentencePuzzles[currentPuzzle]?.words.length && !feedback && (
                <button
                  onClick={checkAnswer}
                  className="flex-1 bg-gradient-to-r from-success-500 to-success-700 hover:from-success-600 hover:to-success-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Verificar Respuesta</span>
                </button>
              )}
              <button
                onClick={resetPuzzle}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Shuffle size={20} />
                <span>Reintentar</span>
              </button>
              <button
                onClick={skipPuzzle}
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
