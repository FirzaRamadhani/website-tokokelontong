import { MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h2>Toko Kelontong Mas Novi</h2>

            <p>
              Belanja kebutuhan harian dengan mudah, cepat, dan terpercaya.
            </p>
          </div>

          <div className="footer-contact">
            <div>
              <MapPin size={18} />
              <span>Gg.tengah tegallayang rt.004 caturharjo pandak bantul</span>
            </div>

            <div>
              <Phone size={18} />
              <span>+62 896-6428-0204</span>
            </div>

            <div>
              <Mail size={18} />
              <span>tokokelontongmasnovi@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-links">
            <Link to="/about">Tentang Kami</Link>
          </div>
          <p>© 2026 Toko Kelontong Mas Novi</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;