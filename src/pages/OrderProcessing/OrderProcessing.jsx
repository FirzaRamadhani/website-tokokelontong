import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  PackageCheck,
  CreditCard,
  Package,
  Truck,
  Star,
  Home,
} from "lucide-react";
import "./OrderProcessing.css";

const steps = [
  {
    title: "Pesanan diterima",
    desc: "Pesanan Anda berhasil masuk ke sistem.",
    icon: PackageCheck,
    status: "done",
  },
  {
    title: "Pembayaran terverifikasi",
    desc: "Pembayaran telah berhasil dikonfirmasi.",
    icon: CreditCard,
    status: "done",
  },
  {
    title: "Sedang disiapkan",
    desc: "Pesanan sedang diproses oleh pihak toko.",
    icon: Package,
    status: "active",
  },
  {
    title: "Menunggu pengiriman",
    desc: "Pesanan akan segera dikirim ke alamat tujuan.",
    icon: Truck,
    status: "pending",
  },
  {
    title: "Pesanan selesai",
    desc: "Pesanan telah diterima oleh pelanggan.",
    icon: Star,
    status: "pending",
  },
];

function OrderProcessing() {
  const navigate = useNavigate();

  return (
    <main className="processing-page">
      <section className="processing-card">
        <div className="success-icon">
          <CheckCircle size={76} />
        </div>

        <span className="success-label">Pembayaran Berhasil</span>

        <h1>Pesanan Sedang Diproses</h1>

        <p className="processing-desc">
          Terima kasih telah melakukan pembayaran. Saat ini pesanan Anda sedang
          disiapkan oleh Toko Kelontong Mas Novi.
        </p>

        <div className="order-box">
          <div>
            <span>ID Pesanan</span>
            <strong>#INV20260001</strong>
          </div>

          <div>
            <span>Estimasi Diproses</span>
            <strong>± 30 Menit</strong>
          </div>
        </div>

        <div className="timeline">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div className={`timeline-item ${step.status}`} key={index}>
                <div className="timeline-icon">
                  <Icon size={22} />
                </div>

                <div className="timeline-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="processing-actions">
          <button onClick={() => navigate("/")}>
            <Home size={18} />
            Kembali ke Beranda
          </button>

          <button className="outline" onClick={() => navigate("/products")}>
            Belanja Lagi
          </button>
        </div>
      </section>
    </main>
  );
}

export default OrderProcessing;