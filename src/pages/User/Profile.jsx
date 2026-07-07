import "./Profile.css";
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    PackageSearch
} from "lucide-react";

function Profile(){
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });
    const [loading,setLoading]=useState(true);
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            async(user)=>{
                if (!user) {
                    navigate("/login"); return;
                }
                const snapshot = await getDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    )
                );
                if (!snapshot.exists()) {
                    navigate("/admin/dashboard");
                    return;
                }
                if(snapshot.exists()){
                    setProfile({
                        name:snapshot.data().name || "",
                        email:snapshot.data().email || "",
                        phone:snapshot.data().phone || "",
                        address:snapshot.data().address || "",
                    });
                    setLoading(false);
                }
            }
        );
        return ()=>unsubscribe();
    },[navigate]);

    const handleSave = async () => {
        setSaving(true);
        if (!auth.currentUser) return;
        try {
            await updateDoc(
                doc(
                    db,
                    "users",
                    auth.currentUser.uid
                ),
                {
                    name: profile.name,
                    phone: profile.phone,
                    address: profile.address,
                    updatedAt: serverTimestamp(),
                }
            );
            toast.success(
                "Profil berhasil diperbarui."
            );
        } catch (error) {
            console.error(error);
            toast.error(
                "Gagal memperbarui profil."
            );
        }
        setSaving(false);
    };

    const handleLogout = async () => {
        const confirmLogout = window.confirm(
            "Apakah Anda yakin ingin keluar?"
        );
        if (!confirmLogout) return;
        try {
            await signOut(auth);
            toast.success("Sampai jumpa lagi 👋");
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Logout gagal.");
        }
    };

    if (loading) {
        return (
            <main className="profile-page">
                <div className="profile-card">
                    <h2>Memuat Profil...</h2>
                </div>
            </main>
        );
    }
    
    return(
        <main className="profile-page">
            <div className="profile-card">
                <h1>Profil Saya</h1>
                {
                <>
                <label>Nama Lengkap</label>
                <input value={profile.name} onChange={(e)=> setProfile({...profile, name:e.target.value})}/>
                <label>Email</label>
                <input type="email" value={profile.email} readOnly/>
                <label>Nomor WhatsApp</label>
                <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={profile.phone}
                    onChange={(e)=>
                        setProfile({
                            ...profile,
                            phone:e.target.value
                        })
                        
                    }
                />
                <label>Alamat</label>
                <textarea
                    placeholder="Masukkan alamat lengkap..."
                    value={profile.address}
                    onChange={(e)=>
                        setProfile({
                            ...profile,
                            address:e.target.value
                        })
                    }
                />
                </>
                }
                <button className="save-profile-btn" onClick={handleSave}> Simpan Perubahan</button>
                <button className="orders-profile-btn" onClick={() => navigate("/my-orders")}><PackageSearch size={18}/> Riwayat Pesanan</button>
                <button className="logout-profile-btn" onClick={handleLogout}> Logout</button>
            </div>
        </main>
    )
}

export default Profile;