import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const settingsRef = doc(
  db,
  "settings",
  "store"
);

export const getSettings = async () => {
  const snapshot = await getDoc(settingsRef);

  if (!snapshot.exists()) return null;

  return snapshot.data();
};

export const saveSettings = async (data) => { 
  await setDoc(
    settingsRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
};