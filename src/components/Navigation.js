import React from "react";
import { Link } from "react-router-dom";
import "./Navigation.scss";
import logo from "../images/logo_white.png";
import message from "../lib/message.json";

export default function Navigation() {
  const reload = () => {
    window.location.reload();
  }

  return (
    <header className="nav-container" onClick={() => reload()}>
      <Link className="nav-title" to="/">
        <img id="logo" src={logo} alt="logo" />
        {message.title}
      </Link>
      <nav className="nav-menu">
        <Link to="/blocks">{message.menu.blocks}</Link>
        <Link to="/operations">{message.menu.operations}</Link>
        <Link to="/accounts">{message.menu.accounts}</Link>
        <Link to="/currencies">{message.menu.currencies}</Link>
      </nav>
    </header>
  );
}
