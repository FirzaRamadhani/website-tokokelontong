import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const productCollection = collection(db, "products");

export const getProducts = async () => {
  const snapshot = await getDocs(productCollection);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getProductById = async (id) => {
  const productRef = doc(db, "products", id);

  const snapshot = await getDoc(productRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

export const addProduct = async (data) => {
  await addDoc(productCollection, {
    ...data,
    createdAt: Timestamp.now(),
  });
};

export const updateProduct = async (id, data) => {
  const productRef = doc(db, "products", id);

  await updateDoc(productRef, data);
};

export const deleteProduct = async (id) => {
  const productRef = doc(db, "products", id);

  await deleteDoc(productRef);
};

export const updateProductStock = async (
  productId,
  newStock
) => {
  const productRef = doc(
    db,
    "products",
    productId
  );

  const productSnapshot =
    await getDoc(productRef);

  if (!productSnapshot.exists()) {
    throw new Error(
      "Produk tidak ditemukan"
    );
  }

  if (newStock < 0) {
    throw new Error(
      "Stock tidak boleh minus"
    );
  }

  await updateDoc(productRef, {
    stock: newStock,
  });
};