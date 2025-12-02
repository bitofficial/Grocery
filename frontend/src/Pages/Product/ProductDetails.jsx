import React, { useEffect, useState } from "react";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getSingleProductAction } from "../../Redux/Actions/productAction";
import Loader from "../../Components/Loader/Loader";
import { addToCartAction } from "../../Redux/Actions/cartAction";
import "./Product.css";

const ProductDetails = () => {
  const dispatch = useDispatch();
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(0.5);

  const { loading, product, error } = useSelector((state) => state.getSingleProduct);
  const { cartItems } = useSelector((state) => state.userCart);

  useEffect(() => {
    if (productId) dispatch(getSingleProductAction(productId));
  }, [dispatch, productId]);

  const AddToCart = (id) => {
    dispatch(addToCartAction(id, quantity));
  };

  return (
    <>
      <Header />
      {loading ? (
        <Loader LoadingName={"Fetching Product"} />
      ) : error ? (
        <div style={{ padding: 40 }}>
          <h2>Product not found</h2>
        </div>
      ) : (
        <div className="products-container">
          <h1 className="Heading regHeading">
            Product <span>Details</span>
          </h1>

          {product && (
            <div className="product-detail-box">
              <div className="product-detail-image">
                <img src={product.url} alt={product.name} />
              </div>

              <div className="product-detail-info">
                <h2>{product.name}</h2>
                <p className="price">₹ {product.rate}/Kg</p>
                <p>
                  <strong>Category:</strong> {product.category}
                </p>
                <p>
                  <strong>Stocks:</strong> {product.stocks}
                </p>

                <div className="product-qty">
                  {product.stocks <= 0 ? (
                    <h5 className="product-out-of-stock">OUT OF STOCK</h5>
                  ) : (
                    <>
                      <select onChange={(e) => setQuantity(e.target.value)}>
                        {product.kilogramOption &&
                          product.kilogramOption.map((weight, idx) => {
                            const val =
                              weight && weight.$numberDecimal
                                ? weight.$numberDecimal
                                : weight;
                            const label =
                              weight && weight.$numberDecimal
                                ? `${weight.$numberDecimal} Kg`
                                : `${weight}`;
                            return (
                              <option key={idx} value={val}>
                                {label}
                              </option>
                            );
                          })}
                      </select>

                      <button onClick={() => AddToCart(product._id)}>
                        Add to cart
                      </button>
                    </>
                  )}
                </div>

                {cartItems.map((item) =>
                  item.name === product.name ? (
                    <p key={item._id} className="in-cart-qty">
                      {item.quantity} kg in cart
                    </p>
                  ) : (
                    ""
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <Footer />
    </>
  );
};

export default ProductDetails;
