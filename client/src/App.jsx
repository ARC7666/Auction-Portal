import React from "react";
import { auth } from './firebase/firebaseConfig';
import { Navigate } from "react-router-dom";
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
import AuctionDetails from './pages/BuyerComponents/AuctionDetail/AuctionDetail';
import LiveAuctions from "./pages/BuyerComponents/LiveAuctions/LiveAuctions";
import ChatRoom from "./pages/chats/ChatRoom.jsx";
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import MyBids from "./pages/BuyerComponents/MyBids/MyBids";
import { ProductList } from "./components/ProductList/ProductList";
//import PaymentPage from "./pages/BuyerComponents/BuyerPayment/PaymentPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import CalenderPage from "./pages/Calender/CalenderPage";
import AdminUsers from "./pages/AdminDashboard/users/AdminUsers";
import AdminLogs from "./pages/AdminDashboard/logs/AdminLogs";
import PaymentSuccess from "./pages/BuyerComponents/BuyerPayment/PaymentSuccess";
import RedirectIfLoggedIn from "./components/RedirectIfLoggedIn";
//import AdminAuctions from "./pages/AdminDashboard/auctions/AdminAuctions";
//import AdminReports from "./pages/AdminDashboard/reports/AdminReports";
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminAllAuctions from "./pages/AdminDashboard/auctions/AdminAllAuctions";
import NotFound from "./components/ErrorPage/NotFound";
import Working from "./pages/AdminDashboard/Working/Working";



function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            auth.currentUser ? <Navigate to="/buyer-dashboard" replace /> : <Home />
          }
        />
        <Route path="/product" element={<ProductList />} />

        <Route
          path="/login"
          element={
            <RedirectIfLoggedIn>
              <Login />
            </RedirectIfLoggedIn>
          }
        />

        <Route
          path="/signup"
          element={
            <RedirectIfLoggedIn>
              <Signup />
            </RedirectIfLoggedIn>
          }
        />

        <Route path="/buyer-dashboard" element={<BuyerLayout />}>
          <Route index element={<BuyerDashboard />} />
          <Route path="/buyer-dashboard/chat/:auctionId" element={<ChatRoom />} />
          <Route path="my-bids" element={<MyBids />} />
          <Route path="live-auctions" element={<LiveAuctions />} />
          <Route path="auction/:auctionId" element={<AuctionDetails />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="calender" element={<CalenderPage />} />
        </Route>

        <Route path="/payment-success/:auctionId" element={<PaymentSuccess />} />

        <Route path="/auction/:auctionId" element={
          <BuyerLayout>
            <AuctionDetails />
          </BuyerLayout>
        } />
        {/*  seller route */}
        <Route
          path="/seller-dashboard"
          element={
            <ProtectedRoute requiredRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

  
        <Route path="/seller-dashboard-layout" element={<SellerLayout />}>
          <Route path="create-auction" element={<CreateAuction />} />
           <Route path="edit-auction/:id" element={<EditAuction />} />
          <Route path="seller-auctions" element={<SellerAuctions />} />
          <Route path="chat" element={<SellerChats />} />
          <Route path="chat/:auctionId" element={<ChatRoom />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

  
        
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-dashboard/logs" element={<ProtectedRoute requiredRole="admin"><AdminLogs /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/working" element={<ProtectedRoute requiredRole="admin"><Working /></ProtectedRoute>} />
        <Route path="/admin/auctions" element={<ProtectedRoute requiredRole="admin"><AdminAllAuctions /></ProtectedRoute>} />
        {/*  <Route path="/admin/auctions" element={<AdminAuctions />} />*?}
      {/*  <Route path="/admin/reports" element={<AdminReports />} />*/}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;