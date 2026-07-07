import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../../firebase/firebase";

import "./UserRegister.css";
import toast from "react-hot-toast";

function UserRegister() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama lengkap wajib diisi.");
      return;
    }

    if (!email.trim()) {
      toast.error("Email wajib diisi.");
      return;
    }

    if (!password.trim()) {
      toast.error("Password wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak sama.");
      return;
    }

    try {
      setLoading(true);

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await updateProfile(
        credential.user,
        {
          displayName: name,
        }
      );

      await setDoc(
        doc(db, "users", credential.user.uid),
        {
          uid: credential.user.uid,
          name,
          email,
          phone: "",
          address: "",
          role: "customer",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      toast.success("Akun berhasil dibuat 🎉");
      toast.success("Selamat datang, " + name + " 👋");
      setTimeout(() => {navigate("/");}, 1200);
    } catch (error) {

      console.error(error);

      switch (error.code) {

        case "auth/email-already-in-use":
          toast.error("Email sudah digunakan.");
          break;

        case "auth/weak-password":
          toast.error("Password minimal 6 karakter.");
          break;

        case "auth/invalid-email":
          toast.error("Format email tidak valid.");
          break;

        default:
          toast.error("Registrasi gagal.");
      }

    } finally {

      setLoading(false);

    }
  };

  return (
    <main className="user-register-page">
      <div className="user-register-card">

        <h1>Daftar Akun</h1>

        <p>Buat akun agar belanja lebih cepat.</p>

        <form onSubmit={handleRegister}>

          <div className="user-register-form-group">

            <label>Nama Lengkap</label>

            <div className="user-register-input-box">

              <User size={20}/>

              <input
                type="text"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                required
              />

            </div>

          </div>

          <div className="user-register-form-group">

            <label>Email</label>

            <div className="user-register-input-box">

              <Mail size={20}/>

              <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />

            </div>

          </div>

          <div className="user-register-form-group">

            <label>Password</label>

            <div className="user-register-input-box">

              <Lock size={20}/>

              <input
                type={showPassword ? "text":"password"}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={()=>setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>

            </div>

          </div>

          <div className="user-register-form-group">

            <label>Konfirmasi Password</label>

            <div className="user-register-input-box">

              <Lock size={20}/>

              <input
                type={showPassword ? "text":"password"}
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            className="user-register-btn"
            disabled={loading}
          >

            {loading
              ? "Mendaftarkan..."
              : "Daftar"}

            {!loading && (
              <ArrowRight size={18}/>
            )}

          </button>

        </form>

        <p className="user-register-login-link">

          Sudah punya akun?

          <Link to="/login">

            Masuk

          </Link>

        </p>

      </div>
    </main>
  );
}

export default UserRegister;