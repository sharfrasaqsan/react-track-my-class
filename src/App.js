import "./App.css";
import { Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

import ProtectedRoute from "./utils/ProtectedRoute";
import PublicRoute from "./utils/PublicRoute";

import { Toaster } from "sonner";

function App() {
  return (
    <div>
      <Header />

      <div>
        <Navbar />
      </div>

      <div>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
        </Routes>
      </div>

      <Footer />

      <Toaster />
    </div>
  );
}

export default App;
