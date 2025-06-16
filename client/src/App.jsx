import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/signup/signup.jsx";
import Login from "./pages/login/login.jsx";
import BuyerLayout from "./pages/BuyerComponents/BuyerLayout/BuyerLayout.jsx"; 
import BuyerDashboard from "./pages/BuyerComponents/BuyerDashboard/buyer-dashboard.jsx";
import SellerDashboard from "./pages/SellerComponents/SellerDashboard/seller-dashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard/admin-dashboard.jsx";
import CreateAuction from './pages/SellerComponents/CreateAuctions/CreateAuction';
import SellerAuctions from './pages/SellerComponents/SellerAuction/SellerAuctions.jsx';
import EditAuction from './pages/SellerComponents/EditAuction/edit-auction.jsx';  
import SellerAnalytics from './pages/SellerComponents/SellerAnalytic/SellerAnalytics.jsx';
import AuctionDetails from './pages/BuyerComponents/AuctionDetail/AuctionDetail'; 
import LiveAuctions from "./pages/BuyerComponents/LiveAuctions/LiveAuctions";
import ChatBox from "./pages/chats/ChatBox.jsx"; 
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute'; 
import MyBids from "./pages/BuyerComponents/MyBids/MyBids";
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />         
        <Route path="/login" element={<Login />} />   

        {/* Buyer routes using layout */}
        <Route path="/buyer-dashboard" element={<BuyerLayout />}>
            <Route index element={<BuyerDashboard />} />            
           <Route path="chat" element={<ChatBox />} />             
           <Route path="my-bids" element={<MyBids />} />  
            <Route path="live-auctions" element={<LiveAuctions />} />  
           <Route path="auction/:auctionId" element={<AuctionDetails />} />
         </Route>

        {/* Protected seller route */}
        <Route
          path="/seller-dashboard"
          element={
            <ProtectedRoute requiredRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Other direct routes */}
        <Route path="/auction/:auctionId" element={<AuctionDetails />} /> 
        <Route path="/create-auction" element={<CreateAuction />} />
        <Route path="/seller-auctions" element={<SellerAuctions />} />
        <Route path="/edit-auction/:id" element={<EditAuction />} />
        <Route path="/seller-analytics" element={<SellerAnalytics />} /> 
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
}

export default App;