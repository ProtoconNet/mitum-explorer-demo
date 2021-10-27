import React, { Component } from "react";
import ActiveContent from "./ActiveContent";
import "./DetailCard.scss";
import message from '../../lib/message.json';
import { key } from "../../lib";

class DetailCard extends Component {

  listComponent(item) {
    const title = item[0];
    const content = item[1];

    const titleFunc = item.length >= 3 && item[2] && Array.isArray(item[2]) && item[2][0] ? item[2][0] : null;
    const contentFunc = item.length >= 3 && item[2] && Array.isArray(item[2]) && item[2][1] !== null ? item[2][1] : null;

    const contentType = typeof content;

    if (
      contentType === "string" ||
      contentType === "number" ||
      content === null
    ) {
      return (
        <li id="main-li" key={key()}>
          <h3 className={titleFunc ? "active" : null} id="main-title"
            onClick={() => titleFunc ? titleFunc(title) : {}}>{title}</h3>
          <p className={contentFunc ? "active" : null} id="main-content"
            onClick={() => contentFunc ? contentFunc(content) : {}}>
            {content || content === 0 ? content : message.replace.null}
          </p>
        </li>
      );
    }
    else if (contentType === "object" && Object.prototype.hasOwnProperty.call(content, "msg")) {
      return (
        <li id="main-li" key={key()}>
          <h3 className={titleFunc ? "active" : null} id="main-title"
            onClick={() => titleFunc ? titleFunc(title) : {}}>{title}</h3>
          <p className={contentFunc ? "active" : null} id="main-content"
            onClick={() => contentFunc ? contentFunc(content) : {}}>
            {content && Object.prototype.hasOwnProperty.call(content, "msg") ? content.msg : message.replace.null}
          </p>
        </li>
      )
    }
    else {
      return (
        <li id="main-li" key={key()}>
          <h3 className={titleFunc ? "active" : null} id="main-title"
            onClick={() => titleFunc ? titleFunc(title) : {}}>{title}</h3>
          <ul id="sub-ul">
            {content ? content.map((x) => this.subListComponent(x)) : false}
          </ul>
        </li>
      );
    }
  }

  subListComponent(item) {
    return <ActiveContent item={item} />
  }

  render() {
    const { items } = this.props;

    return (
      <ul id="main-ul">
        {items.map((item) => item ? this.listComponent(item) : false)}
      </ul>
    );
  }
}

export default DetailCard;
