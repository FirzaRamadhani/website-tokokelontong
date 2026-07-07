import { useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Truck, CreditCard, QrCode, HandCoins,  } from "lucide-react";
import "./Checkout.css";
import { useState, useEffect } from "react";
import { addOrder } from "../../services/orderService";
import { Timestamp } from "firebase/firestore";
import { getProductById } from "../../services/productService";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {updateDoc} from "firebase/firestore";
import toast from "react-hot-toast";

  function Checkout() {
    const navigate = useNavigate();
    const checkoutOptions = JSON.parse( localStorage.getItem("checkoutOptions") ) || {};
    const [customer, setCustomer] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");
    const [cartItems, setCartItems] = useState([]);
    const [deliveryMethod] = useState(
      checkoutOptions.deliveryMethod || "delivery"
    );

    const [paymentMethod] = useState(
      checkoutOptions.paymentMethod || "bank"
    );
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const savedCart =
        JSON.parse(localStorage.getItem("cart")) || [];

      setCartItems(savedCart);
    }, []);

    useEffect(() => {
      const unsubscribe =
        onAuthStateChanged(auth, async (user) => {

          if (!user) return;

          const snapshot =
            await getDoc(
              doc(db, "users", user.uid)
            );

          if (!snapshot.exists()) return;

          const data = snapshot.data();

          setCustomer(data.name || "");

          setPhone(data.phone || "");

          setAddress(data.address || "");

        });

      return () => unsubscribe();

    }, []);

    const subtotal = cartItems.reduce(
      (total, item) =>
        total + Number(item.price) * Number(item.qty),
      0
    );

    const shipping =
      deliveryMethod === "pickup"
        ? 0
        : 10000;

    const total = subtotal + shipping;

    const validateForm = () => {
      const newErrors = {};

      if (!customer.trim()) {
        newErrors.customer = "Nama lengkap wajib diisi";
      }

      if (!phone.trim()) {
        newErrors.phone = "Nomor WhatsApp wajib diisi";
      } else if (!/^08\d{8,13}$/.test(phone)) {
        newErrors.phone = "Nomor WhatsApp tidak valid";
      }

      if (!address.trim()) {
        newErrors.address = "Alamat lengkap wajib diisi";
      }

      setErrors(newErrors);

      return Object.keys(newErrors).length === 0;
    };

    const handleCreateOrder = async () => {
      if (!validateForm()) {
          toast.error(
              "Lengkapi data pemesan terlebih dahulu."
          );
          return;
      }
      if (cartItems.length === 0) {
        toast.error("Keranjang belanja masih kosong");
        return;
      }

      const toastId = toast.loading("Sedang membuat pesanan...");
      
      try {
        setLoading(true);

        for (const item of cartItems) {

          const latestProduct =
            await getProductById(item.id);

          if (!latestProduct) {
            toast.error(`${item.name} sudah tidak tersedia.`);
            return;
          }

          if (Number(item.qty) > Number(latestProduct.stock)) {
            toast.error(`Stok ${item.name} hanya tersisa ${latestProduct.stock}.`);
            return;
          }

        }
        const result = await addOrder({
            uid: auth.currentUser?.uid || null,
            customerEmail:
                auth.currentUser?.email || "",
            customer,
            phone,
            address,
            note,
            deliveryMethod,
            paymentMethod,
            items: cartItems,
            subtotal,
            shipping,
            total,
            status:"Pending",
            paymentStatus:"Belum Bayar",
            expiredAt: Timestamp.fromDate(
                new Date(
                    Date.now() + 15 * 60 * 1000
                )
            ),
        });
        localStorage.removeItem("cart");
        toast.dismiss(toastId);
        toast.success("Pesanan berhasil dibuat.");
        navigate(`/payment-detail/${result.id}`);
      } catch (error) {
          console.error(error);
          toast.dismiss(toastId);
          toast.error(
              "Gagal membuat pesanan."
          );
      } finally {
        setLoading(false);
      }
    };

    return (
      <main className="checkout-page">
        <div className="checkout-header">
          <button onClick={() => navigate("/cart")}>
            <ChevronLeft size={20} />
            Kembali ke Keranjang
          </button>

          <h1>Checkout Pesanan</h1>
        </div>

        <section className="checkout-layout">
          <div className="checkout-form">
            <div className="checkout-card">
              <h2>Data Pemesan</h2>

              <div className="form-grid">
                <div>
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    className={errors.customer ? "input-error" : ""}
                    value={customer}
                    onChange={(e) => {
                      setCustomer(e.target.value);

                      if (errors.customer) {
                        setErrors((prev) => ({
                          ...prev,
                          customer: "",
                        }));
                      }
                    }}
                  />
                  {errors.customer && (
                    <small className="error-text">
                      {errors.customer}
                    </small>
                  )}
                </div>

                <div>
                  <label>Nomor WhatsApp</label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    className={errors.phone ? "input-error" : ""}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);

                      if (errors.phone) {
                        setErrors((prev) => ({
                          ...prev,
                          phone: "",
                        }));
                      }
                    }}
                  />

                  {errors.phone && (
                    <small className="error-text">
                      {errors.phone}
                    </small>
                  )}
                </div>
              </div>

              <div>
                <label>Alamat Lengkap</label>
                <textarea
                  className={errors.address ? "input-error" : ""}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);

                    if (errors.address) {
                      setErrors((prev) => ({
                        ...prev,
                        address: "",
                      }));
                    }
                  }}
                />

                {errors.address && (
                  <small className="error-text">
                    {errors.address}
                  </small>
                )}
              </div>

              <div>
                <label>Catatan Pesanan</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: antar sore hari" />
              </div>
            </div>  
          </div>

          <aside className="checkout-summary">
            <h2>Ringkasan Belanja</h2>

            {cartItems.map((item) => (
              <div className="summary-product" key={item.id}>
                <span>
                  {item.name} x {item.qty}
                </span>

                <b>
                  Rp{" "}
                  {(item.price * item.qty).toLocaleString(
                    "id-ID"
                  )}
                </b>
              </div>
            ))}

            <div className="summary-line">
              <span>Subtotal</span>
              <b>Rp {subtotal.toLocaleString("id-ID")}</b>
            </div>

            <div className="summary-line">
              <span>Ongkir</span>
              <b>Rp {shipping.toLocaleString("id-ID")}</b>
            </div>

            <div className="summary-line">
                <span>Pengiriman</span>
                <b>
                    {deliveryMethod === "pickup"
                        ? "Ambil di Toko"
                        : "Pesan Antar"}
                </b>
            </div>

            <div className="summary-line">
              <span>Pembayaran</span>
                <b>
                  {paymentMethod === "bank"
                    ? "Transfer Bank"
                    : paymentMethod === "qris"
                    ? "QRIS"
                    : "COD"}
                </b>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong> Rp {total.toLocaleString("id-ID")}</strong>
            </div>

            <button onClick={handleCreateOrder} disabled={loading}>
                {loading
                    ? "Memproses Pesanan..."
                    : "Buat Pesanan"}
            </button>
          </aside>
        </section>
      </main>
    );
  }

  export default Checkout;