// Sistema de perfiles de usuario
const PROFILES_KEY = 'aac_user_profiles';
const CURRENT_PROFILE_KEY = 'aac_current_profile';

export const getProfiles = () => {
  const profiles = localStorage.getItem(PROFILES_KEY);
  return profiles ? JSON.parse(profiles) : [];
};

export const getCurrentProfile = () => {
  const profileId = localStorage.getItem(CURRENT_PROFILE_KEY);
  if (!profileId) return null;
  
  const profiles = getProfiles();
  return profiles.find(p => p.id === profileId) || null;
};

export const setCurrentProfile = (profileId) => {
  localStorage.setItem(CURRENT_PROFILE_KEY, profileId);
};

export const createProfile = (name, avatar = '👤') => {
  const profiles = getProfiles();
  const newProfile = {
    id: Date.now().toString(),
    name,
    avatar,
    createdAt: new Date().toISOString(),
    preferences: {
      voiceGender: 'female',
      scanSpeed: 2000,
      darkMode: false
    }
  };
  
  profiles.push(newProfile);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  return newProfile;
};

export const updateProfile = (profileId, updates) => {
  const profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  
  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...updates };
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    return profiles[index];
  }
  
  return null;
};

export const deleteProfile = (profileId) => {
  const profiles = getProfiles().filter(p => p.id !== profileId);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  
  // Si era el perfil actual, limpiar
  if (localStorage.getItem(CURRENT_PROFILE_KEY) === profileId) {
    localStorage.removeItem(CURRENT_PROFILE_KEY);
  }
};
