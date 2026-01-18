import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Service {
  id: string;
  name: string;
  price: string;
  slug: string;
  logo: string;
  sampleImages: string[];
  createdAt: number;
}

export const subscribeToServices = (callback: (services: Service[]) => void) => {
  const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Service));
    callback(services);
  });
};

export const addService = async (service: Omit<Service, 'id' | 'createdAt'>) => {
  try {
    await addDoc(collection(db, 'services'), {
      ...service,
      createdAt: Date.now()
    });
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      throw new Error('Firebase permission denied. Please update your Firestore security rules in Firebase Console.');
    }
    throw error;
  }
};

export const updateService = async (id: string, service: Partial<Service>) => {
  try {
    await updateDoc(doc(db, 'services', id), service);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      throw new Error('Firebase permission denied. Please update your Firestore security rules in Firebase Console.');
    }
    throw error;
  }
};

export const deleteService = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      throw new Error('Firebase permission denied. Please update your Firestore security rules in Firebase Console.');
    }
    throw error;
  }
};
