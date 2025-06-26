import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import Swal from "sweetalert2";
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
    role: "",
    isVerified: false,
    profileImageUrl: ""
  });
  const [editing, setEditing] = useState({ phone: false, address: false, bank: false });
  const [requestingVerification, setRequestingVerification] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser(user);
          setProfileData((prev) => ({
            ...prev,
            ...data
          }));
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
      await deleteObject(storageRef);
      await setDoc(doc(db, "users", user.uid), { profileImageUrl: null }, { merge: true });
      setProfileData((prev) => ({ ...prev, profileImageUrl: null }));
      alert("Profile picture removed!");
    } catch (err) {
      console.error("Error removing profile photo:", err);
      alert("Failed to remove profile picture");
    }
  };

const requestVerification = async () => {
  if (requestingVerification || !user) return;

  setRequestingVerification(true); // ✅ prevent repeated clicks

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
      timer: 2500,
      showConfirmButton: false
    });
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

  const saveChanges = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, profileData, { merge: true });
      const updatedSnap = await getDoc(userRef);
      if (updatedSnap.exists()) {
        setProfileData((prev) => ({ ...prev, ...updatedSnap.data() }));
      }
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Profile updated successfully.",
        timer: 1500,
        showConfirmButton: false
      });
      setEditing({ phone: false, address: false, bank: false });
    } catch (err) {
      console.error("Error updating profile:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update profile."
      });
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

            {profileData.role === "seller" && (
              <p
  style={{
    marginTop: "8px",
    fontWeight: 500,
    color: profileData.isVerified ? "green" : requestingVerification ? "gray" : "red",
    cursor: profileData.isVerified || requestingVerification ? "default" : "pointer"
  }}
  onClick={() =>
    !profileData.isVerified &&
    !requestingVerification &&
    requestVerification()
  }
>
  {profileData.isVerified
    ? "✅ Verified Seller"
    : requestingVerification
      ? "⏳ Sending Verification Request..."
      : "⚠️ Not Verified (Click to Request)"}
</p>
            )}
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
          <button onClick={() => setEditing((prev) => ({ ...prev, phone: !prev.phone }))}>
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
          <button onClick={() => setEditing((prev) => ({ ...prev, address: !prev.address }))}>
            {editing.address ? "Cancel" : "Edit"}
          </button>
        </div>

        {profileData.role === "seller" && (
          <div className="bank-details">
            <h3>Your Bank Details</h3>
            {editing.bank ? (
              <>
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
              </>
            ) : (
              <>
                <p><strong>Account Number:</strong> {profileData.accountNumber || "Not added"}</p>
                <p><strong>IFSC Code:</strong> {profileData.ifscCode || "Not added"}</p>
                <p><strong>Bank Name:</strong> {profileData.bankName || "Not added"}</p>
              </>
            )}
            <button
             onClick={() => setEditing((prev) => ({ ...prev, bank: !prev.bank }))}
             className={`edit-bank-btn ${editing.bank ? "cancel" : ""}`}
            >
                  {editing.bank ? "Cancel" : "Edit Bank Details"}
             </button>
          </div>
        )}

        <button className="save-btn" onClick={saveChanges}>
          Save All Changes
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;