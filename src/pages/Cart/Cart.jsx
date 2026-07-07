import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Trash2,
  Minus,
  Plus,
  Truck,
  Store,
  Landmark,
  QrCode,
  HandCoins,
} from "lucide-react";
import "./Cart.css";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("bank");

  useEffect(() => {
    const cart =
      JSON.parse(localStorage.getItem("cart")) || [];

    setCartItems(cart);
  }, []);

  const increaseQty = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id
        ? { ...item, qty: item.qty + 1 }
        : item
    );

    setCartItems(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const decreaseQty = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id && item.qty > 1
        ? { ...item, qty: item.qty - 1 }
        : item
    );

    setCartItems(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(
      (item) => item.id !== id
    );

    setCartItems(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const shippingCost =
    deliveryMethod === "pickup"
      ? 0
      : 10000;

  const total = subtotal + shippingCost;

  return (
    <main className="cart-page">
      <div className="cart-header">
        <button onClick={() => navigate("/products")}>
          <ChevronLeft size={20} />
          Kembali Belanja
        </button>

        <h1>Keranjang Belanja</h1>
      </div>

      <section className="cart-layout">
        <div className="cart-table">
          <div className="cart-table-head">
            <span>Produk</span>
            <span>Harga</span>
            <span>Jumlah</span>
            <span>Subtotal</span>
            <span></span>
          </div>

          {cartItems.length === 0 && (
            <div className="empty-cart">
              <h2>Keranjang Kosong</h2>
              <p>
                Belum ada produk yang ditambahkan.
              </p>

              <button
                onClick={() => navigate("/products")}
              >
                Belanja Sekarang
              </button>
            </div>
          )}

          {cartItems.map((item) => (
            <div className="cart-row" key={item.id}>
              <div className="cart-product">
                <img src={item.imageUrl} alt={item.name} />

                <div>
                  <h3>{item.name}</h3>
                  <p>Kategori: {item.category}</p>
                </div>
              </div>

              <div className="cart-price">{formatRupiah(item.price)}</div>

              <div className="cart-qty">
                <button onClick={() => decreaseQty(item.id)}>
                  <Minus size={16} />
                </button>

                <span>{item.qty}</span>

                <button onClick={() => increaseQty(item.id)}>
                  <Plus size={16} />
                </button>
              </div>

              <div className="cart-subtotal">
                {formatRupiah(item.price * item.qty)}
              </div>

              <button
                className="delete-btn"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <aside className="order-summary">
          <h2>Ringkasan Pesanan</h2>

          <div className="summary-line">
            <span>Subtotal ({cartItems.length} item)</span>
            <b>{formatRupiah(subtotal)}</b>
          </div>

          <div className="summary-line">
            <span>Ongkos Kirim</span>
            <b>{formatRupiah(shippingCost)}</b>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatRupiah(total)}</strong>
          </div>
          <div className="summary-section">
            <h3>Metode Pengiriman</h3>

            <label
              className={
                deliveryMethod === "delivery"
                  ? "option-card active"
                  : "option-card"
              }
            >
              <Truck size={22} />

              <div>
                <b>Pesan Antar</b>
                <p>Estimasi ongkir: Rp 10.000</p>
              </div>

              <input
                type="radio"
                name="delivery"
                checked={deliveryMethod === "delivery"}
                onChange={() =>
                  setDeliveryMethod("delivery")
                }
              />
            </label>
            <label
              className={
                deliveryMethod === "pickup"
                  ? "option-card active"
                  : "option-card"
              }
            >
              <Store size={22} />

              <div>
                <b>Ambil di Tempat</b>
                <p>Gratis biaya layanan</p>
              </div>

              <input
                type="radio"
                name="delivery"
                checked={deliveryMethod === "pickup"}
                onChange={() =>
                  setDeliveryMethod("pickup")
                }
              />
            </label>
          </div>

          <div className="summary-section">
            <h3>Metode Pembayaran</h3>
            <label
              className={
                paymentMethod === "bank"
                  ? "option-card active small"
                  : "option-card small"
              }
            >
              <Landmark size={22} />

              <b>Transfer Bank</b>

              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "bank"}
                onChange={() =>
                  setPaymentMethod("bank")
                }
              />
            </label>
            <label
              className={
                paymentMethod === "qris"
                  ? "option-card active small"
                  : "option-card small"
              }
            >
              <QrCode size={22} />

              <b>QRIS</b>
              <p>GoPay, OVO, DANA, ShopeePay, dll</p>

              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "qris"}
                onChange={() =>
                  setPaymentMethod("qris")
                }
              />
            </label>

            <label
              className={
                paymentMethod === "cod"
                  ? "option-card active small"
                  : "option-card small"
              }
            >
              <HandCoins size={22} />

              <div>
                <b>Bayar di Tempat (COD)</b>
                <p>Pembayaran dilakukan saat pesanan diterima</p>
              </div>

              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "cod"}
                onChange={() =>
                  setPaymentMethod("cod")
                }
              />
            </label>
          </div>

          <button
            className="pay-btn"
            disabled={cartItems.length === 0}
            onClick={() => {
              localStorage.setItem(
                "checkoutOptions",
                JSON.stringify({
                  deliveryMethod,
                  paymentMethod,
                })
              );

              navigate("/checkout");
            }}
          >
            Lanjut ke Checkout
          </button>

          <button className="continue-btn" onClick={() => navigate("/products")}>
            Lanjut Belanja
          </button>
        </aside>
      </section>
    </main>
  );
}

export default Cart;