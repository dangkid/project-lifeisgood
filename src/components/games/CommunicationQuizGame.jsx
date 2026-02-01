import { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Clock, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveGameResult } from '../../services/gameProgressService.js';
import { auth } from '../../config/firebase.js';

// Base de datos de preguntas de comunicación
const communicationQuestions = [
  {
    id: 1,
    question: '¿Cuál es la mejor manera de pedir ayuda?',
    options: [
      'Gritar y llamar la atención',
      'Levantar la mano y decir "Necesito ayuda"',
      'Esperar a que alguien te pregunte',
      'No pedir ayuda nunca'
    ],
    correct: 1,
    explanation: 'Levantar la mano y expresar tu necesidad de manera clara es la forma más efectiva y respetuosa de comunicación.',
    difficulty: 'easy'
  },
  {
    id: 2,
    question: '¿Qué debes hacer cuando alguien te habla?',
    options: [
      'Ignorar lo que dicen',
      'Mirar hacia otro lado',
      'Hacer contacto visual y escuchar atentamente',
      'Interrumpir constantemente'
    ],
    correct: 2,
    explanation: 'El contacto visual y escuchar atentamente son señales de respeto y comprensión en la comunicación.',
    difficulty: 'easy'
  },
  {
    id: 3,
    question: '¿Cómo expresas tus emociones de manera apropiada?',
    options: [
      'Gritando o llorando sin explicación',
      'Hablando sobre cómo te sientes y por qué',
      'Nunca expresar emociones',
      'Golpeando cosas'
    ],
    correct: 1,
    explanation: 'Hablar sobre tus emociones ayuda a otros a entender y apoyarte mejor.',
    difficulty: 'easy'
  },
  {
    id: 4,
    question: '¿Qué significa el término CAA?',
    options: [
      'Comunicación Aumentativa y Alternativa',
      'Clase de Actividades Académicas',
      'Centro de Atención al Adulto',
      'Cuaderno de Actividades Adicionales'
    ],
    correct: 0,
    explanation: 'CAA es un conjunto de herramientas y estrategias para facilitar la comunicación en personas con dificultades de habla.',
    difficulty: 'medium'
  },
  {
    id: 5,
    question: '¿Cuál es un ejemplo de comunicación no verbal?',
    options: [
      'Hablar por teléfono',
      'Escribir un mensaje',
      'Los gestos y expresiones faciales',
      'Leer un libro'
    ],
    correct: 2,
    explanation: 'Los gestos, expresiones faciales y lenguaje corporal son formas importantes de comunicación no verbal.',
    difficulty: 'medium'
  },
  {
    id: 6,
    question: '¿Qué debes hacer si no entiendes algo que te dicen?',
    options: [
      'Pretender que entiendes',
      'Pedir que repitan o expliquen de otra manera',
      'Ignorar la pregunta',
      'Responder cualquier cosa'
    ],
    correct: 1,
    explanation: 'Pedir clarificación es parte importante de una comunicación efectiva.',
    difficulty: 'medium'
  },
  {
    id: 7,
    question: '¿Cuál es el rol de los pictogramas en la CAA?',
    options: [
      'Solo para decoración',
      'Facilitar la comunicación visual y expresión de ideas',
      'Enseñar matemáticas',
      'Reemplazar completamente la comunicación verbal'
    ],
    correct: 1,
    explanation: 'Los pictogramas son herramientas visuales que ayudan a las personas a comunicarse e expresar sus necesidades.',
    difficulty: 'hard'
  },
  {
    id: 8,
    question: '¿Cómo muestras que estás escuchando activamente?',
    options: [
      'Mirando tu teléfono',
      'Asintiendo, haciendo contacto visual y respondiendo',
      'Interrumpiendo frecuentemente',
      'Pensando en otras cosas'
    ],
    correct: 1,
    explanation: 'La escucha activa incluye señales verbales y no verbales que muestran tu atención y comprensión.',
    difficulty: 'medium'
  }
];

