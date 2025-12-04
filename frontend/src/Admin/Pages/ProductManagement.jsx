import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/ProductManagement.css";
import AdminSidebar from "../Components/AdminSidebar";
import AdminHeader from "../Components/AdminHeader";

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    rate: "",
    stocks: "",
    category: "",
    kilogramOption: [],
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [adminUser, setAdminUser] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/product/getAllProducts");
      const data = await res.json();
      setProducts(data.AllProducts || data.products || data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/category/get");
      const data = await res.json();
      setCategories(data.Categories || data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) setAdminUser(JSON.parse(storedUser));
    fetchProducts();
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "kilogramOption") {
      const arr = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setFormData((prev) => ({ ...prev, kilogramOption: arr }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product._id);
    setShowForm(true);
    setFormData({
      name: product.name || "",
      rate: product.rate || "",
      stocks: product.stocks || "",
      category: product.category || "",
      kilogramOption: Array.isArray(product.kilogramOption)
        ? product.kilogramOption
        : [],
      image: product.image || null,
    });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://localhost:8000/api/product/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchProducts();
      } else {
        console.error("Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.rate || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");

      const payload = {
        name: formData.name,
        rate: formData.rate,
        stocks: formData.stocks,
        category: formData.category,
        kilogramOption: formData.kilogramOption || ["0.5", "1"],
        image: formData.image || null,
      };

      let response;
      if (editingProduct) {
        response = await fetch(
          `http://localhost:8000/api/product/update/${editingProduct}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch("http://localhost:8000/api/product/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (response && response.ok) {
        alert(editingProduct ? "Product updated successfully" : "Product added successfully");
        setFormData({
          name: "",
          rate: "",
          stocks: "",
          category: "",
          kilogramOption: [],
          image: null,
        });
        setShowForm(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        const err = response ? await response.text() : "Unknown error";
        console.error("API error:", err);
        alert(editingProduct ? "Failed to update product" : "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding/updating product:", error);
      alert("Error adding/updating product");
    } finally {
      setLoading(false);
    }
    }
  return (
    <div className="admin-dashboard">
      <AdminSidebar activeTab="products" />
      <div className="admin-main-content">
        <AdminHeader adminUser={adminUser} />
        <div className="admin-content-area">
          <div className="products-management">
            <div className="management-header">
              <h2>Product Management</h2>
              <button
                className="btn-add-product"
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingProduct(null);
                  setFormData({
                    name: "",
                    rate: "",
                    stocks: "",
                    category: "",
                    kilogramOption: [],
                    image: null,
                  });
                }}
              >
                {showForm ? "Cancel" : "+ Add Product"}
              </button>
            </div>

            {showForm && (
              <form className="product-form" onSubmit={handleAddProduct}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (₹/Kg) *</label>
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Stock (Kg)</label>
                    <input
                      type="number"
                      name="stocks"
                      value={formData.stocks}
                      onChange={handleInputChange}
                      placeholder="Enter stock quantity"
                      step="0.5"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.categoryName}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Kilogram Options (comma separated)</label>
                    <input
                      type="text"
                      name="kilogramOption"
                      value={(formData.kilogramOption || []).join(", ")}
                      onChange={handleInputChange}
                      placeholder="e.g. 250g, 500g"
                    />
                  </div>
                  <div className="form-group">
                    <label>Product Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {formData.image && (
                      <div className="image-preview">
                        <img src={formData.image} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Product"}
                </button>
              </form>
            )}

            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price (₹)</th>
                    <th>Stock (Kg)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="5">Loading...</td></tr>}
                  {products.length === 0 && !loading && (
                    <tr><td colSpan="5">No products found</td></tr>
                  )}
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>₹{product.rate}</td>
                      <td>{product.stocks}</td>
                      <td>
                        <button
                          className="btn-edit"
                          onClick={() => alert("Edit feature coming soon")}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
