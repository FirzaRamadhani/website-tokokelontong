import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBRu8TCwQu4MzhP8AjAUMRD0cZXhOAAeDU",
  authDomain: "toko-kelontong-mas-novi.firebaseapp.com",
  projectId: "toko-kelontong-mas-novi",
  storageBucket: "toko-kelontong-mas-novi.firebasestorage.app",
  messagingSenderId: "755185170231",
  appId: "1:755185170231:web:50ea3edb4b045a5c9b0cb2",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;