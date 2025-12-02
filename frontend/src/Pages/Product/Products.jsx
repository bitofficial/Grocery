import React from "react";
import "./Product.css";
import Header from "../../Components/Header/Header";
import { BsCartXFill } from "react-icons/bs";
import { FaCartPlus } from "react-icons/fa";
import Footer from "../../Components/Footer/Footer";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProductsAction } from "../../Redux/Actions/productAction";
import Loader from "../../Components/Loader/Loader";
import { addToCartAction } from "../../Redux/Actions/cartAction";
import { useState } from "react";
import { getAllCategoryAction } from "../../Redux/Actions/categoryAction";
import NotFoundCart from "../../Components/NotFoundCart/NotFoundCart";
import { useParams, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

const Products = () => {
  const dispatch = useDispatch();
  const [headingCategory, setHeadingCategory] = useState("Products");
  const [searchParams, setSearchParams] = useSearchParams();

  //Get Product From State
  const {
    loading,
    products,
    productsCount,
    error: productError,
  } = useSelector((state) => state.getAllProducts);

  //Get Category From State
  const {
    loading: categoryLoading,
    Categories,
    success,
    error: categoryError,
  } = useSelector((state) => state.getAllCategory);

  //Get Cart Item
  const { cartItems } = useSelector((state) => state.userCart);

  //Filter Product
  const [FilterCategory, setFilterCategory] = useState([]);
  const [price, setPrice] = useState("");
  const [ApplyError, setApplyError] = useState();
  const [clearFilter, setClearFilter] = useState(false);

  const ApplyFilterBtnClick = () => {
    // If no filters selected, show error
    if ((price === "" || price === undefined) && FilterCategory.length === 0) {
      setApplyError("Please Select Filters..!!");
      setTimeout(() => {
        setApplyError(undefined);
      }, 5000);
      return;
    }

    // If user selected filters, apply them
    const categoryString = FilterCategory.length > 0 ? FilterCategory.join(",") : "";
    dispatch(getAllProductsAction(price, categoryString));
    setFilterCategory([]);
    setApplyError();
    setClearFilter(true);
    setHeadingCategory("Products");
  };

  //Clear Filter
  const clearFilterBtnClick = () => {
    if (clearFilter) {
      dispatch(getAllProductsAction());
      dispatch(getAllCategoryAction());
      setClearFilter(false);
      setHeadingCategory("Products");
    }
  };

  //Reset Filters (clears all filters and shows all products)
  const resetFiltersBtnClick = () => {
    setFilterCategory([]);
    setPrice("");
    setApplyError();
    dispatch(getAllProductsAction());
    dispatch(getAllCategoryAction());
    setClearFilter(false);
    setHeadingCategory("Products");
  };

  //Add Product To Cart
  const [quantity, setQuantity] = useState(0.5);
  const AddToCart = (id) => {
    dispatch(addToCartAction(id, quantity));
  };

  //Get Search Keyword && Category
  const { keyword } = useParams();
  const categoryId = searchParams.get("categoryId");
  const categoryName = searchParams.get("categoryName");

  useEffect(() => {
    document.title = `Fresh Products`;
    if (keyword) {
      dispatch(getAllProductsAction(price, FilterCategory, keyword));
      dispatch(getAllCategoryAction());
      setHeadingCategory("Product");
    } else if (categoryId) {
      // `categoryName` is provided in the search params and the backend
      // products use names for `category` in the file DB, so pass the
      // name (not the id) when filtering
      dispatch(getAllProductsAction(price, categoryName, keyword));
      dispatch(getAllCategoryAction());
      setHeadingCategory(categoryName);
    } else {
      dispatch(getAllProductsAction());
      dispatch(getAllCategoryAction());
      setHeadingCategory("Products");
    }
  }, [keyword, categoryId]);

  return (
    <>
      <Header />
      {(loading && categoryLoading) || loading ? (
        <Loader LoadingName={"Fetching Products"} />
      ) : (
        <div className="products-container">
          <h1 className="Heading regHeading">
            Fresh <span>{headingCategory}</span>
          </h1>
          {productError || categoryError ? (
            <>
              <NotFoundCart msg={"Something Went's To Wrong"} />
              <br />
            </>
          ) : (
            <>
              <div className="products-filter-strip" id="filter-section">
                <div className="filter-strip-content">
                  <div className="filter-item">
                    <label>Categories:</label>
                    <select 
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setFilterCategory([]);
                        } else {
                          setFilterCategory(
                            FilterCategory.includes(value)
                              ? FilterCategory.filter((c) => c !== value)
                              : [...FilterCategory, value]
                          );
                        }
                      }}
                    >
                      <option value="">
                        {FilterCategory.length > 0 
                          ? `${FilterCategory.length} Selected` 
                          : "All Categories"}
                      </option>
                      {Categories &&
                        Categories.map((category) => (
                          <option key={category._id} value={category.categoryName}>
                            {FilterCategory.includes(category.categoryName) ? "✓ " : ""}
                            {category.categoryName}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="filter-item">
                    <label>Price Range:</label>
                    <select onChange={(e) => setPrice(e.target.value)}>
                      <option value="">All Prices</option>
                      <option value="0-20">₹0-20</option>
                      <option value="20-40">₹20-40</option>
                      <option value="40-60">₹40-60</option>
                      <option value="60-80">₹60-80</option>
                      <option value="80-100">₹80-100</option>
                      <option value="100-120">₹100-120</option>
                    </select>
                  </div>

                  <div className="filter-actions-strip">
                    <button className="btn-apply-strip" onClick={ApplyFilterBtnClick}>
                      Apply
                    </button>
                    <button 
                      className="btn-reset-strip" 
                      onClick={resetFiltersBtnClick}
                      // disabled={FilterCategory.length === 0 && price === ""}
                    >
                      Reset
                    </button>
                    {clearFilter && (
                      <button className="btn-clear-strip" onClick={clearFilterBtnClick}>
                        Clear All
                      </button>
                    )}
                  </div>

                  {ApplyError && (
                    <div className="filter-error-strip">{ApplyError}</div>
                  )}
                </div>
              </div>

              <div className="products-list">
                {products.length !== 0 ? (
                  <div className="products-list-box">
                    {products &&
                      products.map((product) => {
                        return (
                          <div className="product-cart" key={product._id}>
                            {cartItems.map((item) => {
                              return item.name === product.name ? (
                                <span className="product-cart-item-qty">
                                  {item.quantity} kg in cart
                                </span>
                              ) : (
                                ""
                              );
                            })}

                              <Link to={`/product/${product._id}`} className="product-link">
                                <img src={product.url} alt="" />
                                <h2>{product.name}</h2>
                                <div className="price">₹ {product.rate}/Kg</div>
                              </Link>
                            <div className="product-qty">
                              {product.stocks <= 0 ? (
                                <h5 className="product-out-of-stock">
                                  OUT OF STOCK {""}
                                  <BsCartXFill />
                                </h5>
                              ) : (
                                <>
                                  <select
                                    onChange={(e) => {
                                      setQuantity(e.target.value);
                                    }}
                                  >
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
                                  <button
                                    onClick={() => {
                                      AddToCart(product._id);
                                    }}
                                  >
                                    <FaCartPlus />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <NotFoundCart msg={"Sorry Products Not Found"} />
                )}
              </div>
            </>
          )}
        </div>
      )}
      <Footer />
    </>
  );
};

export default Products;
