import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const orderCollection = collection(db, "orders");

const generateOrderNumber = () => {

  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const random = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

  return `ORD-${year}${month}${day}-${random}`;

};

export const addOrder = async (data) => {

  const createdAt = Timestamp.now();

  const expiredAt = Timestamp.fromDate(
    new Date(
      createdAt.toDate().getTime() +
      15 * 60 * 1000
    )
  );

  const orderNumber =
    generateOrderNumber();

  const docRef = await addDoc(
    orderCollection,
    {
      ...data,

      orderNumber,

      createdAt,

      expiredAt,
    }
  );

  return {

    id: docRef.id,

    orderNumber,

  };

};

export const getOrders = async () => {
  const snapshot = await getDocs(orderCollection);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().createdAt
      ? new Date(
          doc.data().createdAt.seconds * 1000
        ).toLocaleDateString("id-ID")
      : "-",
  }));
};

export const updateOrderStatus = async (id, status) => {
  const orderRef = doc(db, "orders", id);

  await updateDoc(orderRef, {
    status,
  });
};

export const getCustomerOrders = async (
  customerName
) => {
  const q = query(

      orderCollection,

      where("uid","==",uid),

      orderBy("createdAt","desc")

  );

  const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt
            ? new Date(
                doc.data().createdAt.seconds * 1000
            ).toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
            : "-",
    }));
  };

export const isProductUsedInOrders = async (
  productName
) => {
  const snapshot = await getDocs(orderCollection);

  return snapshot.docs.some((doc) =>
    doc
      .data()
      .items?.some(
        (item) =>
          item.name === productName
      )
  );
};

export const getOrderById = async (id) => {
  const orderRef = doc(
    db,
    "orders",
    id
  );

  const snapshot = await getDoc(orderRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

export const expireOrder = async (id) => {
  const orderRef = doc(db, "orders", id);

  await updateDoc(orderRef, {
    status: "Expired",
  });
};

export const updatePaymentStatus = async (
  id,
  paymentStatus
) => {

  const orderRef = doc(db, "orders", id);

  await updateDoc(orderRef, {

    paymentStatus,

    paymentSubmittedAt: Timestamp.now(),

  });

};

export const verifyPayment = async (id) => {

  const orderRef = doc(db, "orders", id);

  await updateDoc(orderRef, {

    paymentStatus: "Lunas",

    paymentConfirmedAt: Timestamp.now(),

    status: "Diproses",

  });

};

export const completeOrder = async (id) => {

  const orderRef = doc(db, "orders", id);

  await updateDoc(orderRef, {

    status: "Selesai",

    completedAt: Timestamp.now(),

  });

};

export const getOrdersByUser = async (uid) => {
  const q = query(
    orderCollection,
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().createdAt
      ? new Date(
          doc.data().createdAt.seconds * 1000
        ).toLocaleString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",
  }));
};

export const subscribeOrdersByUser = (
  uid,
  callback
) => {

  const q = query(
    orderCollection,
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().createdAt
        ? new Date(
            doc.data().createdAt.seconds * 1000
          ).toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",

    }));
    callback(orders);
  });
};

export const subscribeOrders = (callback) => {

    return onSnapshot(

        orderCollection,

        (snapshot)=>{

            const data = snapshot.docs.map((doc)=>({

                id:doc.id,

                ...doc.data(),

            }));

            callback(data);

        }

    );

};

export const trackGuestOrder = async (
  orderNumber,
  phone
) => {

  try {

    const q = query(
      orderCollection,
      where("orderNumber", "==", orderNumber),
      where("phone", "==", phone)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const docData = snapshot.docs[0];

    const data = docData.data();

    return {
      id: docData.id,
      ...data,
      date: data.createdAt
        ? new Date(
            data.createdAt.seconds * 1000
          ).toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
    };

  } catch (error) {

    console.error(error);

    return null;

  }

};