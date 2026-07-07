import {
    useState,
} from "react";

import {
    Search,
    PackageCheck,
} from "lucide-react";

import {
    trackGuestOrder,
} from "../../services/orderService";

import toast from "react-hot-toast";

import "./TrackOrder.css";

function TrackOrder(){

    const [orderId,setOrderId]=useState("");

    const [phone,setPhone]=useState("");

    const [order,setOrder]=useState(null);

    const [loading,setLoading]=useState(false);

    const handleSearch=async()=>{

        if(!orderId.trim()){

            toast.error(
                "Masukkan nomor pesanan."
            );

            return;

        }

        if(!phone.trim()){

            toast.error(
                "Masukkan nomor WhatsApp."
            );

            return;

        }

        setLoading(true);

        const result=
            await trackGuestOrder(
                orderId.trim(),
                phone.trim()
            );

        setLoading(false);

        if(!result){

            toast.error(
                "Pesanan tidak ditemukan."
            );

            return;

        }

        setOrder(result);

        toast.success(
            "Pesanan ditemukan."
        );

    };

    return(

        <main className="track-page">

            <div className="track-card">

                <h1>
                    Lacak Pesanan
                </h1>

                <p>

                    Masukkan nomor pesanan dan nomor WhatsApp yang digunakan saat checkout.

                </p>

                <input

                    placeholder="Nomor Pesanan"

                    value={orderId}

                    onChange={(e)=>

                        setOrderId(
                            e.target.value
                        )

                    }

                />

                <input

                    placeholder="Nomor WhatsApp"

                    value={phone}

                    onChange={(e)=>

                        setPhone(
                            e.target.value
                        )

                    }

                />

                <button

                    onClick={handleSearch}

                    disabled={loading}

                >

                    <Search size={18}/>

                    {

                    loading

                    ?

                    "Mencari..."

                    :

                    "Cari Pesanan"

                    }

                </button>

            </div>

            {

            order&&(

            <div className="track-result">

                <PackageCheck size={50}/>

                <h2>

                    Order #

                    {order.id.slice(0,8).toUpperCase()}

                </h2>

                <p>

                    <b>Status :</b>

                    {order.status}

                </p>

                <p>

                    <b>Pembayaran :</b>

                    {order.paymentMethod==="bank"

                    ?"Transfer Bank"

                    :order.paymentMethod==="qris"

                    ?"QRIS"

                    :"COD"}

                </p>

                <p>

                    <b>Status Bayar :</b>

                    {order.paymentStatus}

                </p>

                <p>

                    <b>Total :</b>

                    Rp {Number(order.total).toLocaleString("id-ID")}

                </p>

                <p>

                    <b>Tanggal :</b>

                    {order.date}

                </p>

            </div>

            )

            }

        </main>

    );

}

export default TrackOrder;  