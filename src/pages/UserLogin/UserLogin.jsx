import { useState } from "react";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../../firebase/firebase";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserRound,
  ShoppingBag,
} from "lucide-react";
import "./UserLogin.css";
import toast from "react-hot-toast";

function UserLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      toast.success(`Selamat datang kembali, ${auth.currentUser.displayName || "Pelanggan"} 👋`);
      navigate("/");

    } catch (error) {

      console.error(error);

      switch (error.code) {

        case "auth/user-not-found":
          toast.error("Email belum terdaftar.");
          break;

        case "auth/wrong-password":
          toast.error("Password salah.");
          break;

        case "auth/invalid-email":
          toast.error("Format email tidak valid.");
          break;

        case "auth/invalid-credential":
          toast.error("Email atau password salah.");
          break;

        default:
          toast.error("Login gagal.");
      }
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = () => {
    toast("👋 Melanjutkan sebagai tamu.");
    navigate("/");
  };

  return (
    <main className="user-login-page">
      <section className="user-login-card">
        <div className="user-login-left">
          <div className="user-login-brand">
            <div className="user-login-brand-icon">
              <ShoppingBag size={24} />
            </div>

            <div>
              <h2>Toko Kelontong Mas Novi</h2>
              <p>Belanja kebutuhan harian lebih mudah</p>
            </div>
          </div>

          <div className="user-login-heading">
            <span>Login Pelanggan</span>
            <h1>Masuk untuk pengalaman belanja lebih cepat</h1>
            <p>
              Login bersifat opsional. Kamu tetap bisa melanjutkan pesanan
              sebagai tamu tanpa membuat akun.
            </p>
          </div>

          <form className="user-login-form" onSubmit={handleLogin}>
            <div className="user-form-group">
              <label>Email</label>

              <div className="user-input-box">
                <Mail size={20} />  
                <input
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="user-form-group">
              <label>Password</label>

              <div className="user-input-box">
                <Lock size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="user-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              className="user-login-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sedang Masuk..." : "Masuk Sekarang"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="user-login-register-link">
            Belum punya akun?
            {" "}
            <Link to="/register">
              Daftar sekarang
            </Link>
          </p>
          <div className="guest-box">
            <div>
              <UserRound size={22} />
              <span>Lanjut tanpa akun</span>
            </div>

            <button type="button" onClick={continueAsGuest}>
              Lanjut sebagai tamu
            </button>
          </div>
        </div>

        <div className="user-login-right">
          <div className="user-login-overlay">
            <span>Guest Checkout</span>
            <h2>Belanja cepat tanpa wajib login</h2>
            <p>
              Pelanggan dapat membeli produk langsung dengan mengisi nama,
              nomor WhatsApp, dan alamat pengiriman pada halaman checkout.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default UserLogin;