import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SiteSettings {
  websiteName: string;
  websiteDescription: string;
  footerText: string;
  websiteLogo: string;
  supportGmail: string;
  whatsappNumber: string;
}

interface PaymentSettings {
  paymentLogo: string;
  accountName: string;
  accountNumber: string;
  iban: string;
}

interface SiteSettingsContextType {
  siteSettings: SiteSettings;
  paymentSettings: PaymentSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => Promise<void>;
  loading: boolean;
}

const defaultSiteSettings: SiteSettings = {
  websiteName: 'Foxo Services',
  websiteDescription: 'Premium digital services for your business needs',
  footerText: '© 2024 Foxo Services. All rights reserved.',
  websiteLogo: '',
  supportGmail: 'support@foxo.com',
  whatsappNumber: '+1234567890',
};

const defaultPaymentSettings: PaymentSettings = {
  paymentLogo: '',
  accountName: '',
  accountNumber: '',
  iban: '',
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubSite = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        setSiteSettings({ ...defaultSiteSettings, ...doc.data() });
      }
      setLoading(false);
    });

    const unsubPayment = onSnapshot(doc(db, 'settings', 'payment'), (doc) => {
      if (doc.exists()) {
        setPaymentSettings({ ...defaultPaymentSettings, ...doc.data() });
      }
    });

    return () => {
      unsubSite();
      unsubPayment();
    };
  }, []);

  const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
    try {
      const newSettings = { ...siteSettings, ...settings };
      await setDoc(doc(db, 'settings', 'site'), newSettings);
    } catch (error: any) {
      if (error?.code === 'permission-denied') {
        throw new Error('Firebase permission denied. Please update your Firestore security rules to allow writes. Go to Firebase Console → Firestore Database → Rules and set appropriate permissions.');
      }
      throw error;
    }
  };

  const updatePaymentSettings = async (settings: Partial<PaymentSettings>) => {
    try {
      const newSettings = { ...paymentSettings, ...settings };
      await setDoc(doc(db, 'settings', 'payment'), newSettings);
    } catch (error: any) {
      if (error?.code === 'permission-denied') {
        throw new Error('Firebase permission denied. Please update your Firestore security rules to allow writes.');
      }
      throw error;
    }
  };

  return (
    <SiteSettingsContext.Provider 
      value={{ 
        siteSettings, 
        paymentSettings, 
        updateSiteSettings, 
        updatePaymentSettings,
        loading 
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return context;
};
