import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Tags, X } from "lucide-react";
import "./CategoryList.css";

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory as deleteCategoryService,
} from "../../services/categoryService";

function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedDeleteCategory, setSelectedDeleteCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIsFormOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) return;

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: categoryName,
        slug: createSlug(categoryName),
      });
    } else {
      await addCategory({
        name: categoryName,
        slug: createSlug(categoryName),
        totalProduct: 0,
        createdAt: new Date(),
      });
    }

    await fetchCategories();

    setCategoryName("");
    setEditingCategory(null);
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    await deleteCategoryService(selectedDeleteCategory.id);

    await fetchCategories();

    setSelectedDeleteCategory(null);
  };

  return (
    <div className="category-page">
      <div className="category-header">
        <div>
          <span className="category-label">Kategori Produk</span>
          <h1>Manajemen Kategori</h1>
          <p>Kelola kategori produk toko kelontong.</p>
        </div>

        <button className="add-category-btn" type="button" onClick={openAddModal}>
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      <div className="category-toolbar">
        <div className="category-search">
          <Search size={20} />
          <input placeholder="Cari kategori..." />
        </div>
      </div>

      <section className="category-table-card">
        <div className="category-table-head">
          <span>Nama Kategori</span>
          <span>Slug</span>
          <span>Jumlah Produk</span>
          <span>Aksi</span>
        </div>

        {categories.map((item) => (
          <div className="category-table-row" key={item.id}>
            <div className="category-name-cell">
              <div className="category-icon">
                <Tags size={18} />
              </div>

              <div>
                <h3>{item.name}</h3>
                <p>ID Kategori: #{item.id}</p>
              </div>
            </div>

            <span className="category-slug">{item.slug}</span>
            <span className="category-total">{item.totalProduct} Produk</span>

            <div className="category-actions">
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
                onClick={() => setSelectedDeleteCategory(item)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>

      {isFormOpen && (
        <div className="category-modal-overlay">
          <div className="category-modal">
            <div className="category-modal-header">
              <div>
                <h2>{editingCategory ? "Edit Kategori" : "Tambah Kategori"}</h2>
                <p>
                  {editingCategory
                    ? "Perbarui data kategori produk."
                    : "Tambahkan kategori baru untuk produk toko."}
                </p>
              </div>

              <button type="button" onClick={() => setIsFormOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="category-form-group">
                <label>Nama Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: Sembako"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>

              <div className="category-form-group">
                <label>Slug Otomatis</label>
                <input type="text" value={createSlug(categoryName)} disabled />
              </div>

              <div className="category-modal-actions">
                <button
                  type="button"
                  className="cancel-category"
                  onClick={() => setIsFormOpen(false)}
                >
                  Batal
                </button>

                <button type="submit" className="save-category">
                  {editingCategory ? "Update Kategori" : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDeleteCategory && (
        <div className="category-modal-overlay">
          <div className="delete-category-modal">
            <div className="delete-category-icon">
              <Trash2 size={28} />
            </div>

            <h2>Hapus Kategori?</h2>

            <p>
              Kategori <b>{selectedDeleteCategory.name}</b> akan dihapus dari sistem.
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="category-modal-actions">
              <button
                type="button"
                className="cancel-category"
                onClick={() => setSelectedDeleteCategory(null)}
              >
                Batal
              </button>

              <button
                type="button"
                className="delete-category-confirm"
                onClick={handleDelete}
              >
                Hapus Kategori
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryList;