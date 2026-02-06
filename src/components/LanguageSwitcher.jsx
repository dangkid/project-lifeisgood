import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ca', name: 'Català', flag: '🇨🇦' }
  ];

  const currentLang = languages.find(l => l.code === language);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
        title="Cambiar idioma"
      >
        <Globe size={18} />
        <span className="text-xl">{currentLang?.flag}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border dark:border-gray-700 min-w-[200px] top-full">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                language === lang.code ? 'bg-blue-100 dark:bg-blue-900 border-l-2 border-blue-600' : ''
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
