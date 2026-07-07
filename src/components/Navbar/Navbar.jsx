import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import "./Navbar.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [isCustomer, setIsCustomer] = useState(false);

  useEffect(() => {

    const updateCart = () => {

      const cart =
        JSON.parse(localStorage.getItem("cart")) || [];

      const totalQty = cart.reduce(
        (total, item) =>
          total + Number(item.qty || 1),
        0
      );

      setCartCount(totalQty);
    };

    updateCart();

    window.addEventListener(
      "cartUpdated",
      updateCart
    );

    return () =>
      window.removeEventListener(
        "cartUpdated",
        updateCart
      );

  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        if (!currentUser) {
          setIsCustomer(false);
          return;
        }
        const customerDoc = await getDoc(
          doc(
            db,
            "users",
            currentUser.uid
          )
        );
        setIsCustomer(customerDoc.exists());
      }
    );
    return () => unsubscribe();
  }, []);

  const handleUserClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const adminSnap = await getDoc(
        doc(db, "admins", user.uid)
      );
      if (adminSnap.exists()) {
        navigate("/admin/dashboard");
        return;
      }
      const customerSnap = await getDoc(
        doc(db, "users", user.uid)
      );
      if (customerSnap.exists()) {
        navigate("/profile");
        return;
      }
      navigate("/login");
    } catch (error) {
      console.error(error);
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        Toko Kelontong Mas Novi
      </Link>

      <div className="navbar-menu">
        <Link to="/">Beranda</Link>
        <Link to="/products">Produk</Link>
        <Link to="/#kategori">Kategori</Link>
        <Link to="/track-order"> Lacak Pesanan</Link>
      </div>

      <div className="navbar-icons">
        <button
          className="icon-btn"
          type="button"
          onClick={() => navigate("/products?focus=search")}
        >
          <Search size={20} />
        </button>

        <button
          className="icon-btn cart-icon"
          type="button"
          onClick={() => navigate("/cart")}
        >
          <ShoppingCart size={20} />

          {cartCount > 0 && (
            <span className="cart-badge">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>
        <button
          className="icon-btn"
          type="button"
          onClick={handleUserClick}
        >
          <UserCircle size={22} />

          {isCustomer && (<span className="user-dot"></span>)}
        </button>
        <button
          className="icon-btn hamburger-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`mobile-menu ${isOpen ? "active" : ""}`}>
        <Link to="/" onClick={closeMenu}>
          Beranda
        </Link>

        <Link to="/products" onClick={closeMenu}>
          Produk
        </Link>

        <a href="#kategori" onClick={closeMenu}>
          Kategori
        </a>

        <Link to="/track-order" onClick={closeMenu}>
          Lacak Pesanan
        </Link>

        <Link to="/profile" onClick={closeMenu}>
          Profil
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;