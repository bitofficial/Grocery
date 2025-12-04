import React from "react";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="groc-footer bg-white text-dark pt-5 mt-5">
      <div className="container " style={{width:"100%"}}>
        <div className="row gy-5" style={{width:"100%",display:"flex",padding:"10px"}}>
          {/* Brand + short text */}
          <div className="col-md-4" style={{margin:"30px"}} >
            <div className="d-flex align-items-center mb-3">
              <div className="groc-footer-logo-circle me-2">
                <span className="groc-footer-logo-letter">G</span>
              </div>
              <div>
                <h5 className="mb-0 groc-footer-brand-name">GroCart</h5>
                <small className="text-muted">Your daily fresh grocery store</small>
              </div>
            </div>
            <p className="groc-footer-text">
              Order farm-fresh fruits, veggies, dairy and more, delivered to your
              doorstep in minutes.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <span className="groc-footer-badge">✓ Same-day delivery</span>
              <span className="groc-footer-badge">✓ 100% fresh</span>
            </div>
          </div>


          {/* Newsletter */}
          <div className="col-md-4" style={{margin:"30px"}}  >
            <h6 className="groc-footer-title">Stay updated</h6>
            <p className="groc-footer-text">
              Get exclusive offers, new arrivals, and healthy recipes in your inbox.
            </p>
            <div className="groc-footer-contact mt-3" style={{display:"block"}}>
              <small className="text-muted d-block">
                 +91-98765-43210
              </small><br/>
              <small className="text-muted d-block">
                 Email: <span>grocart@gmail.com</span>
              </small>
              <br/>
              <small className="text-muted d-block">
                 Delivering across your city
              </small>
            </div>
          </div>
        </div>

        <hr className="mt-4 mb-3 groc-footer-divider" />

        <div className="d-flex flex-column flex-md-row align-items-center pb-3 gap-2" style={{display:"flex",justifyContent:"center"}}>
          <small className="text-muted">
            © {new Date().getFullYear()} GroCart. All rights reserved.
          </small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;