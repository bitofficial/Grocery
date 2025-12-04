import './App.css'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Pages
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ViewProducts from './pages/ViewProducts.jsx'
import AdminProducts from './pages/AdminProducts.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ChangePassword from './pages/ChangePassword.jsx'
import MyAccount from './pages/MyAccount.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderHistory from './pages/OrderHistory.jsx'
import Home from './pages/Home.jsx'
import Footer from './components/Footer.jsx'

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home/>} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 2. ADDED VIEW PRODUCTS ROUTE (It was imported but unused) */}
          <Route path="/products" element={<ViewProducts />} />

          {/* 3. PROTECTED THE ORDER HISTORY ROUTE */}
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change_password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my_account"
            element={
              <ProtectedRoute>
                <MyAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          
          {/* 404 Page */}
          <Route 
            path="*" 
            element={
              <div style={{ padding: '2rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ marginBottom: '1rem' }}>404 - Page Not Found</h1>
                <p className="muted" style={{ marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
                <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', padding: '0.875rem 2rem' }}>
                  Go to Products
                </Link>
              </div>
            } 
          />
        </Routes>
      </div>
      <Footer/>
    </div>
  )
}

export default App