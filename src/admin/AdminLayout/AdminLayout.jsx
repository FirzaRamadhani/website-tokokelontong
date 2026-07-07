import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Store,
  Users,
  BadgePercent,
  Bell,
  Menu,
} from "lucide-react";
import "./AdminLayout.css";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useState, useEffect } from "react";
import { getNotifications } from "../../services/notificationService";

function AdminLayout() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    loadNotifications();

    const handleResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobileView(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnread(data.length);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      navigate("/admin/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleNavClick = () => {
    if (isMobileView) {
      setSidebarOpen(false);
    }
  };

  return (
    <main className="admin-layout">
      {isMobileView && sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="admin-brand">
            <div className="admin-brand-icon">
              <Store size={24} />
            </div>

            <div className="admin-brand-text">
              <h2>Toko Kelontong<br />Mas Novi</h2>
              <p>Admin Panel</p>
            </div>
          </div>
          <nav className="admin-nav">
            <NavLink to="/admin/dashboard" onClick={handleNavClick}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>

            <NavLink to="/admin/products" onClick={handleNavClick}>
              <Package size={20} />
              Produk
            </NavLink>

            <NavLink to="/admin/categories" onClick={handleNavClick}>
              <Tags size={20} />
              Kategori
            </NavLink>

            <NavLink to="/admin/orders" onClick={handleNavClick}>
              <ClipboardList size={20} />
              Pesanan
            </NavLink>

            <NavLink to="/admin/reports" onClick={handleNavClick}>
              <BarChart3 size={20} />
              Laporan
            </NavLink>

            <NavLink to="/admin/customers" onClick={handleNavClick}>
              <Users size={20} />
              Pelanggan
            </NavLink>

            <NavLink to="/admin/promos" onClick={handleNavClick}>
              <BadgePercent size={20} />
              Promo
            </NavLink>

            <NavLink to="/admin/settings" onClick={handleNavClick}>
              <Settings size={20} />
              Pengaturan
            </NavLink>
          </nav>
        </div>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      <section className="admin-content">
        <div className="admin-topbar">
          {isMobileView && (
            <button
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Buka menu admin"
            >
              <Menu size={22} />
            </button>
          )}

          <div className="topbar-actions">
            <button
              className="notification-btn"
              onClick={() => {setShowNotification(!showNotification);
                  if(!showNotification){
                      setUnread(0);
                  }

              }}
            >
              <Bell size={22} />

              {unread > 0 && (
                <span className="notification-badge">
                  {unread}
                </span>
              )}
            </button>

            {showNotification && (
              <div className="notification-dropdown">

                <h3>Notifikasi</h3>

                {notifications.length === 0 ? (
                  <p className="empty-notification">
                    Tidak ada notifikasi.
                  </p>
                ) : (
                  notifications.map((item, index) => (
                    <div
                      key={index}
                      className={`notification-item ${item.color}`}
                    >
                      <strong>{item.title}</strong>

                      <p>{item.message}</p>

                      <small>{item.time}</small>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <Outlet />
      </section>
    </main>
  );
}

export default AdminLayout;