import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Scheduler from "./pages/Scheduler";
import BookRoom from "./pages/BookRoom";
import Bookings from "./pages/Bookings";
import Header from "./components/Header";

export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/scheduler" element={<Scheduler />} />
          <Route path="/book/:roomId" element={<BookRoom />} />
          <Route path="/bookings" element={<Bookings />} />
        </Routes>
      </main>
    </div>
  );
}