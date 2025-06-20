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
import SellerLayout from './pages/SellerComponents/SellerLayout/SellerLayout.jsx';
import SellerChats from "./pages/SellerComponents/SellerChats/SellerChats";
import SellerAnalytics from './pages/SellerComponents/SellerAnalytic/SellerAnalytics.jsx';
import AuctionDetails from './pages/BuyerComponents/AuctionDetail/AuctionDetail'; 
import LiveAuctions from "./pages/BuyerComponents/LiveAuctions/LiveAuctions";
import ChatRoom from "./pages/chats/ChatRoom.jsx"; 
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute'; 
import MyBids from "./pages/BuyerComponents/MyBids/MyBids";
import { ProductList } from "./components/ProductList/ProductList";
import PaymentPage from "./pages/BuyerComponents/BuyerPayment/PaymentPage";
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<ProductList />} />
        <Route path="/signup" element={<Signup />} />         
        <Route path="/login" element={<Login />} />   

        {/* Buyer routes using layout */}
        <Route path="/buyer-dashboard" element={<BuyerLayout />}>
            <Route index element={<BuyerDashboard />} />            
           <Route path="/buyer-dashboard/chat/:auctionId" element={<ChatRoom />} />             
           <Route path="my-bids" element={<MyBids />} />  
            <Route path="live-auctions" element={<LiveAuctions />} />  
           <Route path="auction/:auctionId" element={<AuctionDetails />} />
          
         </Route>
          <Route path="payment/:auctionId" element={<PaymentPage />} />

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
   
        

       <Route path="/seller-dashboard-layout" element={<SellerLayout />}>
       <Route path="edit-auction/:id" element={<EditAuction />} />
         <Route path="seller-auctions" element={<SellerAuctions />} />
         <Route path="chat" element={<SellerChats />} />
          <Route path="chat/:auctionId" element={<ChatRoom />} />
       </Route>
        
        <Route path="/seller-analytics" element={<SellerAnalytics />} /> 
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
}

export default App;