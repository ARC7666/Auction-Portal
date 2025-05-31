import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage, auth } from './firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';
import './edit-auctions.css';
import 'react-datepicker/dist/react-datepicker.css'; // help taken by  @Codevolution channel
import DatePicker from "react-datepicker";
import { signOut, onAuthStateChanged } from "firebase/auth";

function EditAuction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [user, setUser] = useState(null);

  


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); 
      } else {
        navigate("/"); 
      }
    });

    return () => unsubscribe(); 
  }, [navigate]);

  useEffect(() => {
   const fetchAuction = async () => {
      try {
        const docRef = doc(db, 'auctions', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setAuction(data);

          const now = new Date();
          const startTime = new Date(data.startTime);
          setIsEditable(now < startTime);
        } else {
          alert('Auction not found');
          navigate('/');
        }
      } catch (error) {
        alert('Error loading auction');
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();

    
  }, [id, navigate]);

  const handleMediaChange = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser || !auction || auction.sellerId !== auth.currentUser.uid) {
      alert("data not found.");
      return;
    }

    if (!isEditable) {
      alert("Auction has already started and cannot be edited.");
      return;
    }

    setUploading(true);

    try {
      let mediaURLs = auction.media || [];

      if (mediaFiles.length > 0) {
        mediaURLs = await Promise.all(
          mediaFiles.map(async (file) => {
            const fileRef = ref(storage, `auctions/${auth.currentUser.uid}/${Date.now()}-${file.name}`);
            await uploadBytes(fileRef, file);
            return await getDownloadURL(fileRef);
          })
        );
      }

      const start = startTime;
      const end = new Date(start.getTime() + parseInt(auction.duration) * 60000);

      await updateDoc(doc(db, 'auctions', id), {
        title: auction.title,
        description: auction.description,
        startPrice: parseFloat(auction.startPrice),
        currentBid: parseFloat(auction.startPrice),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        media: mediaURLs,
        duration: auction.duration,
        updatedAt: serverTimestamp()
      });

      //alert('Auction updated successfully!');
      navigate('/seller-auctions');
    } catch (error) {
      console.error("Error updating auction:", error);
      alert('Update failed: ' + error.message);
    }

    setUploading(false);
  };

  if (loading || !auction) {
  return (
    <div className="spinner-overlay">
      <div className="spinned" />
    </div>
  );
}



  if (!isEditable) {
    return (
      <div className="auction-container">
        <aside className="sidebar3">
          <div className="logo"><img src="/logo.png" alt="Logo" /></div>
          <div className="dashboard-title3">
            <hr />
            <span>Seller Dashboard</span>
            <hr />
          </div>
          <nav className="nav-buttons">
            <Link to="/seller-dashboard"><button>Home</button></Link>
            <Link to="/seller-auctions"><button>View Listing</button></Link>
            <Link to="/seller-analytics"><button>Sale Analytics</button></Link>
          </nav>
        </aside>

        <main className="dashboard-content3">
          <h2>Edit Auction</h2>
          <p style={{ color: 'red' }}>❌ This auction has already started and cannot be edited.</p>
          <button onClick={() => navigate('/seller-auctions')}>Go Back</button>
        </main>
      </div>
    );
  }

  return (
    <>
      {uploading && (
  <div className="spinner-overlay">
    <div className="spinned" />
  </div>
)}
      <div className="auction-container">
        <aside className="sidebar3">
          <div className="logo"><img src="/logo.png" alt="Logo" /></div>
          <div className="dashboard-title3">
            <hr />
            <span>Seller Dashboard</span>
            <hr />
          </div>
          <nav className="nav-buttons">
            <Link to="/create-auction"><button>Create Auction</button></Link>
            <Link to="/seller-auctions"><button>My Listing</button></Link>
            <Link to="/seller-analytics"><button>Sale Analytics</button></Link>
          </nav>
        </aside>

        <main className="dashboard-content-3">
          <h2 style={{fontSize: 35,}}>Edit Auction</h2>
          <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="auction-form">
              <input type="text" placeholder="Title" value={auction.title}
                onChange={(e) => setAuction({ ...auction, title: e.target.value })} required />

              <textarea placeholder="Description" value={auction.description}
                onChange={(e) => setAuction({ ...auction, description: e.target.value })} required />

              <input type="number" placeholder="Start Price" value={auction.startPrice}
                onChange={(e) => setAuction({ ...auction, startPrice: e.target.value })} required />

              {/*<input type="datetime-local" value={auction.startTime.slice(0, 16)}
                //onChange={(e) => setAuction({ ...auction, startTime: e.target.value })} required */}
                <DatePicker
                selected={startTime}
                onChange={(date) => setStartTime(date)}
                      showTimeSelect
                placeholderText=" dd/mm/yyyy ,  --:--                                  🗓️"
                timeFormat="HH:mm"
          
                timeIntervals={1}
                timeCaption="Time"
                dateFormat="dd/MM/yyyy h:mm aa"
                className="custom-datepicker"
                minDate={new Date()}
                />

              <input type="number" placeholder="Duration (in minutes)" value={auction.duration}
                onChange={(e) => setAuction({ ...auction, duration: e.target.value })} required />

              <input type="file" multiple accept="image/*,video/*"
                onChange={handleMediaChange} />

              <button type="submit" disabled={uploading}style={{fontWeight: 700 , fontSize: 20}}>
                {uploading ? 'Updating...' : 'Update Auction'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default EditAuction;