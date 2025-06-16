import React, { useEffect } from "react";
import { Header } from "../components/Header/Header";
import Hero from "../components/Hero/Hero";
import { CategorySlider } from "../components/CategorySlider/CategorySlider";
import { ProductList } from "../components/ProductList/ProductList";
import { Process } from "../components/Process/Process";
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;

        if (role === "buyer") navigate("/buyer-dashboard", { replace: true });
        else if (role === "seller") navigate("/seller-dashboard", { replace: true });
        else if (role === "admin") navigate("/admin-dashboard", { replace: true });
        else navigate("/", { replace: true });
      }
    });

    return () => unsubscribe(); // cleanup
  }, [navigate]);

  return (
    <div style={{ overflowY: "auto", height: "100%", maxHeight: "100vh" }}>
      <Header />
      <Hero />
      <CategorySlider />
      <ProductList />
      <Process />
    </div>
  );
}

export default Home;