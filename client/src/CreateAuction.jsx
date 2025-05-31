import React, { useEffect ,useState } from 'react';
import './CreateAuction.css';
import { db, storage, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import 'react-datepicker/dist/react-datepicker.css'; // help taken by  @Codevolution channel
import DatePicker from "react-datepicker";
import { signOut, onAuthStateChanged } from "firebase/auth";


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

  /*const handleGoBack1 = () => {
    navigate("/seller-dashboard"); 
  }*/

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
    startPrice: parseFloat(startPrice), //parse is converting string data ( jo hum enter karenge) to numbers which is to be stored in database
    currentBid: parseFloat(startPrice),
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
        <h2 style={{fontSize: 35,}}>Create Auction</h2>
          <form onSubmit={handleSubmit} className="auction-form">
        <input type="text" placeholder="Title" value={title}
      onChange={(e) => setTitle(e.target.value)} required />

       <textarea placeholder="Description" value={description}
      onChange={(e) => setDescription(e.target.value)} required />

      <input type="number" placeholder="Start Price" value={startPrice}
        onChange={(e) => setStartPrice(e.target.value)} required />

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