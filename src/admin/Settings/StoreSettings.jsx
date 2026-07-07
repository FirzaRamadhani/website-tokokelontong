import { useState, useEffect } from "react";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Clock,
  ImagePlus,
  Save,
} from "lucide-react";
import {
  getSettings,
  saveSettings,
} from "../../services/settingsService";
import "./StoreSettings.css";
import { uploadImageToCloudinary } from "../../services/uploadService";
import toast from "react-hot-toast";

function StoreSettings() {
  const [formData, setFormData] = useState({
    storeName: "",
    email: "",
    phone: "",
    operatingHours: "",
    address: "",
    description: "",
    logo: "",
    qrisImage: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();

      if (data) {
        setFormData(data);

        if (data.logo) {
          setLogoPreview(data.logo);
        }

        if (data.qrisImage) {
            setQrisPreview(data.qrisImage);
        }
      }
    } catch (error) {
      console.error(error);
       toast.error("Gagal memuat pengaturan toko.");
    }
  };

  const [logoPreview, setLogoPreview] = useState(null);
  const [qrisPreview, setQrisPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const toastId = toast.loading("Mengunggah logo...");
    try {
      const imageUrl =
        await uploadImageToCloudinary(file);
      setLogoPreview(imageUrl);
      setFormData((prev) => ({
        ...prev,
        logo: imageUrl,
      }));

      toast.dismiss(toastId);

      toast.success("Logo berhasil diunggah.");

    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error("Gagal mengunggah logo.");
    }
  };

  const handleQrisChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const toastId = toast.loading("Mengunggah QRIS...");
    try {
      const imageUrl =
        await uploadImageToCloudinary(file);

      setQrisPreview(imageUrl);

      setFormData((prev) => ({
        ...prev,
        qrisImage: imageUrl,
      }));
      toast.dismiss(toastId);
      toast.success("QRIS berhasil diunggah.");
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error("Gagal mengunggah QRIS.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings({
        ...formData,
        logo: logoPreview,
        qrisImage: qrisPreview,
      });
      toast.success(
        "Pengaturan toko berhasil disimpan."
      );
    } catch (error) {
      console.error(error);
      toast.error(
        "Gagal menyimpan pengaturan."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <span className="settings-label">Pengaturan</span>
          <h1>Pengaturan Toko</h1>
          <p>Kelola informasi utama toko yang akan digunakan pada website.</p>
        </div>
      </div>

      <form className="settings-layout" onSubmit={handleSubmit}>
        <section className="settings-card">
          <div className="settings-section-title">
            <Store size={22} />
            <div>
              <h2>Informasi Toko</h2>
              <p>Data identitas toko kelontong.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-form-group">
              <label>Nama Toko</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    storeName: e.target.value,
                  })
                }
              />
            </div>

            <div className="settings-form-group">
              <label>Email Toko</label>
              <div className="settings-input-icon">
                <Mail size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="settings-form-group">
              <label>Nomor Telepon</label>
              <div className="settings-input-icon">
                <Phone size={18} />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="settings-form-group">
              <label>Jam Operasional</label>
              <div className="settings-input-icon">
                <Clock size={18} />
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      operatingHours: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="settings-form-group">
            <label>Alamat Toko</label>
            <div className="settings-input-icon textarea-box">
              <MapPin size={18} />
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="settings-form-group">
            <label>Deskripsi Toko</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />
          </div>
        </section>

        <aside className="settings-card logo-card">
          <div className="settings-section-title">
            <ImagePlus size={22} />
            <div>
              <h2>Logo Toko</h2>
              <p>Upload logo untuk identitas toko.</p>
            </div>
          </div>

          <label className={logoPreview ? "logo-upload has-logo" : "logo-upload"}>
            {logoPreview ? (
              <img src={logoPreview} alt="Preview Logo" />
            ) : (
              <>
                <ImagePlus size={46} />
                <strong>Upload Logo</strong>
                <span>PNG, JPG, atau JPEG</span>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleLogoChange}
            />
          </label>

          <div className="qris-upload-card">
            <h3>QRIS Pembayaran</h3>
            <p>
                Upload QRIS yang digunakan pelanggan
                untuk melakukan pembayaran.
            </p>
            <label
                className={
                    qrisPreview
                        ? "logo-upload has-logo"
                        : "logo-upload"
                }
            >
                {qrisPreview ? (
                    <img
                        src={qrisPreview}
                        alt="QRIS"
                    />
                ) : (
                    <>
                        <ImagePlus size={46}/>
                        <strong>
                            Upload QRIS
                        </strong>
                        <span>
                            PNG, JPG, JPEG
                        </span>
                    </>
                )}
                <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleQrisChange}
                />
            </label>

        </div>

          <div className="store-preview-card">
            <h3>Preview Toko</h3>

            <div className="store-preview-content">
              <div className="store-preview-logo">
                  {logoPreview ? (
                      <img
                          src={logoPreview}
                          alt="Logo"
                      />
                  ) : (
                      <Store size={32}/>
                  )}
              </div>
              <div>
                <h4>{formData.storeName}</h4>
                <p>Admin Store Profile</p>
              </div>
            </div>
          </div>

          <button className="save-settings-btn" type="submit" disabled={saving}>
            <Save size={18} />
            {saving
              ? "Menyimpan..."
              : "Simpan Pengaturan"}
          </button>
        </aside>
      </form>
    </div>
  );
}

export default StoreSettings;