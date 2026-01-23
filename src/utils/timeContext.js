// Get current time context based on hour of day
export const getTimeContext = () => {
  const hour = new Date().getHours();

  if (hour >= 8 && hour < 11) {
    return 'morning';
  } else if (hour >= 14 && hour < 19) {
    return 'afternoon';
  } else if (hour >= 20 || hour < 8) {
    return 'night';
  }
  
  // Default to afternoon for edge cases
  return 'afternoon';
};

// Filter buttons by time context
export const filterButtonsByContext = (buttons) => {
  const currentContext = getTimeContext();
  
  return buttons.filter(button => {
    // Show buttons marked as "always"
    if (button.time_context.includes('always')) {
      return true;
    }
    
    // Show buttons that match current time context
    return button.time_context.includes(currentContext);
  });
};

// Get time context label in Spanish
export const getTimeContextLabel = (context) => {
  const labels = {
    morning: 'Mañana',
    afternoon: 'Tarde',
    night: 'Noche',
    always: 'Siempre'
  };
  return labels[context] || context;
};
