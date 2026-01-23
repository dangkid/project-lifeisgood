import { useState, useEffect } from 'react';
import { X, PlayCircle, CheckCircle, ArrowRight } from 'lucide-react';

const TUTORIAL_STEPS_ADMIN = [
  {
    title: 'Bienvenido al Panel Admin',
    description: 'Aquí podrás gestionar botones de comunicación y perfiles de pacientes.',
    target: null
  },
  {
    title: 'Crear Perfiles de Pacientes',
    description: 'Ve a la pestaña "Perfiles de Pacientes" y crea un perfil para cada paciente. Incluye foto, nombre, descripción y etiquetas.',
    target: 'profiles-tab'
  },
  {
    title: 'Agregar Botones',
    description: 'En la pestaña "Botones de Comunicación", crea botones con pictogramas de ARASAAC. Cada botón puede tener imagen, texto y voz.',
    target: 'buttons-tab'
  },
  {
    title: 'Ver Estadísticas',
    description: 'Haz clic en el botón "Stats" de cualquier perfil para ver el progreso y botones más usados.',
    target: 'stats-button'
  },
  {
    title: 'Exportar Datos',
    description: 'Usa el botón "Exportar/Importar" para crear backups o generar reportes PDF para compartir con terapeutas.',
    target: 'export-button'
  }
];

const TUTORIAL_STEPS_PATIENT = [
  {
    title: 'Bienvenido al Comunicador AAC',
    description: 'Esta aplicación te ayudará a comunicarte usando pictogramas y voz.',
    target: null
  },
  {
    title: 'Selecciona tu Perfil',
    description: 'Primero, selecciona tu perfil en la esquina superior derecha. Si no tienes uno, pide al administrador que lo cree.',
    target: 'profile-selector'
  },
  {
    title: 'Presiona los Botones',
    description: 'Toca cualquier botón para escuchar la palabra. Los botones se añadirán a la barra inferior para construir frases.',
    target: 'button-grid'
  },
  {
    title: 'Construye Frases',
    description: 'Selecciona varios botones para crear una frase. Luego presiona "Decir Frase" para escuchar la frase completa.',
    target: 'phrase-builder'
  },
  {
    title: 'Ver tus Estadísticas',
    description: 'Presiona el botón "Stats" para ver cuántas frases has creado y qué botones usas más.',
    target: 'stats-button'
  }
];

export default function Tutorial({ type = 'patient', onComplete }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const steps = type === 'admin' ? TUTORIAL_STEPS_ADMIN : TUTORIAL_STEPS_PATIENT;

  useEffect(() => {
    // Verificar si ya completó el tutorial
    const tutorialKey = `tutorial_completed_${type}`;
    const hasCompleted = localStorage.getItem(tutorialKey);
    
    if (!hasCompleted) {
      // Mostrar tutorial después de 1 segundo
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [type]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    const tutorialKey = `tutorial_completed_${type}`;
    localStorage.setItem(tutorialKey, 'true');
    setCompleted(true);
    setShowTutorial(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleRestart = () => {
    const tutorialKey = `tutorial_completed_${type}`;
    localStorage.removeItem(tutorialKey);
    setCurrentStep(0);
    setCompleted(false);
    setShowTutorial(true);
  };

  if (!showTutorial && !completed) {
    return (
      <button
        onClick={handleRestart}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all z-40 flex items-center gap-2"
        title="Ver Tutorial"
      >
        <PlayCircle size={24} />
      </button>
    );
  }

  if (!showTutorial) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      {/* Modal */}
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">{currentStep + 1}</span>
              </div>
              <span className="text-sm text-gray-500">
                Paso {currentStep + 1} de {steps.length}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentStepData.title}
            </h2>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <p className="text-gray-600 text-lg mb-6 leading-relaxed">
          {currentStepData.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Saltar Tutorial
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {currentStep < steps.length - 1 ? (
              <>
                Siguiente
                <ArrowRight size={20} />
              </>
            ) : (
              <>
                Completar
                <CheckCircle size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
