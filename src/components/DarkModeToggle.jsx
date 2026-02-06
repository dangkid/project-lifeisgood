import { Moon, Sun } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function DarkModeToggle() {
  const { isDark, toggleDarkMode } = useApp();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <Sun size={20} className="text-yellow-400" />
      ) : (
        <Moon size={20} className="text-blue-600" />
      )}
    </button>
  );
}
