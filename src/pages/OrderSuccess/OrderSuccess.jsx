import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { auth } from "../../firebase/firebase";
import { useEffect, useState } from "react";
import "./OrderSuccess.css";

function OrderSuccess() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const savedOrder = JSON.parse(
      localStorage.getItem("lastOrder")
    );

    setOrder(savedOrder);
  }, []);

  if (!order) {
    return <div>Loading...</div>;
  } 

  return (
    <main className="success-page">
      <div className="success-card">

        <div className="checkmark-circle">
          <Check size={70} strokeWidth={4} />
        </div>

        <h1>Pembayaran Sedang Diverifikasi</h1>

        <p>
          Terima kasih. Bukti pembayaran Anda telah diterima dan sedang menunggu verifikasi admin. Kami akan segera memproses pesanan setelah pembayaran dikonfirmasi.
        </p>
        <div className="success-info">
          <p>
            Nama Pelanggan:
            <strong> {order.customer}</strong>
          </p>

          <p>
            Nomor HP:
            <strong> {order.phone}</strong>
          </p>
        </div>
        <div className="order-info">
          <span>ID Pesanan</span>
          <strong>
            {order.orderNumber}
          </strong>
        </div>

        <div className="order-info">
          <span>Total Pembayaran</span>
          <strong>
            Rp {Number(order.total).toLocaleString("id-ID")}
          </strong>
        </div>

        <div className="success-products">
          <h3>Produk Dipesan</h3>

          {order.items?.map((item, index) => (
            <div
              key={index}
              className="success-product-row"
            >
              <span>
                {item.name} x {item.qty}
              </span> 

              <b>
                Rp{" "}
                {(
                  Number(item.price) *
                  Number(item.qty)
                ).toLocaleString("id-ID")}
              </b>
            </div>
          ))}
        </div>

        <button
          className="success-btn"
          onClick={() => {
            if (auth.currentUser) {
              navigate("/my-orders");
            } else {
              navigate("/track-order");
            }
          }}
        >
          Lihat Status Pesanan
        </button>

      </div>
    </main>
  );
}

export default OrderSuccess;