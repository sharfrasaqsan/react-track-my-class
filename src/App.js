import "./App.css";
import { Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import EditClass from "./pages/EditClass";
import AddClass from "./pages/AddClass";
import Profile from "./pages/Profile";
import Class from "./pages/Class";

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
      <Navbar />

      <div>
        <main>
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-class"
              element={
                <ProtectedRoute>
                  <AddClass />
                </ProtectedRoute>
              }
            />

            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <Class />
                </ProtectedRoute>
              }
            />

            <Route
              path="/classes/edit/:id"
              element={
                <ProtectedRoute>
                  <EditClass />
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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      <Footer />

      <Toaster />
    </div>
  );
}

export default App;
