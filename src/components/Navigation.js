import React from "react";
import { Link } from "react-router-dom";
import "./Navigation.scss";
import logo from "../images/logo_white.png";

export default function Navigation() {
  return (
    <header className="nav-container">
      <Link className="nav-title" to="/">
        <img id="logo" src={logo} alt="logo" />
        Protocon Explorer
      </Link>
      <nav className="nav-menu">
        <Link to="/blocks">Blocks</Link>
        <Link to="/operations">Operations</Link>
        <Link to="/accounts">Accounts</Link>
        <Link to="/currencies">Currencies</Link>
      </nav>
    </header>
  );
}
