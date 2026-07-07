import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  Eye,
  Pencil,
  Wallet,
  Activity,
  Star,
} from "lucide-react";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getOrders } from "../../services/orderService";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const products = await getProducts();
      const categories = await getCategories();
      const ordersData = await getOrders();
      const productSales = {};

      const totalRevenue = ordersData
      .filter((order) => order.status === "Selesai")
      .reduce(
        (sum, order) => sum + Number(order.total || 0),
        0
      );

      const waitingVerification =
      ordersData.filter(
        (order) =>
          order.status ===
          "Menunggu Verifikasi"
      ).length;

    const lowStock =
      products.filter(
        (product) =>
          Number(product.stock) <= 10
      ).length;

      const activeOrders = ordersData.filter((order) =>
        [
          "Pending",
          "Menunggu Verifikasi",
          "Diproses",
          "Dikirim",
        ].includes(order.status)
      );

      const last7Days = [];
      const salesByDate = {};

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);

        const key = d.toLocaleDateString("id-ID");

        last7Days.push(key);
        salesByDate[key] = 0;
      }

      ordersData.filter(order => order.status === "Selesai").forEach((order) => {
        if (!order.createdAt) return;

        const date = new Date(
          order.createdAt.seconds * 1000
        ).toLocaleDateString("id-ID");

        if (salesByDate[date] !== undefined) {
          salesByDate[date] += Number(order.total || 0);
        }
      });

      setChartData(
        last7Days.map((date) => ({
          date,
          total: salesByDate[date],
        }))
      );

      setStats([
        {
          title: "Omzet",
          value:
            "Rp " +
            totalRevenue.toLocaleString("id-ID"),
          growth: `${ordersData.length} Pesanan`,
          icon: Wallet,
        },

        {
          title: "Total Produk",
          value: products.length,
          growth: `${categories.length} Kategori`,
          icon: Package,
        },

        {
          title: "Total Pesanan",
          value: ordersData.length,
          growth: "Realtime",
          icon: ShoppingBag,
        },

        {
          title: "Pesanan Aktif",
          value: activeOrders.length,
          growth: "Diproses",
          icon: Users,
        },

        {
          title: "Menunggu Verifikasi",

          value: waitingVerification,

          growth: "Perlu Dicek",

          icon: Activity,
        },

        {
          title: "Stok Menipis",

          value: lowStock,

          growth: "≤ 10 Produk",

          icon: Package,
        },
      ]);

      // =========================
      // PRODUK TERLARIS
      // =========================
      ordersData
        .filter((order) => order.status === "Selesai")
        .forEach((order) => {
          order.items?.forEach((item) => {
            productSales[item.name] =
              (productSales[item.name] || 0) +
              Number(item.qty || item.quantity || 1);
          });
        });

      const bestProductsData = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, sold]) => ({
          name,
          sold: `${sold} Terjual`,
        }));

      setBestProducts(bestProductsData);
      setActivities(
        [...ordersData]
          .sort(
            (a, b) =>
              (b.createdAt?.seconds || 0) -
              (a.createdAt?.seconds || 0)
          )
          .slice(0, 5)
          .map((order) => {

            let activity = "";

            switch (order.status) {

              case "Pending":
                activity = `${order.customer} membuat pesanan baru`;
                break;

              case "Menunggu Verifikasi":
                activity = `${order.customer} mengirim konfirmasi pembayaran`;
                break;

              case "Diproses":
                activity = `Pesanan ${order.customer} sedang diproses`;
                break;

              case "Dikirim":
                activity = `Pesanan ${order.customer} sedang dikirim`;
                break;

              case "Selesai":
                activity = `Pesanan ${order.customer} telah selesai`;
                break;

              case "Expired":
                activity = `Pesanan ${order.customer} telah kedaluwarsa`;
                break;

              case "Dibatalkan":
                activity = `Pesanan ${order.customer} dibatalkan`;
                break;

              default:
                activity = `${order.customer}`;
            }

            return {
                text: activity,
                time: new Date(
                    order.createdAt.seconds * 1000
                ).toLocaleTimeString("id-ID",{
                    hour:"2-digit",
                    minute:"2-digit"
                })
            }
          })
      );
      setOrders(
        ordersData
          .sort(
            (a, b) =>
              (b.createdAt?.seconds || 0) -
              (a.createdAt?.seconds || 0)
          )
          .slice(0, 5)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const maxSales = Math.max(
    ...chartData.map((item) => item.total || 0),
    1
  );
    
  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Ringkasan aktivitas toko dan performa penjualan hari ini.</p>
        </div>
        <div className="dashboard-date"> {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", })} </div>
      </div>

      <div className="quick-action-card">
        <h3>Aksi Cepat</h3>
        <div className="quick-action-grid">
          <button
            onClick={() =>
              navigate("/admin/products/create")
            }
          >
            <Package size={20} />
            Tambah Produk
          </button>

          <button
            onClick={() =>
              navigate("/admin/promos")
            }
          >
            <TrendingUp size={20} />
            Buat Promo
          </button>

          <button
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            <ShoppingBag size={20} />
            Kelola Pesanan
          </button>

          <button
            onClick={() =>
              navigate("/admin/categories")
            }
          >
            <Package size={20} />
            Tambah Kategori
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div className="stat-card" key={item.title}>
              <div className="stat-icon">
                <Icon size={22} />
              </div>

              <div>
                <p>{item.title}</p>
                <h2>{item.value}</h2>
              </div>

              <span>{item.growth}</span>
            </div>
          );
        })}
      </div>

      <div className="dashboard-main-grid">
        <section className="sales-card">
          <div className="section-title">
            <div>
              <h2>Sales Chart</h2>
              <p>Grafik penjualan 7 hari terakhir.</p>
            </div>

            <div className="chart-filter">
              <button className="active"> 7 Hari Terakhir </button>
            </div>
          </div>
          <div className="bar-chart">
            {chartData.map((item) => (
              <div className="bar-item" key={item.date}>
                <div
                  className="bar"
                  style={{
                    height: `${Math.max(
                      (item.total / maxSales) * 150,
                      10
                    )}px`,
                  }}
                ></div>

                <span>{item.date.split("/")[0]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="promo-card">
          <div>
            <span>Campaign Ready?</span>
            <h2>Buat promo untuk produk terlaris minggu ini.</h2>
            <p>
              Tingkatkan penjualan dengan membuat diskon atau paket hemat
              untuk pelanggan.
            </p>
          </div>

          <button onClick={() => navigate("/admin/promos")}>
            Create Promo
            <TrendingUp size={18} />
          </button>
        </section>
      </div>

      <div className="analytics-grid">
        <section className="best-product-card">
          <div className="section-title">
            <div>
              <h2>Produk Terlaris</h2>
              <p>Produk dengan penjualan tertinggi.</p>
            </div>
            <Star size={22} />
          </div>
          <div className="best-product-list">
            {bestProducts.length > 0 ? (
              bestProducts.map((item, index) => (
                <div className="best-product-item" key={item.name}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.sold}</p>
                  </div>

                  <strong>#{index + 1}</strong>
                </div>
              ))
            ) : (
              <p>Belum ada data penjualan.</p>
            )}
          </div>
        </section>

        <section className="activity-card">
          <div className="section-title">
            <div>
              <h2>Aktivitas Terbaru</h2>
              <p>Log aktivitas admin hari ini.</p>
            </div>
            <Activity size={22} />
          </div>
            <div className="activity-list">
            {activities.length > 0 ? (
              activities.map((item, index) => (
                <div className="activity-item" key={index}>
                  <span className="activity-dot"></span>
                  <div>
                      <p>{item.text}</p>
                      <small>{item.time}</small>
                  </div>
              </div>
              ))
            ) : (
              <p>Belum ada aktivitas.</p>
            )}
          </div>
        </section>
      </div>

      <section className="recent-orders-card">
        <div className="section-title">
          <div>
            <h2>Recent Orders</h2>
            <p>Daftar pesanan terbaru pelanggan.</p>
          </div>

          <button className="view-all-btn" onClick={() => navigate("/admin/orders")} > View All Orders </button>
        </div>
        <div className="orders-table">
          <div className="orders-head">
            <span>Order ID</span>
            <span>Customer Name</span>
            <span>Total Price</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {orders.map((order) => (
            <div className="orders-row" key={order.id}>
              <span>{order.id}</span>
              <span>{order.customer || "-"}</span>
              <span> Rp {Number(order.total || 0).toLocaleString("id-ID")} </span>
              <span className={`status-badge ${order.status .toLowerCase() .replace(/\s+/g, "-")}`}>
                {order.status}
              </span>
              <span className="action-icons">
                <Eye
                  size={17}
                  onClick={() => navigate("/admin/orders")}
                  style={{ cursor: "pointer" }}
                />
                <Pencil
                  size={17}
                  onClick={() => navigate("/admin/orders")}
                  style={{ cursor: "pointer" }}
                />
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;