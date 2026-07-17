'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  collection, addDoc, setDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CRMContext = createContext(null);

// Generic real-time sync for any collection — used for employees, products, clients, invoices
function useCollectionSync(collectionName) {
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((d) => ({ ...d.data(), id: d.id })));
        setLoaded(true);
      },
      (error) => {
        console.error(`Error syncing ${collectionName}:`, error);
        setLoaded(true);
      }
    );
    return () => unsubscribe();
  }, [collectionName]);

  const add = async (item) => {
    const { id, ...payload } = item;
    const dataToSave = { ...payload, createdAt: serverTimestamp() };
    if (id) {
      // Preserve a manually entered ID (e.g. SKU, Employee ID) as the actual doc ID
      await setDoc(doc(db, collectionName, id), dataToSave);
    } else {
      await addDoc(collection(db, collectionName), dataToSave);
    }
  };

  const update = async (id, item) => {
    const { id: _drop, ...payload } = item;
    await updateDoc(doc(db, collectionName, id), payload);
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, collectionName, id));
  };

  return { data, loaded, add, update, remove };
}

export function CRMProvider({ children }) {
  const employeesSync = useCollectionSync('employees');
  const productsSync = useCollectionSync('products');
  const clientsSync = useCollectionSync('clients');
  const invoicesSync = useCollectionSync('invoices');

  const isLoaded =
    employeesSync.loaded && productsSync.loaded && clientsSync.loaded && invoicesSync.loaded;

  const value = {
    employees: employeesSync.data,
    addEmployee: employeesSync.add,
    updateEmployee: employeesSync.update,
    deleteEmployee: employeesSync.remove,

    products: productsSync.data,
    addProduct: productsSync.add,
    updateProduct: productsSync.update,
    deleteProduct: productsSync.remove,

    clients: clientsSync.data,
    addClient: clientsSync.add,
    updateClient: clientsSync.update,
    deleteClient: clientsSync.remove,

    invoices: invoicesSync.data,
    addInvoice: invoicesSync.add,
    updateInvoice: invoicesSync.update,
    deleteInvoice: invoicesSync.remove,

    isLoaded,
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM must be used within a CRMProvider');
  return ctx;
}