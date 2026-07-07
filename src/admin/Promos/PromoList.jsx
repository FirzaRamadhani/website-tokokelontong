import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  BadgePercent,
  X,
} from "lucide-react";
import {
  getPromos,
  addPromo,
  updatePromo,
  deletePromo,
} from "../../services/promoService";

import { getProducts } from "../../services/productService";  
import "./PromoList.css";

function formatRupiah(value) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function PromoList() {
  const [promos, setPromos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [products, setProducts] = useState([]);

  const loadPromos = async () => {
    const productsData = await getProducts();
    setProducts(productsData);
    try {
      const data = await getPromos();
      setPromos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const [formData, setFormData] = useState({
    productName: "",
    normalPrice: "",
    promoPrice: "",
    productId: "",
    status: "Aktif",
  });

  const openAddModal = () => {
    setEditingPromo(null);
    setFormData({
      productName: "",
      normalPrice: "",
      promoPrice: "",
      status: "Aktif",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setFormData({
      productName: promo.productName,
      normalPrice: promo.normalPrice,
      promoPrice: promo.promoPrice,
      status: promo.status,
    });
    setIsModalOpen(true);
  };

  const calculateDiscount = (normalPrice, promoPrice) => {
    const normal = Number(normalPrice);
    const promo = Number(promoPrice);

    if (!normal || !promo || promo >= normal) return 0;

    return Math.round(((normal - promo) / normal) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const discount = calculateDiscount(
      formData.normalPrice,
      formData.promoPrice
    );

    const payload = {
      productName: formData.productName,
      normalPrice: Number(formData.normalPrice),
      promoPrice: Number(formData.promoPrice),
      discount,
      status: formData.status,
    };

    try {
      if (editingPromo) {
        await updatePromo(editingPromo.id, payload);
      } else {
        await addPromo(payload);
      }

      await loadPromos();

      setIsModalOpen(false);
      setEditingPromo(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePromo(selectedPromo.id);

      await loadPromos();

      setSelectedPromo(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  return (
    <div className="promo-page">
      <div className="promo-header">
        <div>
          <span className="promo-label">Promo</span>
          <h1>Manajemen Promo</h1>
          <p>Kelola diskon produk untuk meningkatkan penjualan toko.</p>
        </div>

        <button className="add-promo-btn" type="button" onClick={openAddModal}>
          <Plus size={18} />
          Tambah Promo
        </button>
      </div>

      <div className="promo-toolbar">
        <div className="promo-search">
          <Search size={20} />
          <input placeholder="Cari promo produk..." />
        </div>

        <select>
          <option>Semua Status</option>
          <option>Aktif</option>
          <option>Nonaktif</option>
        </select>
      </div>

      <section className="promo-table-card">
        <div className="promo-table-head">
          <span>Produk</span>
          <span>Harga Normal</span>
          <span>Harga Promo</span>
          <span>Diskon</span>
          <span>Status</span>
          <span>Aksi</span>
        </div>

        {promos.map((item) => (
          <div className="promo-table-row" key={item.id}>
            <div className="promo-product-cell">
              <div className="promo-icon">
                <BadgePercent size={18} />
              </div>

              <div>
                <h3>{item.productName}</h3>
                <p>ID Promo: #{item.id}</p>
              </div>
            </div>

            <span>{formatRupiah(item.normalPrice)}</span>
            <span className="promo-price">{formatRupiah(item.promoPrice)}</span>
            <span className="discount-badge">{item.discount}%</span>

            <span
              className={
                item.status === "Aktif"
                  ? "promo-status active"
                  : "promo-status inactive"
              }
            >
              {item.status}
            </span>

            <div className="promo-actions">
              <button
                className="edit-btn"
                type="button"
                onClick={() => openEditModal(item)}
              >
                <Pencil size={16} />
              </button>

              <button
                className="delete-btn"
                type="button"
                onClick={() => setSelectedPromo(item)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>

      {isModalOpen && (
        <div className="promo-modal-overlay">
          <div className="promo-modal">
            <div className="promo-modal-header">
              <div>
                <h2>{editingPromo ? "Edit Promo" : "Tambah Promo"}</h2>
                <p>
                  {editingPromo
                    ? "Perbarui data promo produk."
                    : "Tambahkan promo baru untuk produk toko."}
                </p>
              </div>

              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="promo-form-group">
                <label>Nama Produk</label>
                <select
                  value={formData.productId || ""}
                  onChange={(e) => {
                    const selected = products.find(
                      (p) => p.id === e.target.value
                    );

                    setFormData({
                      ...formData,
                      productId: selected.id,
                      productName: selected.name,
                      normalPrice: selected.price,
                    });
                  }}
                >
                  <option value="">Pilih Produk</option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="promo-form-grid">
                <div className="promo-form-group">
                  <label>Harga Normal</label>
                  <input
                    type="number"
                    placeholder="28000"
                    value={formData.normalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, normalPrice: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="promo-form-group">
                  <label>Harga Promo</label>
                  <input
                    type="number"
                    placeholder="24000"
                    value={formData.promoPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, promoPrice: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="promo-form-group">
                <label>Status Promo</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option>Aktif</option>
                  <option>Nonaktif</option>
                </select>
              </div>

              <div className="promo-preview-box">
                <span>Estimasi Diskon</span>
                <strong>
                  {calculateDiscount(formData.normalPrice, formData.promoPrice)}
                  %
                </strong>
              </div>

              <div className="promo-modal-actions">
                <button
                  type="button"
                  className="cancel-promo"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>

                <button type="submit" className="save-promo">
                  {editingPromo ? "Update Promo" : "Simpan Promo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPromo && (
        <div className="promo-modal-overlay">
          <div className="delete-promo-modal">
            <div className="delete-promo-icon">
              <Trash2 size={28} />
            </div>

            <h2>Hapus Promo?</h2>

            <p>
              Promo untuk produk <b>{selectedPromo.productName}</b> akan dihapus.
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="promo-modal-actions">
              <button
                type="button"
                className="cancel-promo"
                onClick={() => setSelectedPromo(null)}
              >
                Batal
              </button>

              <button
                type="button"
                className="delete-promo-confirm"
                onClick={handleDelete}
              >
                Hapus Promo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromoList;