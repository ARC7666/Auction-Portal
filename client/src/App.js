// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/signup/signup.jsx";
import Login from "./pages/login/login.jsx";
import BuyerDashboard from "./pages/BuyerDashboard/buyer-dashboard.jsx";
import SellerDashboard from "./pages/SellerComponents/SellerDashboard/seller-dashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard/admin-dashboard.jsx";
import CreateAuction from './pages/SellerComponents/CreateAuctions/CreateAuction';
import SellerAuctions from './pages/SellerComponents/SellerAuction/SellerAuctions.jsx';
import EditAuction from './pages/SellerComponents/EditAuction/edit-auction.jsx';  
import SellerAnalytics from './pages/SellerComponents/SellerAnalytic/SellerAnalytics.jsx';
import Chats from './pages/chats/chats.jsx';


//   React Router DOM is a library used to enable routing in React apps.
//   It allows us to navigate between different components and pages (like Login, Signup, Dashboard) without reloading the page.

//   BrowserRouter wraps the whole app to enable routing functionality.
//   It keeps the UI in sync with the URL in the browser.

function App() {
return (
  <Router>
    <Routes>
    <Route path="/" element={<Signup />} />         
    <Route path="/login" element={<Login />} />   
    <Route path="/buyer-dashboard" element={<BuyerDashboard />} />   
    <Route path="/seller-dashboard" element={<SellerDashboard />} />  
    <Route path="/create-auction" element={<CreateAuction />} />
    <Route path="/seller-auctions" element={<SellerAuctions />} />
    <Route path="/edit-auction/:id" element={<EditAuction />} />
    <Route path="/seller-analytics" element={<SellerAnalytics />} /> 
    <Route path="/chats" element={<Chats />} /> 
    <Route path="/admin-dashboard" element={<AdminDashboard />} />   
   </Routes>
</Router>
  );
}

export default App;