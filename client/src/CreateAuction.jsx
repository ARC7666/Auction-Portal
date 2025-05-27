import React, { useState } from 'react';
import './CreateAuction.css';
import { db, storage, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function CreateAuction() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
   const navigate = useNavigate();

  /*const handleGoBack1 = () => {
    navigate("/seller-dashboard"); 
  }*/

  const handleMediaChange = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("You must be logged in.");
      return;
    }

    setUploading(true);

    try {
      // 1. Upload all media files to Firebase Storage
      const mediaURLs = await Promise.all(
        mediaFiles.map(async (file) => {
          const fileRef = ref(storage, `auctions/${auth.currentUser.uid}/${Date.now()}-${file.name}`);
          console.log("Uploading file:", file.name);
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          console.log("Uploaded URL:", url);
          return url;
        })
      );

      // 2. Calculate endTime from duration
      const start = new Date(startTime);
      const end = new Date(start.getTime() + parseInt(duration) * 60000);

      // 3. Save to Firestore
      await addDoc(collection(db, 'auctions'), {
        title,
        description,
        media: mediaURLs,
        startPrice: parseFloat(startPrice),
        currentBid: parseFloat(startPrice),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        sellerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'scheduled',
        bids: []
      });

      alert('Auction created successfully!');

      // Reset form
      setTitle('');
      setDescription('');
      setStartPrice('');
      setStartTime('');
      setDuration('');
      setMediaFiles([]);

    } catch (error) {
      console.error("Error uploading auction:", error);
      alert('Error creating auction: ' + error.message);
    }

    setUploading(false);
  };

  return (
    <div className="auction-container">
      <aside className="sidebar1">
        <div className="logo"><img src="/logo.png" alt="Logo" /></div>
         <div className="dashboard-title1">
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

       <main className="dashboard-content1">
           <h2>Create Auction</h2>
             <form onSubmit={handleSubmit} className="auction-form">
           <input type="text" placeholder="Title" value={title}
          onChange={(e) => setTitle(e.target.value)} required />

           <textarea placeholder="Description" value={description}
          onChange={(e) => setDescription(e.target.value)} required />

          <input type="number" placeholder="Start Price" value={startPrice}
            onChange={(e) => setStartPrice(e.target.value)} required />

          <input type="datetime-local" value={startTime}
            onChange={(e) => setStartTime(e.target.value)} required />

          <input type="number" placeholder="Duration (in minutes)" value={duration}
          onChange={(e) => setDuration(e.target.value)} required />

          <input type="file" multiple accept="image/*,video/*"
          onChange={handleMediaChange} />

           <button type="submit" disabled={uploading}>
             {uploading ? 'Uploading...' : 'Create Auction'}
          </button>
      </form>
      </main>

      
    </div>
  );
}

export default CreateAuction;