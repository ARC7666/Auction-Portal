import React, { useEffect ,useState } from 'react';
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
import { Home, List, BarChart3 ,CalendarDays } from 'lucide-react';


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
    
      
 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().role === "seller") {
        const userData = docSnap.data();
        setUser({ ...user, name: userData.name, role: userData.role });
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

   //alert('Auction created successfully!');

   // once data entry done reset everything
   setTitle('');
   setDescription('');
   setStartPrice('');
   //      setStartTime('');
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

        
   <nav className="nav-buttons">
  <Link to="/seller-dashboard">
    <button className="nav-btn">
      <Home className="nav-icon" />
      <span>Home</span>
    </button>
  </Link>

  <Link to="/seller-auctions">
    <button className="nav-btn">
      <List className="nav-icon" />
      <span>View Listing</span>
    </button>
  </Link>

  <Link to="/seller-analytics">
    <button className="nav-btn">
      <BarChart3 className="nav-icon" />
      <span>Sale Analytics</span>
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

      <DatePicker
        selected={startTime}
        onChange={(date) => setStartTime(date)}
              showTimeSelect
        placeholderText=" dd/mm/yyyy ,  --:--                                                                           🗓️"
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
      onChange={handleMediaChange} style={{color: 'white', }}/>

       <button type="submit" disabled={uploading} style={{fontWeight: 700 , fontSize: 20}}>
         {uploading ? 'Uploading...' : 'Create Auction'}
      </button>
  </form>
  </main>

      
    </div>
  );
}

export default CreateAuction;