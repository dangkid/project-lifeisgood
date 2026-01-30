import { useState, useEffect } from 'react';
import { 
  getDeviceType, 
  getOrientation, 
  getOptimalColumns, 
  getRecommendedButtonSize,
  isTouchDevice 
} from '../utils/responsiveUtils';

/**
 * Hook para obtener información responsive en tiempo real
 * @returns {Object} Información del dispositivo
 */
export function useResponsiveInfo() {
  const [info, setInfo] = useState({
    deviceType: getDeviceType(),
    orientation: getOrientation(),
    width: window.innerWidth,
    height: window.innerHeight,
    isTouch: isTouchDevice(),
    optimalColumns: getOptimalColumns(getDeviceType(), getOrientation()),
    buttonSize: getRecommendedButtonSize(getDeviceType())
  });

  useEffect(() => {
    const handleResize = () => {
      const deviceType = getDeviceType();
      const orientation = getOrientation();
      
      setInfo({
        deviceType,
        orientation,
        width: window.innerWidth,
        height: window.innerHeight,
        isTouch: isTouchDevice(),
        optimalColumns: getOptimalColumns(deviceType, orientation),
        buttonSize: getRecommendedButtonSize(deviceType)
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return info;
}

export default useResponsiveInfo;