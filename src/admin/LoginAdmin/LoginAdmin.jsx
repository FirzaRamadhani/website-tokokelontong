import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import {
  auth,
  db,
} from "../../firebase/firebase";

import "./LoginAdmin.css";
import toast from "react-hot-toast";

function LoginAdmin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        newErrors.email = "Format email tidak valid";
      }
    }

    if (!password.trim()) {
      newErrors.password = "Password wajib diisi";
    } else if (password.length < 6) {
      newErrors.password =
        "Password minimal 6 karakter";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Lengkapi data login terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const credential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      const adminDoc =
        await getDoc(
          doc(
            db,
            "admins",
            credential.user.uid
          )
        );
      if (!adminDoc.exists()) {
        await signOut(auth);
        toast.error("Akun ini bukan administrator.");
        return;
      }
      toast.success("Selamat datang Admin 👋");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="login-form-side">
          <div className="login-brand">
            <div className="login-brand-icon">
              <ShieldCheck size={26} />
            </div>

            <div>
              <h2>Toko Kelontong Mas Novi</h2>
              <p>Admin Panel</p>
            </div>
          </div>

          <div className="login-heading">
            <h1>Selamat Datang Kembali</h1>

            <p>
              Masuk ke dashboard admin untuk mengelola produk,
              kategori, pesanan pelanggan, promo, dan laporan.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="admin-login-form"
          >
            <div className="login-form-group">
              <label>Email Admin</label>

              <div className="login-input-box">
                <Mail size={20} />

                <input
                  className={errors.email ? "input-error" : ""}
                  type="email"
                  placeholder="admin@tokomasnovi.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (errors.email) {
                      setErrors({
                        ...errors,
                        email: "",
                      });
                    }
                  }}
                />
              </div>
              {errors.email && (
                <small className="error-text">
                  {errors.email}
                </small>
              )}
            </div>

            <div className="login-form-group">
              <div className="login-label-row">
                <label>Password</label>

                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={() =>
                    toast("📞 Hubungi Administrator untuk reset password.")
                  }
                >
                  Lupa Password?
                </button>
              </div>

              <div className="login-input-box">
                <Lock size={20} />

                <input
                  className={errors.password ? "input-error" : ""}
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    if (errors.password) {
                      setErrors({
                        ...errors,
                        password: "",
                      });
                    }
                  }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.password && (
                <small className="error-text">
                  {errors.password}
                </small>
              )}
            </div>

            <label className="remember-row">
              <input type="checkbox" />

              <span>
                Ingat saya untuk sesi berikutnya
              </span>
            </label>
            
            <button
              className="login-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "Masuk Sekarang"}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>
        </div>

        <div className="login-image-side">
          <div className="image-overlay">
            <span>Admin Dashboard</span>

            <h2>
              Kelola Kesegaran Setiap Hari
            </h2>

            <p>
              Dashboard toko kelontong yang
              membantu admin memantau produk,
              pesanan, kategori, promo, dan
              laporan secara efisien.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginAdmin;