import { Sparkles, Clock, Sun, Moon } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: Sparkles },
  { id: 'morning', label: 'Mañana', icon: Sun },
  { id: 'afternoon', label: 'Tarde', icon: Clock },
  { id: 'night', label: 'Noche', icon: Moon },
];

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600'
            }`}
          >
            <Icon size={18} />
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
