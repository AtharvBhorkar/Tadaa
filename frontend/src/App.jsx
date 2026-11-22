import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Mystery from "./pages/Mystery";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminProducts from "./pages/admin/AdminProducts";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route
              path="/mystery"
              element={
                <ProtectedRoute>
                  <Mystery />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute adminOnly>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}