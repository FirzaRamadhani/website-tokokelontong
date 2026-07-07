import { time } from "framer-motion";
import { getOrders } from "./orderService";
import { getProducts } from "./productService";
import { getPromos } from "./promoService";

export const getNotifications = async () => {
  const notifications = [];

  const orders = await getOrders();
  const products = await getProducts();
  const promos = await getPromos();

  // ==========================
  // ORDER BARU
  // ==========================
  orders
    .filter((order) => order.status === "Pending")
    .forEach((order) => {
      notifications.push({
        type:"order",
        title:"Pesanan Baru",
        message:`${order.customer} membuat pesanan`,
        createdAt:order.createdAt,
        time: timeAgo(order.createdAt)
    })
    });

  // ==========================
  // MENUNGGU VERIFIKASI
  // ==========================
  orders
    .filter(
      (order) =>
        order.status === "Menunggu Verifikasi"
    )
    .forEach((order) => {
      notifications.push({
        type: "payment",
        color: "orange",
        title: "Pembayaran Baru",
        message: `${order.customer} mengirim bukti pembayaran`,
        createdAt: order.createdAt,
        time: timeAgo(order.createdAt)
      });
    });

  // ==========================
  // STOK MENIPIS
  // ==========================
  products
    .filter(
      (product) =>
        Number(product.stock) <= 10
    )
    .forEach((product) => {
      notifications.push({
        type: "stock",
        color: "red",
        title: "Stok Menipis",
        message: `${product.name} tersisa ${product.stock}`,
        time:"Baru saja"
      });
    });

  // ==========================
  // PROMO AKTIF
  // ==========================
  promos
    .filter(
      (promo) => promo.status === "Aktif"
    )
    .forEach((promo) => {
      notifications.push({
        type:"promo",
        color:"blue",
        title:"Promo Aktif",
        message:`${promo.productName} sedang promo`,
        time:"Baru saja"
      });
    });

  notifications.sort(
    (a, b) =>
      (b.createdAt?.seconds || 0) -
      (a.createdAt?.seconds || 0)
  );

  return notifications;
};

const timeAgo = (createdAt) => {
  if (!createdAt) return "Baru saja";

  const now = new Date();

  const created = new Date(
    createdAt.seconds * 1000
  );

  const diff =
    Math.floor((now - created) / 1000);

  if (diff < 60)
    return "Baru saja";

  if (diff < 3600)
    return `${Math.floor(diff / 60)} menit lalu`;

  if (diff < 86400)
    return `${Math.floor(diff / 3600)} jam lalu`;

  return `${Math.floor(diff / 86400)} hari lalu`;
};