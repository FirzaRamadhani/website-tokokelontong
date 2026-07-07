import {
  Search,
  Eye,
  UserRound,
  Phone,
  MapPin,
  ShoppingBag,
  Wallet,
  X,
} from "lucide-react";
import "./CustomerList.css";
import { useEffect, useState } from "react";
import { getCustomers } from "../../services/customerService";

function CustomerList() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers,setCustomers]=useState([]);
  const [search, setSearch] = useState("");

  useEffect(()=>{
      loadCustomers();
  },[]);
  const loadCustomers = async()=>{
      try{
          const data =
              await getCustomers();
          setCustomers(data);
      }catch(error){
          console.error(error);
      }
  }
  const filteredCustomers = customers.filter((customer) => {
    const keyword = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(keyword) ||
      customer.email.toLowerCase().includes(keyword) ||
      customer.phone.toLowerCase().includes(keyword)
    );
  });
  return (
    <div className="customer-page">
      <div className="customer-header">
        <div>
          <span className="customer-label">Pelanggan</span>
          <h1>Customer Management</h1>
          <p>Kelola data pelanggan dan riwayat belanja pada toko.</p>
        </div>
      </div>

      <div className="customer-toolbar">
        <div className="customer-search">
          <Search size={20} />
          <input placeholder="Cari pelanggan..." value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
      </div>

      <section className="customer-card">
        <div className="customer-table-head">
          <span>Nama Pelanggan</span>
          <span>No. HP</span>
          <span>Total Order</span>
          <span>Total Belanja</span>
          <span>Terakhir Belanja</span>
          <span>Aksi</span>
        </div>

        {filteredCustomers.map((customer) => (
          <div className="customer-table-row" key={customer.id}>
            <div className="customer-name-cell">
              <div className="customer-avatar">
                <UserRound size={20} />
              </div>

              <div>
                <h3>{customer.name}</h3>
                <p>ID Pelanggan: #{customer.id.slice(0,8).toUpperCase()}</p>
              </div>
            </div>

            <span>{customer.phone}</span>
            <span>{customer.totalOrder} Order</span>
            <span> Rp{" "} {customer.totalBelanja.toLocaleString("id-ID")}</span>
            <span>{customer.lastOrder ? new Date(customer.lastOrder.seconds * 1000).toLocaleDateString("id-ID") : "-"}</span>
            <button
              className="view-customer-btn"
              onClick={() => setSelectedCustomer(customer)}
            >
              <Eye size={16} />
            </button>
          </div>
        ))}
      </section>

      {selectedCustomer && (
        <div className="customer-modal-overlay">
          <div className="customer-modal">
            <div className="customer-modal-header">
              <div>
                <h2>Detail Pelanggan</h2>
                <p>{selectedCustomer.name}</p>
              </div>

              <button onClick={() => setSelectedCustomer(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="customer-detail-grid">
              <div>
                <Phone size={20} />
                <span>No. HP</span>
                <strong>{selectedCustomer.phone}</strong>
              </div>

              <div>
                <MapPin size={20} />
                <span>Alamat</span>
                <strong>{selectedCustomer.address}</strong>
              </div>

              <div>
                <ShoppingBag size={20} />
                <span>Total Order</span>
                <strong>{selectedCustomer.totalOrder} Pesanan</strong>
              </div>

              <div>
                <Wallet size={20} />
                <span>Total Belanja</span>
                <strong> Rp{" "} {selectedCustomer.totalBelanja.toLocaleString("id-ID")}</strong>
              </div>
            </div>

            <div className="customer-history">
              <h3>Riwayat Pesanan</h3>  
              {selectedCustomer.orders?.length > 0 ? (
                selectedCustomer.orders.map((order) => (
                  <div
                    className="history-item"
                    key={order.id}
                  >
                    <span>
                      Order #
                      {order.id.slice(0,8).toUpperCase()}
                    </span>
                    <b>{order.status}</b>
                  </div>
                ))
              ) : (
                <p>Belum memiliki riwayat pesanan.</p>
              )}
            </div>
            <button
              className="close-customer-modal"
              onClick={() => setSelectedCustomer(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerList;