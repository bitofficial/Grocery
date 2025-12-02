import axios from "axios";
import { ADD_TO_CART, REMOVE_CART_ITEM } from "../Constants/cartConstants";

export const addToCartAction = (id, quantity) => async (dispatch, getState) => {
  const { data } = await axios.get(`/api/product/getSingleProduct/${id}`);
  //console.log("CART ACTION CALL");
  // Parse quantity to ensure it's numeric (handle both string and number inputs)
  const parsedQuantity = parseFloat(quantity) || 0;
  // Calculate total price: rate * quantity
  const totalPrice = data.product.rate * parsedQuantity;
  
  dispatch({
    type: ADD_TO_CART,
    payload: {
      id: data.product._id,
      name: data.product.name,
      rate: data.product.rate,
      stocks: data.product.stocks,
      kilogramOption: data.product.kilogramOption,
      image: data.product.url,
      quantity: parsedQuantity,
      totalPrice: totalPrice,
    },
  });
  localStorage.setItem(
    "userCart",
    JSON.stringify(getState().userCart.cartItems)
  );
};

export const removeCartItemAction = (id) => (dispatch, getState) => {
  dispatch({ type: REMOVE_CART_ITEM, payload: id });
  localStorage.setItem(
    "userCart",
    JSON.stringify(getState().userCart.cartItems)
  );
};
