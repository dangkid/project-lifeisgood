import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Target, Award, Calendar, CheckCircle, Star, Users } from 'lucide-react';

export default function ProgressPage({ user }) {
  const weeklyData = [
    { day: 'Lun', minutes: 45 },
    { day: 'Mar', minutes: 60 },
    { day: 'Mié', minutes: 30 },
    { day: 'Jue', minutes: 75 },
    { day: 'Vie', minutes: 50 },
    { day: 'Sáb', minutes: 40 },
    { day: 'Dom', minutes: 55 },
  ];

  const achievements = [
    { id: 1, title: 'Primeros Pasos', description: 'Completar 5 lecciones', earned: true, icon: Star },
    { id: 2, title: 'Consistencia', description: 'Practicar 7 días seguidos', earned: true, icon: Calendar },
    { id: 3, title: 'Comunicador Avanzado', description: 'Usar 50 frases diferentes', earned: false, icon: Award },
    { id: 4, title: 'Colaborador', description: 'Compartir con familiares', earned: true, icon: Users },
  ];

  const learningGoals = [
    { id: 1, title: 'Ampliar vocabulario', progress: 75, target: 100 },
    { id: 2, title: 'Mejorar pronunciación', progress: 40, target: 100 },
    { id: 3, title: 'Construir frases complejas', progress: 60, target: 100 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Progreso
                </h1>
                <p className="text-xs text-gray-500">Sigue tu evolución</p>
              </div>
              <h1 className="sm:hidden text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Progreso
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
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tu Progreso de Aprendizaje
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            Visualiza tu evolución, logros y metas en el camino de la comunicación.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">85%</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Progreso Total</h3>
            <p className="text-gray-600 text-sm">Avance general en el programa</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">24</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Días Activos</h3>
            <p className="text-gray-600 text-sm">Racha actual de práctica</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">12/15</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Metas Cumplidas</h3>
            <p className="text-gray-600 text-sm">Objetivos alcanzados</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">8</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Logros</h3>
            <p className="text-gray-600 text-sm">Insignias obtenidas</p>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Actividad Semanal</h3>
            <span className="text-gray-600">Minutos de práctica por día</span>
          </div>
          <div className="flex items-end justify-between h-48">
            {weeklyData.map((item, index) => {
              const height = (item.minutes / 80) * 100;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-gray-900 font-bold mb-2">{item.minutes}</div>
                  <div
                    className="w-10 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="mt-2 text-gray-600 font-medium">{item.day}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Goals */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-blue-500" />
              <h3 className="text-2xl font-bold text-gray-900">Metas de Aprendizaje</h3>
            </div>
            <div className="space-y-6">
              {learningGoals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900">{goal.title}</span>
                    <span className="text-gray-700 font-bold">{goal.progress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-gray-500 mt-1">
                    Objetivo: {goal.target}%
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
              Establecer nuevas metas
            </button>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-yellow-500" />
              <h3 className="text-2xl font-bold text-gray-900">Logros</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${achievement.earned ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {achievement.earned ? 'Obtenido' : 'Pendiente'}
                      </span>
                      {achievement.earned && <CheckCircle className="w-5 h-5 text-green-500" />}
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