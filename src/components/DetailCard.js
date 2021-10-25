import React, { Component } from "react";
import "./DetailCard.scss";

class DetailCard extends Component {
  listComponent(title, content) {
    const contentType = typeof content;
    if (
      contentType === "string" ||
      contentType === "number" ||
      content === null
    ) {
      return (
        <li id="main-li" key={title+content}>
          <h3 id="main-title">{title}</h3>
          <p id="main-content">
            {content || content === 0 ? content : "Not found"}
          </p>
        </li>
      );
    } else {
      
      return (
        <li id="main-li" key={title+content}>
          <h3 id="main-title">{title}</h3>
          <ul id="sub-ul">
            {content ? content.map((x) => this.subListComponent(x[0], x[1])) : false}
          </ul>
        </li>
      );
    }
  }

  subListComponent(title, content) {
    return (
      <li id="sub-li" key={title+content}>
        <p id="sub-title">{title}</p>
        <p id="sub-content">{content ? content : "-"}</p>
      </li>
    );
  }

  render() {
    const { items } = this.props;

    return (
      <ul id="main-ul">
        {items.map((item) => item ? this.listComponent(item[0], item[1]) : false)}
      </ul>
    );
  }
}

export default DetailCard;
