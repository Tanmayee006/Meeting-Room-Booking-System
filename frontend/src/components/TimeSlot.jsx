import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <nav>
        <Link to="/">Rooms</Link>
        {" | "}
        <Link to="/bookings">Bookings</Link>
      </nav>
    </header>
  );
}
