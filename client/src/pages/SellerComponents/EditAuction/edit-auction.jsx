
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage, auth } from '../../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DatePicker from "react-datepicker";
import { onAuthStateChanged } from "firebase/auth";
import 'react-datepicker/dist/react-datepicker.css';
import './edit-auctions.css';
import { deleteObject } from 'firebase/storage';


function EditAuction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
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
          const start = new Date(data.startTime);
          setStartTime(start);
          setIsEditable(now < start);
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


  const handleDeleteImage = (urlToDelete) => {
    const updatedMedia = auction.media.filter((url) => url !== urlToDelete);
    setAuction({ ...auction, media: updatedMedia });
  };

  const handleRemoveLocalFile = (index) => {
    const updatedFiles = [...mediaFiles];
    updatedFiles.splice(index, 1);
    setMediaFiles(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser || !auction || auction.sellerId !== auth.currentUser.uid) {
      alert("Unauthorized access.");
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
      const end = new Date(startTime.getTime() + parseInt(auction.duration) * 60000);
      await updateDoc(doc(db, 'auctions', id), {
        title: auction.title,
        description: auction.description,
        startPrice: parseFloat(auction.startPrice),
        currentBid: parseFloat(auction.startPrice),
        startTime: startTime.toISOString(),
        endTime: end.toISOString(),
        media: mediaURLs,
        duration: auction.duration,
        category: auction.category,
        updatedAt: serverTimestamp(),
      });
      navigate('/seller-dashboard-layout/seller-auctions');
    } catch (error) {
      console.error("Update error:", error);
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
      <div className="dashboard-content-3">
        <h2>Edit Auction</h2>
        <p style={{ color: 'red' }}>❌ This auction has already started and cannot be edited.</p>
        <button onClick={() => navigate('/seller-dashboard-layout/seller-auctions')}>Go Back</button>
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
      <div className="dashboard-content-3">
        <div className="form-wrapper">
          <h2 style={{ fontSize: 35 }}>Edit Auction</h2>
          <form onSubmit={handleSubmit} className="auction-form">
            <input type="text" placeholder="Title" value={auction.title}
              onChange={(e) => setAuction({ ...auction, title: e.target.value })} required />

             <textarea placeholder="Description" value={auction.description}
              onChange={(e) => setAuction({ ...auction, description: e.target.value })} required />

            <input type="number" placeholder="Start Price" value={auction.startPrice}
              onChange={(e) => setAuction({ ...auction, startPrice: e.target.value })} required />

            <select
              value={auction.category}
              onChange={(e) => setAuction({ ...auction, category: e.target.value })}
              required
              className="auction-category-dropdown"
            >
              <option value="">Select Category</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Electronics">Electronics</option>
              <option value="Luxury">Luxury</option>
              <option value="Antique">Antique</option>
              <option value="Jewellery">Jewellery</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Painting">Painting</option>
              <option value="RealEstate">Real Estate</option>
              <option value="Books">Books</option>
              <option value="Others">Others</option>
            </select>

            <DatePicker
              selected={startTime}
              onChange={(date) => setStartTime(date)}
              showTimeSelect
              placeholderText=" dd/mm/yyyy ,  --:-- 🗓️"
              timeFormat="HH:mm"
              timeIntervals={1}
              timeCaption="Time"
              dateFormat="dd/MM/yyyy h:mm aa"
              className="custom-datepicker"
              minDate={new Date()}
            />

            <input type="number" placeholder="Duration (in minutes)" value={auction.duration}
              onChange={(e) => setAuction({ ...auction, duration: e.target.value })} required />

            
            {auction.media && auction.media.length > 0 && (
              <div className="preview-gallery">
                {auction.media.map((url, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px',
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  >
                    {url.includes('video') ? (
                      <video src={url} controls width="120px" height="90px" style={{ borderRadius: '8px' }} />
                    ) : (
                      <img src={url} alt={`media-${idx}`} width="120px" height="90px" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteImage(url)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        backgroundColor: '#ffe4e6',
                        color: '#321b1bff',
                        border: '1px solid #ffffffff',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      ❌ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}


            {mediaFiles.length > 0 && (
              <div className="preview-gallery">
                {mediaFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px',
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`local-${idx}`}
                      width="120px"
                      height="90px"
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLocalFile(idx)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        backgroundColor: '#ffe4e6',
                        color: '#321b1bff',
                        border: '1px solid #ffffff43',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      ❌ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}


            <label htmlFor="media-upload" className="custom-upload-btn">➕ Add More Media</label>
            <input
              id="media-upload"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaChange}
              style={{ display: 'none' }}
            />

            <button type="submit" disabled={uploading} style={{ fontWeight: 700, fontSize: 20 }}>
              {uploading ? 'Updating...' : 'Update Auction'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditAuction;