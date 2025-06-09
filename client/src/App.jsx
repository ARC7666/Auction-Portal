// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Signup from "./pages/signup/signup.jsx";
import Login from "./pages/login/login.jsx";
import BuyerDashboard from "./pages/BuyerComponents/BuyerDashboard/buyer-dashboard.jsx";
import SellerDashboard from "./pages/SellerComponents/SellerDashboard/seller-dashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard/admin-dashboard.jsx";
import CreateAuction from './pages/SellerComponents/CreateAuctions/CreateAuction';
import SellerAuctions from './pages/SellerComponents/SellerAuction/SellerAuctions.jsx';
import EditAuction from './pages/SellerComponents/EditAuction/edit-auction.jsx';  
import SellerAnalytics from './pages/SellerComponents/SellerAnalytic/SellerAnalytics.jsx';
import AuctionDetails from './pages/BuyerComponents/AuctionDetail/AuctionDetail'; 
import ChatBox from "./pages/chats/ChatBox.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />         
        <Route path="/login" element={<Login />} />   
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} /> 
        <Route path="/auction/:auctionId" element={<AuctionDetails />} /> 
        <Route path="/ChatBox" element={<ChatBox />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />  
        <Route path="/create-auction" element={<CreateAuction />} />
        <Route path="/seller-auctions" element={<SellerAuctions />} />
        <Route path="/edit-auction/:id" element={<EditAuction />} />
        <Route path="/seller-analytics" element={<SellerAnalytics />} /> 
      </Routes>
    </Router>
  );
}

export default App;