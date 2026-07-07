import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const categoryCollection = collection(db, "categories");

export const getCategories = async () => {
  const snapshot = await getDocs(categoryCollection);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const addCategory = async (data) => {
  await addDoc(categoryCollection, {
    ...data,
    createdAt: Timestamp.now(),
  });
};

export const updateCategory = async (id, data) => {
  const categoryRef = doc(db, "categories", id);

  await updateDoc(categoryRef, data);
};

export const deleteCategory = async (id) => {
  const categoryRef = doc(db, "categories", id);

  await deleteDoc(categoryRef);
};