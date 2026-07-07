import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ImagePlus, Save } from "lucide-react";
import { getCategories } from "../../services/categoryService";

import {
  addProduct,
  getProductById,
  updateProduct,
} from "../../services/productService";

import { uploadImageToCloudinary } from "../../services/uploadService";

import "./ProductForm.css";
import toast from "react-hot-toast";

function ProductForm() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [previewImage, setPreviewImage] = useState(null);
  const [image, setImage] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Nama produk wajib diisi";
    }

    if (!category) {
      newErrors.category = "Kategori wajib dipilih";
    }

    if (!price) {
      newErrors.price = "Harga wajib diisi";
    } else if (Number(price) <= 0) {
      newErrors.price = "Harga harus lebih dari 0";
    }

    if (stock === "") {
      newErrors.stock = "Stok wajib diisi";
    } else if (Number(stock) < 0) {
      newErrors.stock = "Stok tidak boleh kurang dari 0";
    }

    if (!description.trim()) {
      newErrors.description = "Deskripsi wajib diisi";
    }

    if (!previewImage && !image) {
      newErrors.image = "Gambar produk wajib diupload";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Lengkapi semua data produk.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading(
      isEditMode
        ? "Memperbarui produk..."
        : "Menambahkan produk..."
    );

    try {
      let imageUrl = previewImage;
      if (image) {
        toast.loading("Mengunggah gambar...", {
          id: toastId,
        });

        imageUrl = await uploadImageToCloudinary(image);
      }
      const productData = {
        name,
        category,
        price: Number(price),
        stock: Number(stock),
        description,
        imageUrl,
      };
      if (isEditMode) {
        await updateProduct(id, productData);

        toast.success(
          "Produk berhasil diperbarui.",
          {
            id: toastId,
          }
        );
      } else {
        await addProduct(productData);

        toast.success(
          "Produk berhasil ditambahkan.",
          {
            id: toastId,
          }
        );
      }
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error(
        "Gagal menyimpan produk.",
        {
          id: toastId,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 10 MB.");
      return;
    }

    setImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  useEffect(() => {
    const loadData = async () => {

      const categoryData = await getCategories();
      setCategories(categoryData);

      if (id) {
        const product = await getProductById(id);

        if (product) {
          setName(product.name || "");
          setCategory(product.category || "");
          setPrice(product.price || "");
          setStock(product.stock || "");
          setDescription(product.description || "");

          if (product.imageUrl) {
            setPreviewImage(product.imageUrl);
          }
        }
      }
    };

    loadData();
  }, [id]);

  return (
    <div className="product-form-page">
      <div className="product-form-header">
        <button onClick={() => navigate("/admin/products")}>
          <ChevronLeft size={20} />
          Kembali
        </button>

        <h1>{isEditMode ? "Edit Produk" : "Tambah Produk"}</h1>

        <p>
          Lengkapi informasi produk yang akan ditampilkan pada katalog toko.
        </p>
      </div>

      <form className="product-form-card" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Informasi Produk</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Nama Produk</label>

              <input className={errors.name ? "input-error" : ""}
                type="text"
                placeholder="Contoh: Beras Premium 5kg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {errors.name && (
                <small className="error-text">
                  {errors.name}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Kategori</label>
              <select className={errors.category ? "input-error" : ""}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Pilih kategori</option>

                {categories.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              {errors.category && (
              <small className="error-text">
              {errors.category}
              </small>
              )}
            </div>

            <div className="form-group">
              <label>Harga</label>

              <input className={errors.price ? "input-error" : ""}
                type="number"
                placeholder="64000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              {errors.price && (
              <small className="error-text">
              {errors.price}
              </small>
              )}
            </div>

            <div className="form-group">
              <label>Stok</label>

              <input className={errors.stock ? "input-error" : ""}
                type="number"
                placeholder="25"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
              {errors.stock && (
              <small className="error-text">
              {errors.stock}
              </small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Deskripsi Produk</label>

            <textarea className={errors.description ? "input-error" : ""}
              placeholder="Tuliskan deskripsi singkat produk..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            {errors.description && (
            <small className="error-text">
            {errors.description}
            </small>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>Gambar Produk</h2>

          <label
            className={`upload-box ${ previewImage ? "has-preview" : "" } ${errors.image ? "upload-error" : ""}`}>
            {previewImage ? (
              <img src={previewImage} alt="Preview Produk" />
            ) : (
              <>
                <ImagePlus size={42} />

                <strong>Upload gambar produk</strong>

                <span>
                  PNG, JPG, atau JPEG maksimal 2MB
                </span>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </label>
          {errors.image && (
          <small className="error-text">
          {errors.image}
          </small>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/admin/products")}
          >
            Batal
          </button>

          <button type="submit" className="save-btn" disabled={loading}>
            <Save size={18} />
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;