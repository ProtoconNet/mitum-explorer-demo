import React, { Component } from 'react';
import { key } from '../../lib';

class ActiveContent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showSubContent: false,
        }
    }

    render() {
        const { item } = this.props;
        const { showSubContent } = this.state;

        const title = item[0];
        const content = item[1];

        const titleFunc = item.length >= 3 && item[2] && Array.isArray(item[2]) && item[2][0] ? item[2][0] : null;
        const contentFunc = item.length >= 3 && item[2] && Array.isArray(item[2]) && item[2][1] ? item[2][1] : null;

        const isSubContentExist = item.length >= 3 && item[2] && typeof item[2] === "string";

        if (isSubContentExist) {
            return (
                <li className="active background" id="sub-li" key={key()} onClick={(() => this.setState({ showSubContent: !showSubContent }))}>
                    <section id="sub-section" style={{ margin: "0", padding: "0", width: "100%", height: "fit-content" }}>
                        <p id="sub-title">{title}</p>
                        <p id="sub-content">{content ? content : "-"}</p>
                    </section>
                    {
                        showSubContent
                            ? (
                                <pre>
                                    {item[2]}
                                </pre>
                            )
                            : false
                    }
                </li>
            );
        }

        return (
            <li className="inactive" id="sub-li" key={key()}>
                <p className={titleFunc ? "active" : null} id="sub-title"
                    onClick={() => titleFunc ? titleFunc(title) : {}}>{title}</p>
                <p className={contentFunc ? "active" : null} id="sub-content"
                    onClick={() => contentFunc ? contentFunc(content) : {}}>{content ? content : "-"}</p>
            </li>
        );
    }
}

export default ActiveContent;