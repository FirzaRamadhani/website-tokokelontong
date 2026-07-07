import { useEffect, useState } from "react";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { getSettings } from "../../services/settingsService";
import "./About.css";

function About() {

  const [store, setStore] = useState(null);

  useEffect(() => {
    loadStore();
  }, []);

  const loadStore = async () => {

    try {
      const data = await getSettings();
      setStore(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!store) {
    return (
      <main className="about-page">

        <h2>Memuat informasi toko...</h2>

      </main>
    );
  }

  return (
    <main className="about-page">
      <section className="about-card">
        <div className="about-logo">
          {store.logo ? (
            <img
              src={store.logo}
              alt={store.storeName}
            />
          ) : (
            <Store size={70} />
          )}
        </div>
        <h1>{store.storeName}</h1>
        <p className="about-description">
          {store.description}
        </p>
        <div className="about-info">
          <div className="info-card">
            <MapPin size={22} />

            <div>
              <h3>Alamat</h3>
              <p>{store.address}</p>
            </div>
          </div>

          <div className="info-card">
            <Phone size={22} />

            <div>
              <h3>Telepon</h3>
              <p>{store.phone}</p>
            </div>
          </div>

          <div className="info-card">
            <Mail size={22} />

            <div>
              <h3>Email</h3>
              <p>{store.email}</p>
            </div>
          </div>

          <div className="info-card">
            <Clock size={22} />

            <div>
              <h3>Jam Operasional</h3>
              <p>{store.operatingHours}</p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

export default About;