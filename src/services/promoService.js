import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const promoRef = collection(db, "promos");

export const getPromos = async () => {
  const snapshot = await getDocs(promoRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const addPromo = async (data) => {
  return await addDoc(promoRef, data);
};

export const updatePromo = async (id, data) => {
  return await updateDoc(doc(db, "promos", id), data);
};

export const deletePromo = async (id) => {
  return await deleteDoc(doc(db, "promos", id));
};