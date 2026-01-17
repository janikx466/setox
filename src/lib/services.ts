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
  await addDoc(collection(db, 'services'), {
    ...service,
    createdAt: Date.now()
  });
};

export const updateService = async (id: string, service: Partial<Service>) => {
  await updateDoc(doc(db, 'services', id), service);
};

export const deleteService = async (id: string) => {
  await deleteDoc(doc(db, 'services', id));
};
