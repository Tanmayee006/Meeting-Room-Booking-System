import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import BookRoom from "./pages/BookRoom";
import Bookings from "./pages/Bookings";
import Header from "./components/Header";

export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:roomId" element={<BookRoom />} />
          <Route path="/bookings" element={<Bookings />} />
        </Routes>
      </main>
    </div>
  );
}
