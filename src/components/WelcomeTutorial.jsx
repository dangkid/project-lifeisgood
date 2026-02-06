import { useState } from 'react';
import { Building2, Users, Plus, Settings, X } from 'lucide-react';

export default function WelcomeTutorial({ centerName, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '¡Bienvenido a tu Centro!',
      description: `Tu centro "${centerName}" ha sido creado exitosamente. Aquí podrás gestionar botones de comunicación y perfiles de pacientes.`,
      icon: Building2,
      color: 'blue'
    },
    {
      title: 'Crear Botones de Comunicación',
      description: 'Los botones son las palabras o frases que tus pacientes pueden usar para comunicarse. Puedes organizarlos en categorías para una mejor experiencia.',
      icon: Plus,
      color: 'purple'
    },
    {
      title: 'Gestionar Perfiles de Pacientes',
      description: 'Crea y gestiona los perfiles de tus pacientes. Cada perfil puede tener sus propios botones y configuraciones personalizadas.',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Invitar Miembros del Equipo',
      description: 'Invite a otros especialistas, terapeutas o administradores para que colaboren en la gestión del centro.',
      icon: Users,
      color: 'orange'
    },
    {
      title: '¡Estás Listo!',
      description: 'Ahora puedes comenzar a crear botones y gestionar tus pacientes. ¡Bienvenido a AAC Life is Good!',
      icon: Building2,
      color: 'indigo'
    }
  ];

  const step = steps[currentStep];
  const Icon = step.icon;
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header con gradient */}
        <div className={`bg-gradient-to-r ${colorClasses[step.color]} p-8 text-white relative`}>
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Icon size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{step.title}</h2>
              <p className="text-white text-opacity-90">Paso {currentStep + 1} de {steps.length}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-gray-700 text-lg leading-relaxed mb-8">
            {step.description}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
            <div
              className={`bg-gradient-to-r ${colorClasses[step.color]} h-full transition-all duration-300`}
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-between">
            <button
              onClick={handleSkip}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Saltar
            </button>
            <button
              onClick={handleNext}
              className={`px-8 py-2 bg-gradient-to-r ${colorClasses[step.color]} text-white rounded-lg font-medium hover:shadow-lg transition-all`}
            >
              {currentStep === steps.length - 1 ? '¡Comenzar!' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
