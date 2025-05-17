// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./signup.jsx";
import Dashboard from "./dashboard.jsx";
import Login from "./login.jsx";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />         
        <Route path="/login" element={<Login />} />   
        <Route path="/dashboard" element={<Dashboard />} />   
      </Routes>
    </Router>
  );
}

export default App;