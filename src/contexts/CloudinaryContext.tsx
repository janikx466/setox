import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToCloudinarySettings, getCloudinaryName } from '@/lib/firebase';

interface CloudinaryContextType {
  cloudName: string;
  isConfigured: boolean;
}

const CloudinaryContext = createContext<CloudinaryContextType>({
  cloudName: '',
  isConfigured: false,
});

export const CloudinaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cloudName, setCloudName] = useState(getCloudinaryName());

  useEffect(() => {
    // Subscribe to Cloudinary settings from Firestore for cross-device sync
    const unsubscribe = subscribeToCloudinarySettings((name) => {
      setCloudName(name);
    });

    return () => unsubscribe();
  }, []);

  return (
    <CloudinaryContext.Provider value={{ cloudName, isConfigured: !!cloudName }}>
      {children}
    </CloudinaryContext.Provider>
  );
};

export const useCloudinary = () => useContext(CloudinaryContext);
