import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

export const getCustomers = async () => {
  const usersSnapshot = await getDocs(
    collection(db, "users")
  );
  const ordersSnapshot = await getDocs(
    collection(db, "orders")
  );
  const orders = ordersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return usersSnapshot.docs.map(doc => {
    const user = doc.data();
    const customerOrders = orders.filter(
      order => order.userId === user.uid
    );
    const totalOrder = customerOrders.length;
    const totalBelanja = customerOrders.reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0
    );

    const latestOrder =
      customerOrders.sort(
        (a,b)=>
          (b.createdAt?.seconds || 0) -
          (a.createdAt?.seconds || 0)
      )[0];

    return {
      id: user.uid,
      name: user.name,
      email: user.email,
      phone: user.phone || "-",
      address: user.address || "-",
      totalOrder,
      totalBelanja,
      lastOrder:
        latestOrder?.createdAt || null,
      orders: customerOrders
    };
  });
};