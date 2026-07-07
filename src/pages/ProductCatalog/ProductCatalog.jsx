import {
  Search,
  ChevronRight,
  ShoppingCart,
  ChevronLeft,
} from "lucide-react";
import { useNavigate, useLocation, } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProducts } from "../../services/productService";
import { getPromos } from "../../services/promoService";
import { getCategories } from "../../services/categoryService";
import { addToCart } from "../../utils/cartUtils";
import "./ProductCatalog.css";
import toast from "react-hot-toast";

function ProductCatalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Produk");
  const [sortBy, setSortBy] = useState("Terbaru");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState(500000);

  useEffect(() => {
    const params = new URLSearchParams(
      location.search
    );
    const category =
      params.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [location.search]);

  const loadProducts = async () => {
    try {
      const productsData = await getProducts();
      const promosData = await getPromos();
      const categoriesData = await getCategories();

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

      setProducts(mergedProducts);

      setCategories([
        "Semua Produk",
        ...categoriesData.map((item) => item.name),
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, priceRange]);

  useEffect(() => {
    loadProducts();
  }, []);

  let filteredProducts = [...products];
  filteredProducts = filteredProducts.filter(
    (item) =>
      item.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );
  if (selectedCategory !== "Semua Produk") {
    filteredProducts = filteredProducts.filter(
      (item) => item.category === selectedCategory
    );
  }

  if (priceRange > 0) {
    filteredProducts = filteredProducts.filter(
      (item) => Number(item.price) <= priceRange
    );
  }

  if (sortBy === "Harga Terendah") {
    filteredProducts.sort(
      (a, b) => Number(a.price) - Number(b.price)
    );
  }

  if (sortBy === "Harga Tertinggi") {
    filteredProducts.sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  }
  const indexOfLastProduct =
    currentPage * productsPerPage;

  const indexOfFirstProduct =
    indexOfLastProduct - productsPerPage;

  const currentProducts =
    filteredProducts.slice(
      indexOfFirstProduct,
      indexOfLastProduct
    );

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        productsPerPage
    )
  );

  return (
    <main className="catalog-page">
      <aside className="catalog-sidebar">
        <h2>Kategori</h2>

        <div className="category-list">
          {categories.map((item) => (
            <button key={item} className={ selectedCategory === item ? "category-btn active" : "category-btn"}
              onClick={() => setSelectedCategory(item)}
            >
              <span>{item}</span>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>

        <div className="filter-box">
          <h3>Filter Harga</h3>
            <div className="price-filter">
              <div className="price-range">
                  <span>Rp 0</span>
                  <span>
                      Rp {priceRange.toLocaleString("id-ID")}
                  </span>
              </div>
              <input
                  type="range"
                  min="0"
                  max="500000"
                  step="5000"
                  value={priceRange}
                  onChange={(e)=>
                      setPriceRange(Number(e.target.value))
                  }
              />
            </div>
        </div>
      </aside>

      <section className="catalog-content">
        <div className="catalog-toolbar">
          <div className="catalog-search">
            <Search size={22} />
            <input placeholder="Cari produk kebutuhan harianmu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
          </div>
          <div className="catalog-sort">
            <span>Urutkan:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="Terbaru">Terbaru</option>
              <option value="Harga Terendah">
                Harga Terendah
              </option>
              <option value="Harga Tertinggi">
                Harga Tertinggi
              </option>
            </select>
          </div>
        </div>

        <div className="catalog-result-count">
          Menampilkan {filteredProducts.length} produk
        </div>
        <div className="catalog-grid">
          {currentProducts.length > 0 ? (
            currentProducts.map((item) => (
              <div
                className="catalog-card"
                key={item.id}
                onClick={() => navigate(`/products/${item.id}`)}
              >
                <div className="catalog-image">
                  {item.discount ? (
                    <span>PROMO</span>
                  ) : (
                    item.badge && <span>{item.badge}</span>
                  )}

                  <img
                    src={item.imageUrl || item.image}
                    alt={item.name}
                  />
                </div>

                <div className="catalog-info">
                  <p>{item.category}</p>

                  <p className="product-stock">
                    Stok: {item.stock}
                  </p>

                  <h3>{item.name}</h3>

                  {item.oldPrice && (
                    <small className="old-price">
                      {item.oldPrice}
                    </small>
                  )}

                  {item.promoPrice && item.discount ? (
                    <div className="catalog-promo-price">
                      <small>
                        Rp{" "}
                        {Number(item.price).toLocaleString(
                          "id-ID"
                        )}
                      </small>

                      <h2>
                        Rp{" "}
                        {Number(
                          item.promoPrice
                        ).toLocaleString("id-ID")}
                      </h2>

                      <span>
                        Diskon {item.discount}%
                      </span>
                    </div>
                  ) : (
                    <h2>
                      Rp{" "}
                      {Number(item.price).toLocaleString(
                        "id-ID"
                      )}
                    </h2>
                  )}

                  <button
                    disabled={item.stock <= 0}
                    onClick={(e) => {
                      e.stopPropagation();

                      addToCart(item);

                      toast.success(`🛒 ${item.name} berhasil ditambahkan ke keranjang.`);
                    }}
                  >
                    <ShoppingCart size={18} />
                    {item.stock <= 0
                      ? "Stok Habis"
                      : "Tambah"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-products">
              <h3>Belum ada produk tersedia</h3>

              <p>
                Produk akan ditampilkan setelah admin menambahkan data produk.
              </p>
            </div>
          )}
        </div>

        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((prev) => prev - 1)
            }
          ><ChevronLeft size={20} /></button>
          {Array.from(
            { length: totalPages },
            (_, i) => (
              <button
                key={i}
                className={
                  currentPage === i + 1
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setCurrentPage(i + 1)
                }
              >
                {i + 1}
              </button>
            )
          )}
          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => prev + 1)
            }
          ><ChevronRight size={20} /></button>
        </div>
      </section>
    </main>
  );
}

export default ProductCatalog;