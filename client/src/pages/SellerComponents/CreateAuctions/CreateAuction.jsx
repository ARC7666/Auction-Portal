import React, { useEffect, useState } from 'react';
import './CreateAuction.css';
import { doc, getDoc } from "firebase/firestore";
import { db, storage, auth } from '../../../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import 'react-datepicker/dist/react-datepicker.css'; // help taken by  @Codevolution channel
import DatePicker from "react-datepicker";
import { signOut, onAuthStateChanged } from "firebase/auth";
import Swal from "sweetalert2";



function CreateAuction() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestingVerification, setRequestingVerification] = useState(false);
  const [category, setCategory] = useState('');
  const [displayPrice, setDisplayPrice] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === "seller") {
          const userData = docSnap.data();

          if (!userData.isVerified) {
            setUser({ ...user, isVerified: false });
          } else {
            setUser({ ...user, name: userData.name, role: userData.role, isVerified: true });
          }

          setLoading(false);
        } else {
          navigate("/unauthorized", { replace: true });
        }
      } else {
        navigate("/", { replace: true });
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinned" />
      </div>
    );
  }

  /*const handleGoBack1 = () => {
    navigate("/seller-dashboard"); 
  }*/
  //parse is converting string data ( jo hum enter karenge) to numbers which is to be stored in database

  const formatIndianCurrency = (value) => {
    if (!value) return '';
    const num = value.toString().replace(/[^0-9]/g, '');
    const x = parseInt(num);
    if (isNaN(x)) return '';
    return '₹' + x.toLocaleString('en-IN');
  };

  const handleMediaChange = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();  //prevent default prevent the page from refreshing/ reload 

    if (!auth.currentUser) {
      alert("You must be logged in.");
      return;
    }

    setUploading(true);



    try {
      // uploading media to the firestore storage
      const mediaURLs = await Promise.all(
        mediaFiles.map(async (file) => {
          const fileRef = ref(storage, `auctions/${auth.currentUser.uid}/${Date.now()}-${file.name}`);
          //example -> auctions/u12345xyz/1717000000000-image.png
          /* so storage instance kai auctions folder mai with valid used uid and timestap( for unique file name ) ke sath
          data will be stored */
          console.log("Uploading file:", file.name);
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          console.log("Uploaded URL:", url);
          return url;
        })
      );


      const start = startTime;
      const end = new Date(start.getTime() + parseInt(duration) * 60000);

      // saving the created listing data to the firestore
      await addDoc(collection(db, 'auctions'), { //iska matlab hai Add a new document to the ‘auctions’ collection
        title,
        description,
        category,
        media: mediaURLs, // ye firebase storage sai download url mila .[remember cloudinary use krne sai ye chnage karna hai]
        startPrice: startPrice,
  currentBid: startPrice,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        sellerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'scheduled',
        bids: []
      });



      // once data entry done reset everything
      setTitle('');
      setDescription('');
      setStartPrice('');

      setSelectedDate('');
      setStartTime(null);
      setDuration('');
      setMediaFiles([]);

    } catch (error) {
      console.error("Error uploading auction:", error);
      alert('Error creating auction: ' + error.message);
    }
    setUploading(false);
  };

  const requestVerification = async () => {
    if (requestingVerification || !user) return;

    setRequestingVerification(true);

    try {
      await addDoc(collection(db, "adminLogs"), {
        type: "verify-request",
        userId: user.uid,
        performedBy: user.email,
        timestamp: serverTimestamp(),
      });

      await Swal.fire({
        icon: "info",
        title: "Request Sent",
        text: "Your verification request has been submitted to the admin.",
        timer: 1200,
        imerProgressBar: true,
        showConfirmButton: false
      });

      navigate("/seller-dashboard");

    } catch (err) {
      console.error("Failed to request verification:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not send verification request."
      });
    } finally {
      setRequestingVerification(false);
    }
  };

  if (!user?.isVerified) {
    return (
      <div className="not-verified-message">
        <h2>⚠️ You are not a verified seller.</h2>
        <p>Only verified sellers can list auctions.</p>
        <button
          onClick={requestVerification}
          disabled={requestingVerification}
          className="verify-link"
          style={{ marginTop: "1rem", padding: "10px 20px", fontSize: "16px" }}
        >
          {requestingVerification ? "Sending Request..." : "👉 Request Verification"}
        </button>
      </div>
    );
  }

  return (


    <main className="dashboard-contented">
      {/*}   <h2 style={{fontSize: 35,}}>List Your Item</h2>*/}
      <form onSubmit={handleSubmit} className="auction-form">
        <input type="text" placeholder="Title" value={title}
          onChange={(e) => setTitle(e.target.value)} required />

        <textarea placeholder="Description" value={description}
          onChange={(e) => setDescription(e.target.value)} required />

        <input
          type="text"
          placeholder="Start Price (₹80 - ₹99.99L)"
          value={displayPrice}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            const num = parseInt(raw);

            if (!isNaN(num)) {
              if (num >= 80 && num <= 9999900) {
                setStartPrice(num); 
                setDisplayPrice(formatIndianCurrency(num)); 
              } else {
                setDisplayPrice(e.target.value);
              }
            } else {
              setStartPrice('');
              setDisplayPrice('');
            }
          }}
          required
        />
        <select
          className="auction-category-select-cretae"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={{
            padding: "10px",
            marginBottom: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
            color: category ? "#000" : "#777"
          }}
        >
          <option value="" disabled hidden>Select Category</option>
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
          placeholderText="dd/mm/yyyy ,  --:--  "
          timeFormat="HH:mm"
          timeIntervals={1}
          timeCaption="Time"
          dateFormat="dd/MM/yyyy h:mm aa"
          className="custom-datepicker"
          minDate={new Date()}
          popperPlacement="bottom-start"
          popperModifiers={[
            {
              name: "preventOverflow",
              options: {
                boundary: "viewport",
              },
            },
            {
              name: "offset",
              options: {
                offset: [0, 10],
              },
            },
          ]}
        />


        <input type="number" placeholder="Duration (in minutes)" value={duration}
          onChange={(e) => setDuration(e.target.value)} required />

        <div className="media-upload-section">
          {mediaFiles.length === 0 && (
            <label className="media-upload-label">
              Upload Photos/Videos
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="media-input"
              />
            </label>
          )}

          {mediaFiles.length > 0 && (
            <>
              <label className="add-more-label">
                + Add More Photos/Videos
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) =>
                    setMediaFiles((prev) => [...prev, ...Array.from(e.target.files)])
                  }
                  className="media-input"
                />
              </label>

              <div className="media-preview-grid">
                {mediaFiles.map((file, index) => {
                  const url = URL.createObjectURL(file);
                  const isImage = file.type.startsWith("image");

                  return (
                    <div key={index} className="media-preview-card">
                      <span
                        className="remove-media-btn"
                        onClick={() => {
                          const updated = [...mediaFiles];
                          updated.splice(index, 1);
                          setMediaFiles(updated);
                        }}
                      >
                        &times;
                      </span>
                      {isImage ? (
                        <img src={url} alt={`media-${index}`} />
                      ) : (
                        <video src={url} controls />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <button type="submit" disabled={uploading} style={{ fontWeight: 700, fontSize: 20 }}>
          {uploading ? 'Uploading...' : 'Create Auction'}
        </button>
      </form>
    </main>

  );
}

export default CreateAuction;