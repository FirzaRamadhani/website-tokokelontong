import { useState, useEffect } from "react";

import {
  Search,
  Eye,
  PackageCheck,
  Truck,
  Clock3,
  CheckCircle,
  XCircle,
  Printer,
} from "lucide-react";

import {
  getOrders,
  updateOrderStatus,
  verifyPayment,
  completeOrder,
} from "../../services/orderService";
import {
  getProducts,
  updateProductStock,
} from "../../services/productService";

import "./OrderList.css";

const statusOptions = [
  "Pending",
  "Menunggu Verifikasi",
  "Diproses",
  "Dikirim",
  "Selesai",
  "Expired",
  "Dibatalkan",
];

function OrderList() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [sortBy, setSortBy] = useState("Terbaru");
  const [currentPage, setCurrentPage] =
    useState(1);
  const ORDERS_PER_PAGE = 8;
  const fetchOrders = async () => {
    const data = await getOrders();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []); 

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, sortBy]);

  const handleStatusChange = async (
    order,
    newStatus
  ) => {
    try {
      if (
        newStatus === "Selesai" &&
        order.status !== "Selesai"
      ) {
        const products = await getProducts();

        for (const item of order.items || []) {
          const product = products.find(
            (p) => p.name === item.name
          );

          if (product) {
            const currentStock =
              Number(product.stock) || 0;

            const qty =
              Number(item.qty) || 1;  

            const newStock =
              currentStock - qty;

            await updateProductStock(
              product.id,
              Math.max(newStock, 0)
            );
          }
        }
      }

      if (newStatus === "Diproses") {

        await verifyPayment(order.id);

      }

      else if (newStatus === "Selesai") {

        await completeOrder(order.id);

      }

      else {

        await updateOrderStatus(
          order.id,
          newStatus
        );

      }

      setSelectedOrder((prev) => ({
        ...prev,
        status: newStatus,

        paymentStatus:
          newStatus === "Diproses"
            ? "Lunas"
            : prev.paymentStatus,
      }));

      await fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.customer
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.id
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchStatus =
      selectedStatus === "Semua Status" ||
      order.status === selectedStatus;

    return matchSearch && matchStatus;
  });

  const sortedOrders = [...filteredOrders];
  if (sortBy === "Terbaru") {
    sortedOrders.sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
    );
  }

  if (sortBy === "Terlama") {
    sortedOrders.sort(
      (a, b) =>
        (a.createdAt?.seconds || 0) -
        (b.createdAt?.seconds || 0)
    );
  }

  if (sortBy === "Total Terbesar") {
    sortedOrders.sort(
      (a, b) =>
        Number(b.total) - Number(a.total)
    );
  }

  if (sortBy === "Total Terkecil") {
    sortedOrders.sort(
      (a, b) =>
        Number(a.total) - Number(b.total)
    );
  }

  const indexOfLastOrder =
    currentPage * ORDERS_PER_PAGE;

  const indexOfFirstOrder =
    indexOfLastOrder - ORDERS_PER_PAGE;

  const currentOrders =
    sortedOrders.slice(
      indexOfFirstOrder,
      indexOfLastOrder
    );

  const totalPages = Math.ceil(
    sortedOrders.length /
      ORDERS_PER_PAGE
  );

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <span className="orders-label">Pesanan</span>
          <h1>Manajemen Pesanan</h1>
          <p>Kelola pesanan pelanggan dan status pengiriman.</p>
        </div>
      </div>

      <div className="orders-toolbar">
        <div className="orders-search">
          <Search size={20} />
          <input placeholder="Cari pesanan..." value={searchTerm} onChange={(e)=> setSearchTerm(e.target.value)} />
        </div>

        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
          <option>Semua Status</option>
          {statusOptions.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option>Terbaru</option>
          <option>Terlama</option>
          <option>Total Terbesar</option>
          <option>Total Terkecil</option>
        </select>
      </div>

      <section className="orders-card">
        <div className="orders-table-head">
          <span>ID Pesanan</span>
          <span>Pelanggan</span>
          <span>Tanggal</span>
          <span>Total</span>
          <span>Status</span>
          <span>Aksi</span>
        </div>

        {currentOrders.map((order) => (
          <div className="orders-table-row" key={order.id}>
            <span>{order.id}</span>
            <span>{order.customer}</span>
            <span>{order.date}</span>
            <span> Rp {Number(order.total).toLocaleString("id-ID")} </span>

            <span className={`order-status ${order.status .toLowerCase() .replace(/\s+/g, "-")}`}>
              {order.status}
            </span>

            <button
              className="view-order-btn"
              type="button"
              onClick={() => setSelectedOrder(order)}
            >
              <Eye size={16} />
            </button>
          </div>
        ))}
      </section>
      <div className="orders-pagination">
        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((prev) => prev - 1)
          }
        >
          Prev
        </button>

        {Array.from(
          { length: totalPages },
          (_, index) => (
            <button
              key={index}
              className={
                currentPage === index + 1
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCurrentPage(index + 1)
              }
            >
              {index + 1}
            </button>
          )
        )}

        <button
          disabled={
            currentPage === totalPages
          }
          onClick={() =>
            setCurrentPage((prev) => prev + 1)
          }
        >
          Next
        </button>
      </div>
      {selectedOrder && (
        <div className="order-modal-overlay">
          <div className="order-modal">
            <div className="order-modal-header">
              <div>
                <h2>Detail Pesanan</h2>
                <p>{selectedOrder.id}</p>
              </div>

              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="order-detail-grid">
              <div>
                <span>Nama Pelanggan</span>
                <strong>{selectedOrder.customer}</strong>
              </div>

              <div>
                <span>Nomor HP</span>
                <strong>{selectedOrder.phone}</strong>
              </div>

              <div>
                <span>Alamat</span>
                <strong>{selectedOrder.address}</strong>
              </div>

              <div>
                <span>Total Pembayaran</span>
                <strong> Rp {Number(selectedOrder.total).toLocaleString("id-ID")} </strong>
              </div>
            </div>

            <div className="ordered-items">
              <h3>Produk Dipesan</h3>

              {selectedOrder.items.map((item, index) => (
                <div className="ordered-item" key={index}>
                  <PackageCheck size={18} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>

            <div className="invoice-box">
              <div className="invoice-header">
                <div>
                  <h3>Invoice Pesanan</h3>
                  <p>Toko Kelontong Mas Novi</p>
                </div>

                <span>{selectedOrder.id}</span>
              </div>

              <div className="invoice-info">
                <div>
                  <span>Nama Pelanggan</span>
                  <strong>{selectedOrder.customer}</strong>
                </div>

                <div>
                  <span>No. HP</span>
                  <strong>{selectedOrder.phone}</strong>
                </div>

                <div>
                  <span>Alamat Pengiriman</span>
                  <strong>{selectedOrder.address}</strong>
                </div>

                <div>
                  <span>Status Pesanan</span>
                  <strong>{selectedOrder.status}</strong>
                </div>
              </div>

              <div className="invoice-products">
                <h4>Rincian Produk</h4>
                {selectedOrder?.items?.map((item, index) => (
                  <div className="invoice-product-row" key={index}>
                    <span>{item.name}</span>

                    <b>
                      Rp {Number(item.price).toLocaleString("id-ID")}
                    </b>
                  </div>
                ))}
              </div>

              <div className="invoice-total">
                <div>
                  <span>Subtotal</span>
                  <b> Rp{" "} {Number(selectedOrder.subtotal || 0).toLocaleString("id-ID")}</b>
                </div>

                <div>
                  <span>Ongkir</span>
                  <b>Rp{" "} {Number(selectedOrder.shipping || 0 ).toLocaleString("id-ID")}</b>
                </div>

                <div className="grand-total">
                  <span>Total Pembayaran</span>
                  <strong> Rp {Number(selectedOrder.total).toLocaleString("id-ID")} </strong>
                </div>
              </div>

              <button className="print-invoice-btn" type="button" onClick={printInvoice}>
                <Printer size={17} />
                Cetak Invoice
              </button>
            </div>

            <div className="order-progress">
              <div
                className={
                  !["Dibatalkan","Expired"].includes(selectedOrder.status)
                    ? "progress-step active"
                    : "progress-step"
                }
              >
                <Clock3 size={18} />
                Pending
              </div>

              <div
                className={
                  ["Diproses", "Dikirim", "Selesai"].includes(
                    selectedOrder.status
                  )
                    ? "progress-step active"
                    : "progress-step"
                }
              >
                <PackageCheck size={18} />
                Diproses
              </div>

              <div
                className={
                  ["Dikirim", "Selesai"].includes(selectedOrder.status)
                    ? "progress-step active"
                    : "progress-step"
                }
              >
                <Truck size={18} />
                Dikirim
              </div>

              <div
                className={
                  selectedOrder.status === "Selesai"
                    ? "progress-step active"
                    : "progress-step"
                }
              >
                <CheckCircle size={18} />
                Selesai
              </div>
            </div>

            <div className="status-actions">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={
                    selectedOrder.status === status ? "active-status-btn" : ""
                  }
                  onClick={() =>
                    handleStatusChange(
                      selectedOrder,
                      status
                    )
                  }
                >
                  {status === "Dibatalkan" && <XCircle size={16} />}
                  {status}
                </button>
              ))}
            </div>

            <button
              className="close-order-modal"
              type="button"
              onClick={() => setSelectedOrder(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderList;