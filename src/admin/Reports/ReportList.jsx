import { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  ShoppingBag,
  Wallet,
  Package,
  TrendingUp,
} from "lucide-react";
import { getOrders } from "../../services/orderService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./ReportList.css";
import toast from "react-hot-toast";

function formatRupiah(value) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function ReportList() {
  const [reportType, setReportType] = useState("weekly");
  const [summary, setSummary] = useState([]);
  const [reports, setReports] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const activeRevenue =
    reportType === "weekly" ? weeklyRevenue : monthlyRevenue;

  const maxRevenue = Math.max(...activeRevenue.map((item) => item.revenue), 1);

  const filteredReports = reports.filter((report) => {
    if (!startDate && !endDate) return true;

    if (!report.createdAt) return false;

    const reportDate = new Date(
      report.createdAt.seconds * 1000
    );

    if (startDate) {
      const start = new Date(startDate);

      if (reportDate < start) return false;
    }

    if (endDate) {
      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      if (reportDate > end) return false;
    }

    return true;
  });

  const exportExcel = () => {
    const data = filteredReports.map((item) => ({
      ID_Transaksi: item.id,
      Tanggal: item.createdAt
        ? new Date(
            item.createdAt.seconds * 1000
          ).toLocaleDateString("id-ID")
        : "-",
      Pelanggan: item.customer || "-",
      Produk: item.items
        ?.map((p) => p.name)
        .join(", "),
      Total: item.total,
      Status: item.status,
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Laporan Penjualan"
    );

    const excelBuffer = XLSX.write(
      workbook,
      {
        bookType: "xlsx",
        type: "array",
      }
    );

    const fileData = new Blob(
      [excelBuffer],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    if (filteredReports.length === 0) {
      toast.error("Belum ada data laporan untuk diekspor.");
      return;
    }

    saveAs(
      fileData,
      `Laporan-Penjualan-${new Date().toLocaleDateString(
        "id-ID"
      )}.xlsx`
    );
    toast.success("Laporan Excel berhasil diunduh.");
  };

  const exportPDF = () => {
    if(reports.length===0){
      toast.error("Belum ada data laporan yang dapat diekspor.");
      return;
    }
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Laporan Penjualan", 14, 20);

    doc.setFontSize(10);
    doc.text(
      `Tanggal Export : ${new Date().toLocaleDateString("id-ID")}`,
      14,
      28
    );

    autoTable(doc, {
      startY: 35,
      head: [
        [
          "ID Transaksi",
          "Tanggal",
          "Pelanggan",
          "Produk",
          "Total",
          "Status",
        ],
      ],
      body: filteredReports.map((item) => [
        item.id,
        item.createdAt
          ? new Date(
              item.createdAt.seconds * 1000
            ).toLocaleDateString("id-ID")
          : "-",
        item.customer || "-",
        item.items
          ?.map((product) => product.name)
          .join(", ") || "-",
        `Rp ${Number(item.total || 0).toLocaleString(
          "id-ID"
        )}`,
        item.status,
      ]),
    });

    doc.save(
      `Laporan-Penjualan-${new Date().toLocaleDateString(
        "id-ID"
      )}.pdf`
    );
    toast.success("Laporan PDF berhasil diunduh.");
  };

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const orders = await getOrders();

      const completedOrders = orders.filter(
        (item) => item.status === "Selesai" 
      );

      const weeklyData = {};

      for (let i = 6; i >= 0; i--) {
        const d = new Date();

        d.setDate(d.getDate() - i);

        const key = d.toLocaleDateString("id-ID", {
          weekday: "short",
        });

        weeklyData[key] = 0;
      }

      completedOrders.forEach((order) => {
        if (!order.createdAt) return;

        const date = new Date(
          order.createdAt.seconds * 1000
        );

        const key = date.toLocaleDateString("id-ID", {
          weekday: "short",
        });

        if (weeklyData[key] !== undefined) {
          weeklyData[key] += Number(order.total || 0);
        }
      }); 

      setWeeklyRevenue(
        Object.entries(weeklyData).map(
          ([label, revenue]) => ({
            label,
            revenue,
          })
        )
      );

      const totalRevenue = completedOrders.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
      );

      let totalProducts = 0;

      const productSales = {};

      completedOrders.forEach((order) => {
        order.items?.forEach((item) => {
          totalProducts += Number(item.qty || item.quantity || 1);

          productSales[item.name] =
            (productSales[item.name] || 0) +
            Number(item.qty || item.quantity || 1);
        });
      });

      setSummary([
        {
          title: "Total Pendapatan",
          value:
            "Rp " +
            totalRevenue.toLocaleString("id-ID"),
          icon: Wallet,
          growth: `${completedOrders.length} Pesanan`,
        },

        {
          title: "Total Pesanan",
          value: completedOrders.length,
          icon: ShoppingBag,
          growth: "Selesai",
        },

        {
          title: "Produk Terjual",
          value: totalProducts,
          icon: Package,
          growth: "Realtime",
        },

        {
          title: "Rata-rata Harian",
          value:
            "Rp " +
            Math.round(
              totalRevenue / 30
            ).toLocaleString("id-ID"),
          icon: TrendingUp,
          growth: "30 Hari",
        },
      ]);

      setReports(
        completedOrders.sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        )
      );

      const bestProductData = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([name, sold], index) => ({
          name,
          sold,
          percent: 100 - index * 10,
        }));

      setBestProducts(bestProductData);

      const monthlyData = {
        Jan: 0,
        Feb: 0,
        Mar: 0,
        Apr: 0,
        Mei: 0,
        Jun: 0,
        Jul: 0,
        Agu: 0,
        Sep: 0,
        Okt: 0,
        Nov: 0,
        Des: 0,
      };

      completedOrders.forEach((order) => {
        if (!order.createdAt) return;

        const date = new Date(
          order.createdAt.seconds * 1000
        );

        const month = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Agu",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ][date.getMonth()];

        monthlyData[month] += Number(
          order.total || 0
        );
      });
      setMonthlyRevenue(
        Object.entries(monthlyData).map(
          ([label, revenue]) => ({
            label,
            revenue,
          })
        )
      );
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="report-page">
      <div className="report-header">
        <div>
          <span className="report-label">Laporan</span>
          <h1>Laporan Penjualan</h1>
          <p>Ringkasan transaksi, pendapatan, dan performa produk toko.</p>
        </div>
        <div className="export-actions">
          <button
            className="export-btn"
            onClick={exportExcel}
          >
            <Download size={18} />
            Export Excel
          </button>

          <button
            className="export-btn"
            onClick={exportPDF}
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="report-summary-grid">
        {summary.map((item, index) => {
          const Icon = item.icon;

          return (
            <div className="report-summary-card" key={index}>
              <div className="summary-icon">
                <Icon size={22} />
              </div>

              <div>
                <p>{item.title}</p>
                <h2>{item.value}</h2>
              </div>

              <span>{item.growth}</span>
            </div>
          );
        })}
      </div>

      <div className="report-main-grid">
        <section className="report-chart-card">
          <div className="report-section-title">
            <div>
              <h2>Grafik Pendapatan</h2>
              <p>
                {reportType === "weekly"
                  ? "Data pendapatan penjualan dalam 7 hari terakhir."
                  : "Data pendapatan penjualan per bulan dalam satu tahun."}
              </p>
            </div>

            <div className="report-chart-actions">
              <div className="report-date-filter">
                <div className="filter-group">
                  <label>Dari</label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e)=>setStartDate(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Sampai</label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e)=>setEndDate(e.target.value)}
                  />
                </div>

                <button
                  className="reset-filter-btn"
                  onClick={()=>{
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  Reset
                </button>

              </div>

              <div className="chart-type">

                <button
                  className={reportType==="weekly"?"active":""}
                  onClick={()=>setReportType("weekly")}
                >
                  Mingguan
                </button>

                <button
                  className={reportType==="monthly"?"active":""}
                  onClick={()=>setReportType("monthly")}
                >
                  Bulanan
                </button>

              </div>

            </div>
          </div>

          {activeRevenue.every(item => item.revenue === 0) ? (
            <div className="empty-chart">
              <BarChart3 size={55} />
              <h3>Belum Ada Data Penjualan</h3>
              <p>
                Grafik akan tampil setelah terdapat transaksi
                yang berstatus <b>Selesai</b>.
              </p>
            </div>
          ) : (
            <div className="report-bar-chart">
              {activeRevenue.map((item, index) => {
                const height =
                  (item.revenue / maxRevenue) * 170;
                return (
                  <div
                    className="report-bar-item"
                    key={index}
                  >
                    <div className="report-bar-track">
                      <div
                        className="report-bar"
                        style={{
                          height: `${height}px`,
                        }}
                      ></div>
                    </div>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="best-product-card">
          <div className="report-section-title">
            <div>
              <h2>Produk Terlaris</h2>
              <p>Produk dengan penjualan tertinggi.</p>
            </div>
          </div>

          {bestProducts.length === 0 ? (
            <div className="empty-best-product">
              <Package size={55} />
              <h3>Belum Ada Produk Terjual</h3>
              <p>
                Produk terlaris akan muncul setelah
                terdapat transaksi selesai.
              </p>
            </div>
          ) : (

            <div className="best-product-list">
              {bestProducts.map((item, index) => (
                <div className="best-product-item" key={index}>
                  <div className="best-product-top">
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.sold} produk terjual</p>
                    </div>

                    <strong>{index + 1}</strong>
                  </div>

                  <div className="best-product-progress">
                    <div style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="report-table-card">
        <div className="report-section-title">
          <div>
            <h2>Riwayat Transaksi</h2>
            <p>Daftar transaksi penjualan yang telah selesai.</p>
          </div>
        </div>

        <div className="report-table">
          <div className="report-table-head">
            <span>ID Transaksi</span>
            <span>Tanggal</span>
            <span>Pelanggan</span>
            <span>Produk</span>
            <span>Total</span>
            <span>Status</span>
          </div>
          {filteredReports.length === 0 ? (

            <div className="empty-report">

              <ShoppingBag size={55} />

              <h3>Belum Ada Riwayat Transaksi</h3>

              <p>
                Transaksi yang telah selesai
                akan tampil di sini.
              </p>

            </div>

          ) : (
            filteredReports.map((item) => (
              <div className="report-table-row" key={item.id}>
                <span>{item.id}</span>
                <span>
                  {item.createdAt
                    ? new Date(
                        item.createdAt.seconds * 1000
                      ).toLocaleDateString("id-ID")
                    : "-"}
                </span>

                <span>{item.customer || "-"}</span>

                <span>
                  {item.items?.[0]?.name || "-"}
                </span>

                <span>
                  Rp{" "}
                  {Number(item.total || 0).toLocaleString(
                    "id-ID"
                  )}
                </span>

                <span className="report-status">
                  {item.status}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default ReportList;