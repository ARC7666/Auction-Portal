import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db , storage } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL , deleteObject } from "firebase/storage"; 
import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    role: ""
  });
  const [editing, setEditing] = useState({ phone: false, address: false, bank: false });

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser(user);
          setProfileData({
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            address: data.address || "",
            accountNumber: data.accountNumber || "",
            ifscCode: data.ifscCode || "",
            bankName: data.bankName || "",
            role: data.role || "" ,
            profileImageUrl: data.profileImageUrl || "",
          });
        }
      } else {
        navigate("/login");
      }
    });
  }, [navigate]);

  const handleChange = (e) => {
  setProfileData({ ...profileData, [e.target.name]: e.target.value });
};

const handleProfileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !user) return;

  const storageRef = ref(storage, `profile-pics/${user.uid}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  await setDoc(doc(db, "users", user.uid), { profileImageUrl: downloadURL }, { merge: true });

  setProfileData((prev) => ({ ...prev, profileImageUrl: downloadURL }));
  alert("Profile picture updated!");
};

const handleRemovePhoto = async () => {
  if (!user) return;

  const storageRef = ref(storage, `profile-pics/${user.uid}`);
  try {
    await deleteObject(storageRef); // Delete from storage
    await setDoc(doc(db, "users", user.uid), { profileImageUrl: null }, { merge: true }); // Remove from Firestore
    setProfileData((prev) => ({ ...prev, profileImageUrl: null }));
    alert("Profile picture removed!");
  } catch (err) {
    console.error("Error removing profile photo:", err);
    alert("Failed to remove profile picture");
  }
};

  const saveChanges = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
      alert("Profile updated successfully");
      setEditing({ phone: false, address: false, bank: false });
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
<div className="profile-pic-upload">
    <div className="profile-pic-section">
  <label htmlFor="profileUpload" className="upload-label">
    <img
      src={profileData.profileImageUrl || `https://ui-avatars.com/api/?name=${profileData.name}`}
      alt="User Avatar"
      className="avatar-preview"
    />
    <input
      id="profileUpload"
      type="file"
      accept="image/*"
      style={{ display: "none" }}
      onChange={handleProfileUpload}
    />
  </label>

     {profileData.profileImageUrl && (
      <button className="remove-photo-btn" onClick={handleRemovePhoto}>
         Remove Photo
      </button>
    )}
  </div>
    <div className="profile-info">
           <h2>{profileData.name || "No Name"}</h2>
          <p>{profileData.email || "No Email"}</p>
     </div>

</div>
      </div>

      <div className="profile-fields">
        <div className="field">
          <label>Phone:</label>
          {editing.phone ? (
            <input
              type="text"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
            />
          ) : (
            <p>{profileData.phone || "Not added"}</p>
          )}
          <button onClick={() => setEditing({ ...editing, phone: !editing.phone })}>
            {editing.phone ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="field">
          <label>Address:</label>
          {editing.address ? (
            <textarea
              name="address"
              value={profileData.address}
              onChange={handleChange}
            />
          ) : (
            <p>{profileData.address || "Not added"}</p>
          )}
          <button onClick={() => setEditing({ ...editing, address: !editing.address })}>
            {editing.address ? "Cancel" : "Edit"}
          </button>
        </div>

        {profileData.role === "seller" && (
          <div className="bank-details">
            <h3>Bank Details</h3>
            <div className="field">
              <label>Account Number:</label>
              <input
                type="text"
                name="accountNumber"
                value={profileData.accountNumber}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label>IFSC Code:</label>
              <input
                type="text"
                name="ifscCode"
                value={profileData.ifscCode}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label>Bank Name:</label>
              <input
                type="text"
                name="bankName"
                value={profileData.bankName}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <button className="save-btn" onClick={saveChanges}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;