export default function CommunicationQuizGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Inicializar
  useEffect(() => {
    setLoading(false);
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
    if (currentQuestion >= communicationQuestions.length && gameStarted) {
      setGameOver(true);
      saveGameResultToFirestore();
    }
  }, [currentQuestion, gameStarted]);

  const selectAnswer = (index) => {
    setGameStarted(true);
    setSelectedAnswer(index);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const question = communicationQuestions[currentQuestion];
    if (selectedAnswer === question.correct) {
      setCorrect(correct + 1);
    } else {
      setIncorrect(incorrect + 1);
    }
    
    setAnswered(true);
  };

  const nextQuestion = () => {
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer(null);
    setAnswered(false);
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
      const accuracy = correct > 0 ? ((correct / communicationQuestions.length) * 100).toFixed(2) : 0;
      const points = Math.max(100, (correct * 150) - (time * 3) - (incorrect * 30));
      
      await saveGameResult('communication-quiz', 'Quiz de Comunicación', {
        score: correct,
        points: Math.max(100, points),
        moves: communicationQuestions.length,
        time: time,
        difficulty: 'medium',
        completed: correct > communicationQuestions.length * 0.6, // 60% para pasar
        stats: {
          totalQuestions: communicationQuestions.length,
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
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando quiz...</p>
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
              className="flex items-center gap-2 text-green-600 hover:text-green-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver a Juegos</span>
            </Link>
            <div className="hidden md:block w-px h-6 bg-neutral-300"></div>
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">Quiz de Comunicación</h2>
              <p className="text-neutral-600">Responde preguntas sobre comunicación aumentativa</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-5 rounded-2xl text-center shadow-lg border-2 border-green-300">
            <div className="text-3xl font-bold text-white">{currentQuestion + 1}/{communicationQuestions.length}</div>
            <div className="text-sm text-green-100 font-medium mt-1">Progreso</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-5 rounded-2xl text-center shadow-lg border-2 border-blue-300">
            <div className="text-3xl font-bold text-white">{correct}</div>
            <div className="text-sm text-blue-100 font-medium mt-1">Correctas</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-5 rounded-2xl text-center shadow-lg border-2 border-red-300">
            <div className="text-3xl font-bold text-white">{incorrect}</div>
            <div className="text-sm text-red-100 font-medium mt-1">Incorrectas</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-5 rounded-2xl text-center shadow-lg border-2 border-orange-300">
            <div className="text-3xl font-bold text-white">{formatTime(time)}</div>
            <div className="text-sm text-orange-100 font-medium mt-1">Tiempo</div>
            <Clock className="w-5 h-5 mx-auto mt-2 text-white" />
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-8 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-600 to-blue-600 h-full transition-all duration-700"
            style={{ width: `${(currentQuestion / communicationQuestions.length) * 100}%` }}
          />
        </div>

        {/* Mensaje de fin de juego */}
        {gameOver ? (
          <div className="mb-8 p-8 bg-gradient-to-r from-success-500 via-success-600 to-success-700 text-white rounded-3xl text-center animate-pulse shadow-2xl border-4 border-success-300">
            <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-300" />
            <h3 className="text-3xl font-bold mb-3">¡Quiz Completado!</h3>
            <p className="text-xl mb-3">Respondiste correctamente <span className="font-bold text-yellow-300">{correct}/{communicationQuestions.length}</span> preguntas</p>
            <p className="text-lg mb-2">Precisión: <span className="font-bold text-yellow-300">{((correct / communicationQuestions.length) * 100).toFixed(1)}%</span></p>
            <p className="text-lg mb-2">Tiempo total: <span className="font-bold text-yellow-300">{formatTime(time)}</span></p>
            {correct > communicationQuestions.length * 0.6 ? (
              <p className="text-lg font-bold text-yellow-200 mt-3">¡Excelente trabajo! Demostraste buenos conocimientos de comunicación.</p>
            ) : (
              <p className="text-lg text-yellow-100 mt-3">Sigue practicando para mejorar tu conocimiento sobre comunicación.</p>
            )}
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
            {/* Pregunta */}
            <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border-2 border-green-300">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                {communicationQuestions[currentQuestion].question}
              </h3>

              {/* Opciones */}
              <div className="space-y-3">
                {communicationQuestions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !answered && selectAnswer(index)}
                    disabled={answered}
                    className={`w-full p-4 rounded-xl font-semibold text-left transition-all transform ${
                      answered
                        ? index === communicationQuestions[currentQuestion].correct
                          ? 'bg-gradient-to-r from-success-500 to-success-600 text-white border-2 border-success-700'
                          : selectedAnswer === index
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-red-700'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                        : selectedAnswer === index
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-blue-700 scale-105'
                        : 'bg-gray-100 text-gray-900 border-2 border-gray-300 hover:bg-gray-200 hover:scale-102'
                    } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {answered && (
                        index === communicationQuestions[currentQuestion].correct ? (
                          <CheckCircle size={24} className="text-white" />
                        ) : selectedAnswer === index ? (
                          <XCircle size={24} className="text-white" />
                        ) : null
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Explicación */}
            {answered && (
              <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-300 rounded-2xl">
                <h4 className="font-bold text-blue-900 mb-2">💡 Explicación:</h4>
                <p className="text-blue-800">
                  {communicationQuestions[currentQuestion].explanation}
                </p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-4">
              {!answered ? (
                <button
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                    selectedAnswer === null
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-success-500 to-success-700 hover:from-success-600 hover:to-success-800 text-white hover:shadow-xl'
                  }`}
                >
                  Responder
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  {currentQuestion === communicationQuestions.length - 1 ? 'Ver Resultados' : 'Siguiente Pregunta'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
