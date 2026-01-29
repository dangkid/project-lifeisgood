import { Link } from 'react-router-dom';
import { Zap, Puzzle, Brain, MessageSquare, Star, Trophy, Clock, Users } from 'lucide-react';

export default function EducationalGames({ user }) {
  const handlePlayGame = (gameId, gameTitle) => {
    alert(`¡Comenzando el juego: ${gameTitle}!\n\nEsta funcionalidad está en desarrollo. Pronto podrás jugar interactivamente.`);
    // Aquí se podría redirigir a una página específica del juego
    // navigate(`/juego/${gameId}`);
  };

  const games = [
    {
      id: 1,
      title: 'Memoria de Pictogramas',
      description: 'Encuentra las parejas de imágenes iguales para mejorar la memoria visual.',
      icon: Puzzle,
      color: 'from-blue-500 to-cyan-500',
      difficulty: 'Fácil',
      points: 100,
      time: '5 min',
    },
    {
      id: 2,
      title: 'Rompecabezas de Frases',
      description: 'Ordena las palabras para formar frases correctas y practicar sintaxis.',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      difficulty: 'Medio',
      points: 200,
      time: '10 min',
    },
    {
      id: 3,
      title: 'Quiz de Comunicación',
      description: 'Responde preguntas sobre situaciones sociales y comunicación.',
      icon: MessageSquare,
      color: 'from-green-500 to-teal-500',
      difficulty: 'Medio',
      points: 150,
      time: '8 min',
    },
    {
      id: 4,
      title: 'Formación de Palabras',
      description: 'Combina sílabas para formar palabras y expandir tu vocabulario.',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      difficulty: 'Difícil',
      points: 300,
      time: '15 min',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Juegos Educativos
                </h1>
                <p className="text-xs text-gray-500">Aprende jugando</p>
              </div>
              <h1 className="sm:hidden text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Juegos
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/panel-educativo"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Panel
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">
                  {user?.displayName || user?.email?.split('@')[0] || 'Jugador'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            ¡Juegos para Aprender!
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            Selecciona un juego para comenzar. Cada juego te ayuda a desarrollar habilidades de comunicación de manera divertida.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <div
                key={game.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className={`h-3 bg-gradient-to-r ${game.color}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${game.color} flex items-center justify-center`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{game.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            {game.difficulty}
                          </span>
                          <span className="flex items-center gap-1 text-gray-600 text-sm">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            {game.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6">{game.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {game.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        1 jugador
                      </div>
                    </div>
                    <button
                      onClick={() => handlePlayGame(game.id, game.title)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      Jugar ahora
                      <Zap size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h3 className="text-2xl font-bold text-gray-900">Tus Logros</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-700 mb-2">12</div>
              <div className="text-gray-700 font-medium">Juegos Completados</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-700 mb-2">1,850</div>
              <div className="text-gray-700 font-medium">Puntos Totales</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-700 mb-2">5</div>
              <div className="text-gray-700 font-medium">Medallas Obtenidas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}