import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import {
  getProductById,
  getProducts,
} from "../../services/productService";
import { getPromos } from "../../services/promoService";
import { addToCart } from "../../utils/cartUtils";
import "./ProductDetail.css";
import toast from "react-hot-toast";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);

      const productData = await getProductById(id);

      const allProducts = await getProducts();

      setRelatedProducts(
        allProducts
          .filter(
            (item) => item.id !== productData.id
          )
          .slice(0, 4)
      );

      const promos = await getPromos();

      const promo = promos.find(
        (p) =>
          p.productName === productData.name &&
          p.status === "Aktif"
      );

      const finalProduct = {
        ...productData,
        promoPrice: promo?.promoPrice || null,
        discount: promo?.discount || null,
      };

      setProduct(finalProduct);

      setActiveImage(
        finalProduct.imageUrl || ""
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader"></div>

        <h3>Memuat Detail Produk...</h3>

        <p>Mohon tunggu sebentar.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-loading">
        <h3>Produk tidak ditemukan</h3>
      </div>
    );
  }

  return (
    <main className="detail-page">
      <button className="back-btn" onClick={() => navigate("/products")}>
        <ChevronLeft size={20} />
        Kembali ke Katalog
      </button>

      <section className="detail-container">
        <div className="detail-image-box">
          <img src={activeImage || product.imageUrl} alt={product.name} />
          <div className="thumbnail-row">
            <button className="thumbnail active">
              <img
                src={product.imageUrl}
                alt={product.name}
              />
            </button>
          </div>
        </div>

        <div className="detail-info">
          <span className="detail-category">{product.category}</span>

          <h1>{product.name}</h1>

          <div className="rating-row">
            <div>
              <Star size={18} fill="#fbbf24" />
              <span>{product.rating || 5}</span>
            </div>
            <p>{product.sold || 0} produk terjual</p>
          </div>

          <div className="price-row">
            {product.promoPrice ? (
              <div className="detail-promo-price">
                <small>
                  Rp{" "}
                  {Number(product.price).toLocaleString(
                    "id-ID"
                  )}
                </small>

                <h1>
                  Rp{" "}
                  {Number(
                    product.promoPrice
                  ).toLocaleString("id-ID")}
                </h1>

                <span>
                  Hemat {product.discount}%
                </span>
              </div>
            ) : (
              <h1>
                Rp{" "}
                {Number(product.price).toLocaleString(
                  "id-ID"
                )}
              </h1>
            )}
            <span>{product.oldPrice}</span>
          </div>

          <p className="description">{product.description}</p>

          <div className="stock-box">
            <p>Stok tersedia</p>
            <strong> {product.stock || 0} produk </strong>
          </div>

          <div className="quantity-box">
            <span>Jumlah</span>

            <div className="quantity-control">
              <button
                onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
              >
                <Minus size={18} />
              </button>

              <strong>{quantity}</strong>

              <button onClick={() =>
                setQuantity(
                  quantity < product.stock
                    ? quantity + 1
                    : quantity
                )
              }>
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="action-row">
            <button
              className="cart-btn"
              onClick={() => {
                addToCart({
                  ...product,
                  qty: quantity,
                });

                window.dispatchEvent(
                  new Event("cartUpdated")
                );

                toast.success(`🛒 ${product.name} berhasil ditambahkan ke keranjang.`);
              }}
            >
              <ShoppingCart size={20} />
              Tambah Keranjang
            </button>

            <button
              className="buy-btn"
              onClick={() => {

                addToCart({
                  ...product,
                  qty: quantity,
                });

                window.dispatchEvent(
                  new Event("cartUpdated")
                );

                navigate("/cart");

              }}
            >
              Beli Sekarang
            </button>

            <button
              className="wish-btn"
              disabled
              title="Fitur akan segera hadir"
            >
              <Heart size={20}/>
            </button>
          </div>

          <div className="service-box">
            <div>
              <Truck size={22} />
              <span>
                <b>Pengiriman cepat</b>
                <p>Pesanan diproses di hari yang sama</p>
              </span>
            </div>

            <div>
              <ShieldCheck size={22} />
              <span>
                <b>Produk terpercaya</b>
                <p>Kualitas produk dijamin oleh toko</p>
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="product-extra">
        <div className="extra-card">
          <h2>Informasi Pengiriman</h2>

          <div className="delivery-info">
            <p>
              <b>Estimasi Pengiriman:</b> 1–2 hari kerja untuk area Yogyakarta.
            </p>
            <p>
              <b>Metode Pengiriman:</b> Pesan antar oleh toko atau ambil langsung di tempat.
            </p>
            <p>
              <b>Biaya Pengiriman:</b> Mulai dari Rp 10.000 sesuai jarak lokasi pelanggan.
            </p>
          </div>
        </div>

        <div className="extra-card">
          <h2>Detail Produk</h2>

          <ul className="detail-list">
            <li>Nama Produk: {product.name}</li>
            <li>Kategori: {product.category}</li>
            <li>Harga: Rp {Number(product.price).toLocaleString("id-ID")}</li>
            <li>Stok Tersedia: {product.stock}</li>
            <li>
              Deskripsi:
              {" "}
              {product.description || "Tidak ada deskripsi"}
            </li>
          </ul>
        </div>
      </section>

      <section className="related-section">
        <div className="related-header">
          <div>
            <h2>Produk Terkait</h2>
            <p>Rekomendasi produk lain yang mungkin Anda butuhkan.</p>
          </div>

          <button onClick={() => navigate("/products")}>
            Lihat Semua →
          </button>
        </div>

        <div className="related-grid">
          {relatedProducts.map((item) => (
            <div
              className="related-card"
              key={item.id}
              onClick={() => navigate(`/products/${item.id}`)}
            >
              <img src={item.imageUrl} alt={item.name}/>

              <h3>{item.name}</h3>
              <p>
                Rp{" "}
                {Number(item.price).toLocaleString(
                  "id-ID"
                )}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({
                    ...item,
                    qty: 1,
                  });
                  window.dispatchEvent(
                    new Event("cartUpdated")
                  );
                  toast.success(
                    `${item.name} berhasil ditambahkan ke keranjang.`
                  );
                }}
              >
                Tambah
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default ProductDetail;