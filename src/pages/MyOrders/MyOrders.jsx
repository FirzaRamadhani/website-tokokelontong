import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PackageCheck,
  Truck,
  Clock3,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { subscribeOrdersByUser }from "../../services/orderService";
import { auth } from "../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import "./MyOrders.css";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  useEffect(() => {
    let unsubscribeOrders = () => {};

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribeOrders();

        if (!user) {
          setOrders([]);
          return;
        }

        unsubscribeOrders = subscribeOrdersByUser(
          user.uid,
          (orders) => {
            setOrders(orders);
          }
        );
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeAuth();
    };
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock3 size={18} />;

      case "Menunggu Verifikasi":
        return <Clock3 size={18} />;

      case "Diproses":
        return <PackageCheck size={18} />;

      case "Dikirim":
        return <Truck size={18} />;

      case "Selesai":
        return <CheckCircle size={18} />;

      case "Dibatalkan":
        return <XCircle size={18} />;

      case "Expired":
        return <XCircle size={18} />;
        
      default:
        return <Clock3 size={18} />;
    }
  };

  return (
    <main className="my-orders-page">
      <div className="my-orders-header">
        <h1>Pesanan Saya</h1>

        <button
          className="shop-again-btn"
          onClick={() => navigate("/products")}
        >
          Belanja Lagi
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <PackageCheck size={70} color="#15803d"/>
          <h2>
              Belum ada pesanan
          </h2>
          <p>
              Pesanan yang telah dibuat
              akan muncul di halaman ini.
          </p>
          <button
              onClick={()=>
                  navigate("/products")
              }
          >
              Mulai Belanja
          </button>
        </div>
      ) : (
        orders.map((order) => (
          <div
            className="order-card"
            key={order.id}
          >
            <div className="order-card-header">
              <div>
                <h3>Order # {order.id.slice(0,8).toUpperCase()}</h3>
                <p>{order.date}</p>
              </div>

              <span
                className={`status-badge ${order.status.replace(/\s/g, "-")}`}
              >
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </div>

            <div className="order-items">
              {order.items?.map(
                (item, index) => (
                  <div
                    className="order-item"
                    key={index}
                  >
                    <span>
                      {item.name}
                    </span>

                    <b>
                      x
                      {item.qty ||
                        item.quantity ||
                        1}
                    </b>
                  </div>
                )
              )}
            </div>

            <div className="order-total">
              <span>Total</span>

              <strong>
                Rp{" "}
                {Number(
                  order.total
                ).toLocaleString(
                  "id-ID"
                )}
              </strong>
            </div>
          </div>
        ))
      )}
    </main>
  );
}

export default MyOrders;