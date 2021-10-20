import React from "react";
import "./Card.scss";

export default function Card({ title, children }) {
  return (
    <div className="card-container">
      <h2>{title}</h2>
      <section>{children}</section>
    </div>
  );
}
