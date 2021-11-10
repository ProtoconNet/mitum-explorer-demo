import React, { Component } from "react";
import ActiveContent from "./ActiveContent";
import "./DetailCard.scss";
import message from '../../lib/message.json';
import { key } from "../../lib";

class DetailCard extends Component {

  listComponent(item, idx) {
    const title = item[0];
    const content = item[1];

    const titleFunc = item.length >= 3 && item[2] && Array.isArray(item[2]) && item[2][0] ? item[2][0] : null;
    const contentFunc = item.length >= 3 && item[2] && Array.isArray(item[2]) && item[2][1] !== null ? item[2][1] : null;

    const contentType = typeof content;

    if(!item) {
      return false;
    }

    if (
      contentType === "string" ||
      contentType === "number" ||
      content === null
    ) {
      return (
        <li id="main-li" key={key()}>
          <h3 key={key()} className={titleFunc ? "active" : null} id="main-title"
            onClick={() => titleFunc ? titleFunc(title) : {}}>{title}</h3>
          <p key={key()} className={contentFunc ? "active" : null} id="main-content"
            onClick={() => contentFunc ? contentFunc(content) : {}}>
            {content || content === 0 ? content : message.replace.null}
          </p>
        </li>
      );
    }
    else {
      return (
        <li id="main-li" key={key()}>
          <h3 key={key()} className={titleFunc ? "active" : null} id="main-title"
            onClick={() => titleFunc ? titleFunc(title) : {}}>{title}</h3>
          <ul key={key()} id="sub-ul">
            {content ? content.map((x) => this.subListComponent(x, idx)) : false}
          </ul>
        </li>
      );
    }
  }

  subListComponent(item, idx) {
    if(!item) {
      return false;
    }
    return <ActiveContent key={key()} item={item} isTitleImportant={idx === this.props.keyIndex}/>
  }

  render() {
    const { items, isShowActive, isHideActive } = this.props;

    return (
      <ul className="main-ul" id={isShowActive ? 'show' : isHideActive ? 'hide' : ''}>
        {items.map((item, idx) => item ? this.listComponent(item, idx) : false)}
      </ul>
    );
  }
}

export default DetailCard;
