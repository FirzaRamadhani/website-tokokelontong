import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Package,
} from "lucide-react";
import {
  getProducts,
  deleteProduct,
} from "../../services/productService";
import {
  isProductUsedInOrders,
} from "../../services/orderService";
import "./ProductList.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCategories } from "../../services/categoryService";
import toast from "react-hot-toast";

function ProductList() {
const navigate = useNavigate();
const [products, setProducts] = useState([]);
const [categories, setCategories] = useState([]);
const [selectedCategory, setSelectedCategory] = useState("");
const [selectedProduct, setSelectedProduct] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [deleting, setDeleting] = useState(false);
const ITEMS_PER_PAGE = 5;

const loadData = async () => {
  try {
    const productData = await getProducts();
    const categoryData = await getCategories();

    setProducts(productData);
    setCategories(categoryData);
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  loadData();
}, []);

useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, selectedCategory]);

const filteredProducts = products.filter((item) => {
  const matchCategory =
    !selectedCategory ||
    item.category?.toLowerCase() ===
      selectedCategory.toLowerCase();

  const matchSearch =
    item.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

  return matchCategory && matchSearch;
});

const totalPages = Math.ceil(
  filteredProducts.length / ITEMS_PER_PAGE
);

const paginatedProducts = filteredProducts.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

  return (
    <div className="admin-products-page">
      <div className="products-header">
        <div>
          <span className="products-label">Manajemen Produk</span>
          <h1>Daftar Produk</h1>
          <p>Kelola data produk yang tersedia pada toko kelontong.</p>
        </div>

        <button className="add-product-btn" onClick={() => navigate("/admin/products/create")}>
          <Plus size={18} />
          Tambah Produk
        </button>
      </div>

      <div className="products-toolbar">
        <div className="products-search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.name}
              >
                {category.name}
              </option>
            ))}
          </select>
      </div>

      <section className="products-table-card">
        <div className="products-table-head">
          <span>Produk</span>
          <span>Kategori</span>
          <span>Harga</span>
          <span>Stok</span>
          <span>Status</span>
          <span>Aksi</span>
        </div>

          {paginatedProducts.map((item) => (
          <div className="products-table-row" key={item.id}>
            <div className="product-info-cell">
              <img
                src={
                  item.imageUrl ||
                  "https://via.placeholder.com/80x80?text=Produk"
                }
                alt={item.name}
              />

              <div>
                <h3>{item.name}</h3>
                <p>ID Produk: #{item.id}</p>
              </div>
            </div>

            <span>{item.category}</span>
            <span>
              Rp {Number(item.price).toLocaleString("id-ID")}
            </span>
            <span>{item.stock}</span>

            <span
              className={
                item.status === "Aktif"
                  ? "product-status active"
                  : "product-status warning"
              }
            >
              {item.stock > 10 ? "Aktif" : "Stok Menipis"}
            </span>

            <div className="product-actions">

              <button className="edit" onClick={() => navigate(`/admin/products/edit/${item.id}`)}>
                <Pencil size={17} />
              </button>

              <button className="delete" onClick={() => setSelectedProduct(item)}>
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}

        <div className="products-table-footer">
          <div>
            <Package size={18} />
            Menampilkan {" "} {paginatedProducts.length} {" "} dari {" "} {filteredProducts.length} {" "} produk
          </div>
            <div className="products-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) => prev - 1)
                }
              >
                Prev
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => (
                  <button
                    key={index + 1}
                    className={
                      currentPage === index + 1
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(index + 1)
                    }
                  >
                    {index + 1}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => prev + 1)
                }
              >
                Next
              </button>
            </div>
        </div>
      </section>

      {selectedProduct && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-icon">
              <Trash2 size={28} />
            </div>

            <h2>Hapus Produk?</h2>

            <p>
              Produk <b>{selectedProduct.name}</b> akan dihapus dari daftar produk.
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="delete-modal-actions">
              <button
                className="cancel-delete"
                onClick={() => setSelectedProduct(null)}
              >
                Batal
              </button>

              <button
                className="confirm-delete"
                disabled={deleting}
                onClick={async () => {
                  const toastId = toast.loading(
                    "Menghapus produk..."
                  );
                  try {
                    setDeleting(true);
                    const isUsed =
                      await isProductUsedInOrders(
                        selectedProduct.name
                      );
                    if (isUsed) {
                      toast.error(
                        "Produk sudah pernah digunakan dalam transaksi dan tidak dapat dihapus.",
                        {
                          id: toastId,
                        }
                      );

                      return;
                    }

                    await deleteProduct(
                      selectedProduct.id
                    );

                    await loadData();

                    setSelectedProduct(null);

                    toast.success(
                      "Produk berhasil dihapus.",
                      {
                        id: toastId,
                      }
                    );

                  } catch (error) {

                    console.error(error);
                    toast.error(
                      "Gagal menghapus produk.",
                      {
                        id: toastId,
                      }
                    );
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? "Menghapus..." : "Hapus Produk"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;