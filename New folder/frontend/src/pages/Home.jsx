import React from "react";
import "../styles/home.css";
import img1 from "../assets/banana.jpeg"
import banner from "../assets/banner.jpg"
import { Link } from "react-router-dom";

const Home = () => {
  const topProducts = [
    {
      name: "Citrus Lemon Drink",
      label: "Fresh Fruit",
      price: "",
      img: img1,
    },
    {
      name: "Dark Choco Mix",
      label: "Fresh Fruit",
      price: "",
      img: img1,
    },
    {
      name: "Berry Fusion Pack",
      label: "Fresh Fruit",
      price: "",
      img: img1,
    },
    {
      name: "Detox Juice Combo",
      label: "Fresh Fruit",
      price: "",
      img: img1,
    },
  ];

  const featuredProducts = [
    {
      name: "Pure Pineapple",
      tag: "Oranges",
      price: "",
      oldPrice: "",
      img: img1,
    },
    {
      name: "Fresh Apple",
      tag: "Oranges",
      price: "",
      oldPrice: "",
      img: img1,
    },
    {
      name: "Green Spinach",
      tag: "Vegetables",
      price: "",
      oldPrice: "",
      img: img1,
    },
    {
      name: "Citrus Mix",
      tag: "Oranges",
      price: "",
      oldPrice: "",
      img: img1,
    },
  ];

  return (
    <div className="og-page-wrapper" style={{marginTop:"80px"}}>
      {/* HERO */}
      <section className="og-hero-section flex">
        <div className="container">
          <div className="row align-items-center" style={{display:"flex",justifyContent:"space-between"}}>
            {/* Left text */}
            <div className="col-lg-6 mb-4 mb-lg-0">
              <p className="og-hero-badge">Fresh &amp; Healthy</p>
              <h1 className="og-hero-title">🛒 Fresh & Fast</h1>
              <p className="og-hero-subtitle">
                Fresh grocery delivered directly to your
                doorstep.
                Premium groceries delivered in minutes • 100% Fresh Guarantee
              </p>
              <Link to="/products" className="btn og-hero-btn">Shop Now</Link>
            </div>

            {/* Right image */}
            <div className="col-lg-6 text-center">
              <div className="og-hero-image-wrapper">
                <div className="og-hero-circle" />
                <img
                  src={banner}
                  alt="Fresh vegetables basket"
                  className="img-fluid og-hero-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFO STRIP */}
      <section className="og-info-strip">
        <div className="container" style={{width:"90%"}}>
          <div className="row text-center " style={{width:"100%",display:"flex",justifyContent:"space-around"}}>
            <div className="col-md-4 mb-3 mb-md-0" >
              <div className="og-info-item">
                <div className="og-info-icon "><span style={{zoom:"1.3"}}>🚚</span></div>
                <h5>Free Shipping</h5>
                <p>For all order over ₹99</p>
              </div>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="og-info-item">
                <div className="og-info-icon" ><span style={{zoom:"1.3"}}>📦</span></div>
                <h5>Delivery On Time</h5>
                <p>Quick & reliable delivery</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="og-info-item">
                <div className="og-info-icon" ><span style={{zoom:"1.3"}}>💸</span></div>
                <h5>Secure Payment</h5>
                <p>100% secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;