import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { getProducts } from "../../services/productService";
import { getPromos } from "../../services/promoService";
import {
  Box,
  Tag,
  Truck,
  Headphones,
  Home,
  Coffee,
  Cookie,
  BriefcaseBusiness,
  Gift,
  MoreHorizontal,
  ShoppingCart,
  Smartphone,
} from "lucide-react";
import "./LandingPage.css";

const categories = [
  { icon: Home, name: "Sembako" },
  { icon: Coffee, name: "Minuman" },
  { icon: Cookie, name: "Makanan Ringan" },
  { icon: BriefcaseBusiness, name: "Kebutuhan Rumah" },
  { icon: Gift, name: "Perlengkapan" },
  { icon: MoreHorizontal, name: "Lainnya" },
];

function LandingPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await getProducts();
      const promosData = await getPromos();

      const mergedProducts = productsData.map((product) => {
        const promo = promosData.find(
          (p) =>
            p.productName === product.name &&
            p.status === "Aktif"
        );

        return {
          ...product,
          promoPrice: promo?.promoPrice || null,
          discount: promo?.discount || null,
        };
      });

      setProducts(mergedProducts.slice(0, 4));
    } catch (error) {
      console.error(error);
    }
  };

  const goToProducts = () => {
    navigate("/products");
  };

  const goToDetail = (id) => {
    navigate(`/products/${id}`);
  };

  return (
    <main className="landing-page" id="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Belanja Kebutuhan Harian Lebih Mudah</h1>

          <p>
            Tersedia berbagai kebutuhan sehari-hari dengan harga terjangkau
            dan kualitas terbaik. Belanja nyaman dan mudah dari rumah.
          </p>

          <button type="button" onClick={goToProducts}>
            Belanja Sekarang
          </button>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=700"
            alt="Grocery bag"
          />
        </div>
      </section>

      <section className="benefit-box">
        <div>
          <Box size={28} />
          <span>
            <b>Produk Lengkap</b>
            <p>Semua tersedia</p>
          </span>
        </div>

        <div>
          <Tag size={28} />
          <span>
            <b>Harga Terjangkau</b>
            <p>Hemat setiap hari</p>
          </span>
        </div>

        <div>
          <Truck size={30} />
          <span>
            <b>Pengiriman Cepat</b>
            <p>Sampai di hari sama</p>
          </span>
        </div>

        <div>
          <Headphones size={28} />
          <span>
            <b>Pelayanan Ramah</b>
            <p>Bantuan 24/7</p>
          </span>
        </div>
      </section>

      <section className="category-section" id="kategori">
        <div className="section-header">
          <div>
            <h2>Kategori Populer</h2>
            <p>Cari produk berdasarkan kategori favoritmu</p>
          </div>

          <button
            type="button"
            className="see-all-btn"
            onClick={goToProducts}
          >
            Lihat Semua ›
          </button>
        </div>

        <div className="category-grid">
          {categories.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                className="category-card"
                key={index}
                onClick={() => {
                  if (item.name === "Lainnya") {
                    navigate("/products");
                  } else {
                    navigate(
                      `/products?category=${encodeURIComponent(item.name)}`
                    );
                  }
                }}
              >
                <div>
                  <Icon size={34} />
                </div>
                <h4>{item.name}</h4>
              </div>
            );
          })}
        </div>
      </section>

      <section className="product-section" id="produk">
        <div className="section-header">
          <div>
            <h2>Produk Terlaris</h2>
            <p>Pilihan terbaik untuk stok dapur Anda</p>
          </div>

          <button
            type="button"
            className="see-all-btn"
            onClick={goToProducts}
          >
            Lihat Semua ›
          </button>
        </div>

        <div className="product-grid">
          {products.map((item) => (
            <div
              className="product-card"
              key={item.id}
              onClick={() => goToDetail(item.id)}
            >
              <div className="product-image">
                {item.discount ? (
                  <span>PROMO</span>
                ) : (
                  item.badge && <span>{item.badge}</span>
                )}
                <img src={item.imageUrl || item.image} alt={item.name} />
              </div>

              <p className="product-category">{item.category}</p>
              <h3>{item.name}</h3>
              {item.promoPrice ? (
                <div className="promo-price-box">
                  <small>
                    Rp {Number(item.price).toLocaleString("id-ID")}
                  </small>

                  <h2>
                    Rp {Number(item.promoPrice).toLocaleString("id-ID")}
                  </h2>

                  <span>Diskon {item.discount}%</span>
                </div>
              ) : (
                <h2>
                  Rp {Number(item.price).toLocaleString("id-ID")}
                </h2>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/cart");
                }}
              >
                <ShoppingCart size={18} />
                Keranjang
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default LandingPage;