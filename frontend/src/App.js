import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Register from './pages/Register';

// --- Segurança ---
import Login from './pages/Login'; 
import ProtectedRoute from './ProtectedRoute';

// --- Public Pages (Vitrine) ---
import Home from './pages/Home';
import Services from './pages/Services';
import Products from './pages/Products';
import Cart from './pages/Cart';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

// --- Admin Pages (Painel Restrito) ---
import AdminDashboard from './pages/admin/Dashboard';
import AdminAppointments from './pages/admin/Appointments';
import AdminServices from './pages/admin/Services';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminCustomers from './pages/admin/Customers';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes (Qualquer pessoa acessa) */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/payment/pending" element={<PaymentSuccess pending />} />
          
          {/* Rota de Login */}
          <Route path="/login" element={<Login />} />
            
          <Route path="/register" element={<Register />} />

          {/* Admin Routes (PROTEGIDAS - Só entra com o Token de Admin) */}
          <Route path="/admin" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute><AdminAppointments /></ProtectedRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedRoute><AdminServices /></ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute><AdminProducts /></ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute><AdminOrders /></ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute><AdminCustomers /></ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
