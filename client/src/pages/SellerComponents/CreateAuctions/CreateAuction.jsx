import React, { useEffect, useState } from 'react';
import './CreateAuction.css';
import { doc, getDoc } from "firebase/firestore";
import { db, storage, auth } from '../../../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import 'react-datepicker/dist/react-datepicker.css'; // help taken by  @Codevolution channel
import DatePicker from "react-datepicker";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { logo } from '../../../assets';
import { ClipLoader } from 'react-spinners';
import Swal from "sweetalert2";
import { Home, List, BarChart3, CalendarDays, MessageSquare } from 'lucide-react';


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
      <div
        style={{
          height: "100vh",
          width: "100vw",
          backgroundImage: 'url("/images/back.jpg")',
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ClipLoader color="#6c63ff" size={60} />
      </div>
    );
  }

  /*const handleGoBack1 = () => {
    navigate("/seller-dashboard"); 
  }*/

  const formatIndianCurrency = (value) => {
    if (!value) return '';
    const num = value.replace(/[^0-9]/g, '');
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
        startPrice: parseFloat(startPrice.replace(/[^\d.]/g, "")), //parse is converting string data ( jo hum enter karenge) to numbers which is to be stored in database
        currentBid: parseFloat(startPrice.replace(/[^\d.]/g, "")),
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
    <div className="auction-container">
      <aside className="sidebar1">
        <div className="logo">
          <Link to="/seller-dashboard">
            <img src={logo} alt="Logo" style={{ cursor: 'pointer' }} />
          </Link>
        </div>
        <div className="dashboard-title1">
          <hr />
          <span>Create Auction</span>
          <hr />
        </div>


        <nav className="nav-buttons-seller">
          <Link to="/seller-dashboard">
            <button className="nav-btn-seller">
              <Home className="nav-icon" />
              <span>Home</span>
            </button>
          </Link>
          <Link to="/seller-dashboard-layout/seller-auctions">
            <button className="nav-btn-seller">
              <List className="nav-icon" />
              <span>View Listings</span>
            </button>
          </Link>

          <Link to="/seller-dashboard-layout/chat">
            <button className="nav-btn-seller">
              <MessageSquare className="nav-icon" />
              <span>Chat</span>
            </button>
          </Link>
        </nav>


      </aside>

      <main className="dashboard-contented">
        {/*}   <h2 style={{fontSize: 35,}}>List Your Item</h2>*/}
        <form onSubmit={handleSubmit} className="auction-form">
          <input type="text" placeholder="Title" value={title}
            onChange={(e) => setTitle(e.target.value)} required />

          <textarea placeholder="Description" value={description}
            onChange={(e) => setDescription(e.target.value)} required />

          <input
            type="text"
            placeholder="Start Price"
            value={formatIndianCurrency(startPrice)}
            onChange={(e) => setStartPrice(e.target.value)}
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
            <option value="Others">Others</option>
          </select>

          <DatePicker
            selected={startTime}
            onChange={(date) => setStartTime(date)}
            showTimeSelect
            placeholderText=" dd/mm/yyyy ,  --:--                                                                                   🗓️"
            timeFormat="HH:mm"

            timeIntervals={1}
            timeCaption="Time"
            dateFormat="dd/MM/yyyy h:mm aa"
            className="custom-datepicker"
            minDate={new Date()}
          />


          <input type="number" placeholder="Duration (in minutes)" value={duration}
            onChange={(e) => setDuration(e.target.value)} required />

          <input type="file" multiple accept="image/*,video/*"
            onChange={handleMediaChange} style={{ color: '#545353b5', }} />

          <button type="submit" disabled={uploading} style={{ fontWeight: 700, fontSize: 20 }}>
            {uploading ? 'Uploading...' : 'Create Auction'}
          </button>
        </form>
      </main>


    </div>
  );
}

export default CreateAuction;