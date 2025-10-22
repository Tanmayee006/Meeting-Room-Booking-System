import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Scheduler from "./pages/Scheduler";
import Bookings from "./pages/Bookings";
import Header from "./components/Header";

export default function App() {
  const location = useLocation();
  const hideHeader = location.pathname === "/" || location.pathname === "/register";

  return (
    <div className="app-root">
      {!hideHeader && <Header />}
      <main className="container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/scheduler" element={<Scheduler />} />
          <Route path="/bookings" element={<Bookings />} />
        </Routes>
      </main>
    </div>
  );
}