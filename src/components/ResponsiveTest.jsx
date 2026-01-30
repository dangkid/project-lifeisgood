import { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Check, X, XCircle } from 'lucide-react';

export default function ResponsiveTest() {
  const [currentWidth, setCurrentWidth] = useState(window.innerWidth);
  const [testResults, setTestResults] = useState({});
  const [isVisible, setIsVisible] = useState(() => {
    // Verificar si el usuario ha ocultado previamente el componente
    const hidden = localStorage.getItem('responsiveTestHidden');
    return !hidden;
  });

  // Si no estamos en desarrollo, no mostrar el componente
  if (!import.meta.env.DEV) {
    return null;
  }

  useEffect(() => {
    const handleResize = () => {
      setCurrentWidth(window.innerWidth);
      runResponsiveTests();
    };

    window.addEventListener('resize', handleResize);
    runResponsiveTests();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const runResponsiveTests = () => {
    const width = window.innerWidth;
    const results = {
      mobile: width < 640,
      tablet: width >= 640 && width < 1024,
      desktop: width >= 1024,
      ipadPortrait: width >= 768 && width < 1024,
      ipadLandscape: width >= 1024 && width < 1366,
      buttonsVisible: document.querySelector('.grid')?.children?.length > 0 || false,
      textReadable: checkTextReadability(),
      touchTargets: checkTouchTargets(),
    };
    setTestResults(results);
  };

  const checkTextReadability = () => {
    const testElement = document.querySelector('button, .text-lg, .text-xl, .text-2xl');
    if (!testElement) return true;
    
    const computedStyle = window.getComputedStyle(testElement);
    const fontSize = parseInt(computedStyle.fontSize);
    return fontSize >= 16; // Mínimo 16px para accesibilidad
  };

  const checkTouchTargets = () => {
    const buttons = document.querySelectorAll('button');
    if (buttons.length === 0) return true;
    
    let allValid = true;
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        allValid = false;
      }
    });
    return allValid;
  };

  const getDeviceType = () => {
    if (currentWidth < 640) return 'Móvil';
    if (currentWidth < 768) return 'Tablet pequeña';
    if (currentWidth < 1024) return 'iPad/Tablet';
    if (currentWidth < 1280) return 'Laptop';
    return 'Desktop';
  };

  const getRecommendedColumns = () => {
    if (currentWidth < 640) return '2 columnas';
    if (currentWidth < 768) return '2-3 columnas';
    if (currentWidth < 1024) return '3-4 columnas';
    if (currentWidth < 1280) return '4-5 columnas';
    return '5+ columnas';
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('responsiveTestHidden', 'true');
  };

  const handleShowAgain = () => {
    setIsVisible(true);
    localStorage.removeItem('responsiveTestHidden');
  };

  if (!isVisible) {
    return (
      <button
        onClick={handleShowAgain}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 transition-colors"
        title="Mostrar prueba de responsividad"
      >
        <Monitor size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-xl shadow-2xl z-50 max-w-sm">
      <div className="bg-blue-600 text-white p-3 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor size={20} />
          <span className="font-bold">Prueba Responsive</span>
          <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full">DEV</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {currentWidth}px • {getDeviceType()}
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-red-200 transition-colors"
            title="Cerrar panel"
          >
            <XCircle size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Dispositivos */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`flex flex-col items-center p-2 rounded-lg ${testResults.mobile ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
            <Smartphone size={24} className={testResults.mobile ? 'text-green-600' : 'text-gray-400'} />
            <span className="text-xs mt-1">Móvil</span>
          </div>
          <div className={`flex flex-col items-center p-2 rounded-lg ${testResults.tablet ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
            <Tablet size={24} className={testResults.tablet ? 'text-green-600' : 'text-gray-400'} />
            <span className="text-xs mt-1">Tablet</span>
          </div>
          <div className={`flex flex-col items-center p-2 rounded-lg ${testResults.desktop ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
            <Monitor size={24} className={testResults.desktop ? 'text-green-600' : 'text-gray-400'} />
            <span className="text-xs mt-1">Desktop</span>
          </div>
        </div>

        {/* Resultados de pruebas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Texto legible</span>
            {testResults.textReadable ? (
              <Check size={18} className="text-green-600" />
            ) : (
              <X size={18} className="text-red-600" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Botones táctiles</span>
            {testResults.touchTargets ? (
              <Check size={18} className="text-green-600" />
            ) : (
              <X size={18} className="text-red-600" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Botones visibles</span>
            {testResults.buttonsVisible ? (
              <Check size={18} className="text-green-600" />
            ) : (
              <X size={18} className="text-red-600" />
            )}
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-bold text-blue-800 text-sm mb-1">Recomendaciones:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Dispositivo: {getDeviceType()}</li>
            <li>• Columnas recomendadas: {getRecommendedColumns()}</li>
            <li>• Tamaño de fuente mínimo: 16px</li>
            <li>• Área táctil mínima: 44×44px</li>
            {testResults.ipadPortrait && (
              <li className="font-bold">• Modo iPad Portrait activado</li>
            )}
            {testResults.ipadLandscape && (
              <li className="font-bold">• Modo iPad Landscape activado</li>
            )}
          </ul>
        </div>

        {/* Breakpoints */}
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">Breakpoints activos:</div>
          <div className="grid grid-cols-2 gap-1">
            <div className={`px-2 py-1 rounded ${currentWidth >= 320 ? 'bg-green-100' : 'bg-gray-100'}`}>xs: ≥320px</div>
            <div className={`px-2 py-1 rounded ${currentWidth >= 640 ? 'bg-green-100' : 'bg-gray-100'}`}>sm: ≥640px</div>
            <div className={`px-2 py-1 rounded ${currentWidth >= 768 ? 'bg-green-100' : 'bg-gray-100'}`}>md: ≥768px</div>
            <div className={`px-2 py-1 rounded ${currentWidth >= 1024 ? 'bg-green-100' : 'bg-gray-100'}`}>lg: ≥1024px</div>
            <div className={`px-2 py-1 rounded ${currentWidth >= 1280 ? 'bg-green-100' : 'bg-gray-100'}`}>xl: ≥1280px</div>
            <div className={`px-2 py-1 rounded ${currentWidth >= 1536 ? 'bg-green-100' : 'bg-gray-100'}`}>2xl: ≥1536px</div>
          </div>
        </div>
      </div>
    </div>
  );
}