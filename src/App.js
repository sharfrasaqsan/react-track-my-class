import { Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { Toaster } from "sonner";
import ProtectedRoute from "./utils/ProtectedRoute";

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
              <>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>

      <Footer />

      <Toaster />
    </div>
  );
}

export default App;
