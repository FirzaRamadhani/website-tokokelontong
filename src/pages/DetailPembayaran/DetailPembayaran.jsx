  import { useNavigate, useParams } from "react-router-dom";
  import {
    Copy,
    Clock,
    CheckCircle,
    CreditCard,
    Smartphone,
    QrCode,
    ArrowLeft,
  } from "lucide-react";
  import "./DetailPembayaran.css";
  import { useState, useEffect } from "react";  
  import {
    getOrderById,
    expireOrder,
    updatePaymentStatus,
  } from "../../services/orderService";
  import {getSettings,} from "../../services/settingsService";
  import "../../styles/loading.css";
  import toast from "react-hot-toast";

  function DetailPembayaran() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("atm");
    const [order, setOrder] = useState(null);
    const vaNumber = "8077081234567890";
    const { id } = useParams();
    const [timeLeft, setTimeLeft] = useState("");
    const [expired, setExpired] = useState(false);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [settings, setSettings] = useState(null);
    
    useEffect(() => {
      loadOrder();
    }, []);

    const loadOrder = async () => {
      try {
        setLoading(true);

        const data = await getOrderById(id);
        if (!data) {
          navigate("/products");
          return;
        }

        setOrder(data);
        const storeSettings = await getSettings();
        setSettings(storeSettings);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const handlePayment = async () => {
        const toastId = toast.loading(
            "Mengirim konfirmasi pembayaran..."
        );
        try {
            setPaymentLoading(true);
            await updatePaymentStatus(
                order.id,
                "Menunggu Verifikasi"
            );

            localStorage.removeItem("cart");
            window.dispatchEvent(
                new Event("cartUpdated")
            );

            toast.success(
                "Konfirmasi pembayaran berhasil dikirim.",
                {
                    id: toastId,
                }
            );

            localStorage.setItem(
              "lastOrder",
              JSON.stringify({
                id: order.id,
                orderNumber: order.orderNumber,
                customer: order.customer,
                phone: order.phone,
                total: order.total,
                items: order.items,
                paymentMethod: order.paymentMethod,
                deliveryMethod: order.deliveryMethod,
              })
            );
            navigate("/order-success");

        } catch (error) {
            console.error(error);
            toast.error(
                "Gagal mengirim konfirmasi pembayaran.",
                {
                    id: toastId,
                }
            );
        } finally {
            setPaymentLoading(false);
        }
    };

    useEffect(() => {
      if (!order?.createdAt) return;

      const interval = setInterval(async() => {
        const created =
          order.createdAt.seconds * 1000;

        const expiredTime =
          created + 15 * 60 * 1000;

        const now = Date.now();

        const diff = expiredTime - now;
        if (diff <= 0) {
            if (order.status === "Pending") {
                await expireOrder(order.id);
                setOrder(prev => ({
                    ...prev,
                    status: "Expired",
                }));
            }
            setExpired(true);
            setTimeLeft("00:00");
            clearInterval(interval);
            return;
        }
        const minutes = Math.floor(
          diff / 1000 / 60
        );

        const seconds = Math.floor(
          (diff / 1000) % 60
        );

        setTimeLeft(
          `${minutes
            .toString()
            .padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      }, 1000);

      return () => clearInterval(interval);
    }, [order]);

    if (loading) {
      return (
        <div className="page-loading">
          <div className="loader"></div>

          <p>Memuat Detail Pembayaran...</p>
        </div>
      );
    }

    if (!order) {
      return null;
    }

    const isBank = order.paymentMethod === "bank";
    const isQris = order.paymentMethod === "qris";
    const isCod = order.paymentMethod === "cod";

    return (
      <main className="payment-page">
        <button className="payment-back" onClick={() => navigate("/cart")}>
          <ArrowLeft size={18} />
          Kembali ke Keranjang
        </button>

        <section className="payment-alert">
          <CheckCircle size={22} />
          <div>
            <h3>Pesanan Berhasil Dibuat</h3>
            <p>Silakan selesaikan pembayaran sebelum batas waktu berakhir.</p>
          </div>
        </section>

        <section className="payment-layout">
          <div className="payment-left">
            <div className="payment-card order-number-card">
              <span>Nomor Pesanan</span>  
              <div className="order-number-box">

                <strong>
                  {order.orderNumber}
                </strong>

                <button
                  onClick={() => {

                    navigator.clipboard.writeText(
                      order.orderNumber
                    );

                    toast.success(
                      "Nomor pesanan berhasil disalin."
                    );

                  }}
                >
                  <Copy size={16} />
                  Salin
                </button>

              </div>

              <small>
                Simpan nomor pesanan ini untuk melacak status pesanan.
              </small>

            </div>
            <div className="payment-card total-card">
              <span>Total Pembayaran</span>
              <h1> Rp {Number(order.total).toLocaleString("id-ID")} </h1>

              <div className="payment-timer">
                <Clock size={18} />
                <p> Selesaikan dalam{" "} <b style={{ color: expired ? "#dc2626" : "#15803d", }} > {timeLeft} </b> </p>
              </div>
              <div className="payment-status">
                  <span>Status Pesanan</span>
                  <strong
                      className={order.status.toLowerCase()}
                  >
                      {order.status}
                  </strong>
              </div>
              {expired && (
                <div className="payment-expired">
                  <strong>Waktu pembayaran telah habis.</strong>
                  <p>
                    Pesanan telah kedaluwarsa. Silakan lakukan pemesanan kembali.
                  </p>
                </div>
              )}
            </div>
            <div className="payment-card">
              <h3>Ringkasan Pesanan</h3>

              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="payment-product-row"
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
            
            {isBank &&  (
              <div className="payment-card bank-card">
                <h2>Virtual Account BCA</h2>

                <div className="va-box">
                  <CreditCard size={22} />
                  <strong> {vaNumber.match(/.{1,4}/g).join(" ")} </strong>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(vaNumber);

                      toast.success("Nomor Virtual Account berhasil disalin.");
                    }}
                  >
                    <Copy size={16} />
                    Salin
                  </button>
                </div>
              </div>
            )}

            {isBank && (
              <div className="payment-card instruction-card">
                <div className="payment-tabs">
                  <button className={activeTab === "atm" ? "active" : ""} onClick={() => setActiveTab("atm")}>
                    ATM
                  </button>
                  <button className={activeTab === "mobile" ? "active" : ""} onClick={() => setActiveTab("mobile")}>
                    Mobile Banking
                  </button>
                  <button className={activeTab === "internet" ? "active" : ""} onClick={() => setActiveTab("internet")}>
                    Internet Banking
                  </button>
                </div>
                {activeTab === "atm" && (
                    <ol>
                        <li>Masukkan kartu ATM dan PIN Anda.</li>
                        <li>Pilih menu Transaksi Lainnya lalu Transfer.</li>
                        <li>Pilih ke Rekening BCA Virtual Account.</li>
                        <li>Masukkan nomor Virtual Account yang tersedia.</li>
                        <li>Pastikan nominal pembayaran sesuai total tagihan.</li>
                        <li>Ikuti instruksi sampai transaksi berhasil.</li>
                    </ol>
                )}
                {activeTab === "mobile" && (
                    <ol>
                        <li>Buka aplikasi Mobile Banking.</li>
                        <li>Login menggunakan akun Anda.</li>
                        <li>Pilih menu Transfer Virtual Account.</li>
                        <li>Masukkan nomor Virtual Account.</li>
                        <li>Periksa nominal pembayaran.</li>
                        <li>Masukkan PIN Mobile Banking.</li>
                        <li>Simpan bukti pembayaran.</li>
                    </ol>
                )}
                {activeTab === "internet" && (
                    <ol>
                        <li>Login ke layanan Internet Banking.</li>
                        <li>Pilih menu Transfer Dana.</li>
                        <li>Pilih Transfer Virtual Account.</li>
                        <li>Masukkan nomor Virtual Account.</li>
                        <li>Verifikasi detail pembayaran.</li>
                        <li>Masukkan OTP atau Token.</li>
                        <li>Konfirmasi transaksi.</li>
                    </ol>
                )}
              </div>
            )}

            <div className="payment-actions">
              <button
                className="primary-btn"
                disabled={
                  order.paymentMethod !== "cod" &&
                  (
                    expired ||
                    paymentLoading ||
                    order.status === "Expired" ||
                    order.status === "Menunggu Verifikasi"
                  )
                }
                onClick={() => {
                  if (order.paymentMethod === "cod") {
                    toast.success(
                      "Pesanan berhasil dibuat. Silakan lakukan pembayaran saat pesanan diterima."
                    );

                    navigate("/order-processing");

                    localStorage.setItem(
                      "lastOrder",
                      JSON.stringify({
                          id: order.id,
                          orderNumber: order.orderNumber,
                          customer: order.customer,
                          phone: order.phone,
                          total: order.total,
                          items: order.items,
                          paymentMethod: order.paymentMethod,
                          deliveryMethod: order.deliveryMethod,
                      })
                  );
                    return;
                  }

                  handlePayment();
                }}
              >
                {order.paymentMethod === "cod"
                  ? "Lanjut"
                  : paymentLoading
                  ? "Mengirim Konfirmasi..."
                  : expired
                  ? "Pembayaran Kedaluwarsa"
                  : order.status === "Menunggu Verifikasi"
                  ? "Menunggu Verifikasi Admin"
                  : "Saya Sudah Bayar"}
              </button>

              <button
                className="secondary-btn"
                onClick={() => navigate("/products")}
              >
                Kembali Belanja
              </button>
            </div>
          </div>

          <aside className="payment-right">
            {isQris && (
              <div className="qr-card">
                  <h2>Pembayaran QRIS</h2>
                  <div className="qr-box">
                      {settings?.qrisImage ? (
                        <img
                          src={settings.qrisImage}
                          alt="QRIS"
                        />
                      ) : (
                        <p>QRIS belum tersedia.</p>
                      )}
                  </div>
                  <p>
                      Scan QRIS menggunakan aplikasi pembayaran pilihan Anda.
                  </p>
                  <div className="wallet-list">
                      <span>GoPay</span>
                      <span>DANA</span>
                      <span>OVO</span>
                      <span>ShopeePay</span>
                      <span>Livin'</span>
                      <span>BRImo</span>
                  </div>
              </div>
              )}

              {isCod && (
                <div className="payment-card cod-card">
                <h2>Bayar di Tempat (COD)</h2>
                <p>
                Pembayaran dilakukan ketika pesanan diterima oleh pelanggan.
                Silakan siapkan uang sesuai total tagihan.
                </p>
                <div className="payment-status">
                <span>Total Tagihan</span>
                <strong>
                Rp {Number(order.total).toLocaleString("id-ID")}
                </strong>
                </div>
                </div>
              )}

            <div className="guide-card">
              <h2>
              {
              isBank
              ?
              "Cara Transfer"
              :
              isQris
              ?
              "Cara Pembayaran QRIS"
              :
              "Cara Pembayaran COD"
              }
              </h2>
              {
              isBank && (
                <>
                <div className="guide-step">
                <span>1</span>
                <p>Login ke Mobile Banking atau ATM.</p>
                </div>

                <div className="guide-step">
                <span>2</span>
                <p>Masukkan nomor Virtual Account.</p>
                </div>

                <div className="guide-step">
                <span>3</span>
                <p>Selesaikan pembayaran.</p>
                </div>
                </>
              )
              }
              {
              isQris && (
                <>
                <div className="guide-step">
                <span>1</span>
                <p>Buka aplikasi pembayaran.</p>
                </div>

                <div className="guide-step">
                <span>2</span>
                <p>Scan QRIS yang tersedia.</p>
                </div>

                <div className="guide-step">
                <span>3</span>
                <p>Konfirmasi pembayaran.</p>
                </div>
                </>
              )
              }

              {
              isCod && (
                <>
                <div className="guide-step">
                <span>1</span>
                <p>Admin memproses pesanan Anda.</p>
                </div>

                <div className="guide-step">
                <span>2</span>
                <p>Kurir menghubungi pelanggan.</p>
                </div>

                <div className="guide-step">
                <span>3</span>
                <p>Lakukan pembayaran saat pesanan diterima.</p>
                </div>
                </>
              )
              }
              </div>
          </aside>
        </section>
      </main>
    );
  }

  export default DetailPembayaran;