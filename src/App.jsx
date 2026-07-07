import { Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import LandingPage from "./components/LandingPage/LandingPage";

import ProductCatalog from "./pages/ProductCatalog/ProductCatalog";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import DetailPembayaran from "./pages/DetailPembayaran/DetailPembayaran";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";
import OrderProcessing from "./pages/OrderProcessing/OrderProcessing";
import UserLogin from "./pages/UserLogin/UserLogin";
import MyOrders from "./pages/MyOrders/MyOrders";
import UserRegister from "./pages/User/UserRegister";
import Profile from "./pages/User/Profile";
import About from "./pages/About/About";
import TrackOrder from "./pages/TrackOrder/TrackOrder";

import AdminLayout from "./admin/AdminLayout/AdminLayout";
import LoginAdmin from "./admin/LoginAdmin/LoginAdmin";
import AdminDashboard from "./admin/Dashboard/AdminDashboard";
import ProductList from "./admin/Products/ProductList";
import ProductForm from "./admin/Products/ProductForm";
import CategoryList from "./admin/Categories/CategoryList";
import OrderList from "./admin/Orders/OrderList";
import ReportList from "./admin/Reports/ReportList";
import CustomerList from "./admin/Customers/CustomerList";
import StoreSettings from "./admin/Settings/StoreSettings";
import PromoList from "./admin/Promos/PromoList";

import ProtectedRoute from "./routes/ProtectedRoute";

function UserLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "12px",
            background: "#15803d",
            color: "#fff",
            fontWeight: "600",
            padding: "14px 18px",
          },
        }}
      />
      <Routes>
        {/* USER AREA */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-detail/:id" element={<DetailPembayaran />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-processing" element={<OrderProcessing />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/track-order" element={<TrackOrder />} />
        </Route>

        {/* ADMIN AREA */}
        <Route path="/admin/login" element={<LoginAdmin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="reports" element={<ReportList />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="settings" element={<StoreSettings />} />
          <Route path="promos" element={<PromoList />} />
        </Route>
      </Routes>

      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            background: "#ffffff",
            color: "#1f2937",
            boxShadow: "0 10px 30px rgba(0,0,0,.15)",
            fontWeight: "600",
          },
          success: {
            iconTheme: {
              primary: "#16a34a",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#dc2626",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </>
  );
}

export default App;