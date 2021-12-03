import React from "react";
import "./Footer.scss";

function openTab(url) {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
}

export default function Footer() {
    const reload = () => {
        window.location.reload();
    }

    const copyrightText = process.env.REACT_APP_FOOTER_COPYRIGHT_TEXT;
    const copyrightLink = process.env.REACT_APP_FOOTER_COPYRIGHT_LINK;

    return (
        <div className="footer" onClick={() => reload()}>
            <footer>
                <div id="copyright">
                    <p>{`Copyright © 2021 `}</p>
                    <p id="copyright-link" onClick={() => openTab(copyrightLink)}>{copyrightText}</p>
                    <p>{` All rights reserved`}</p>
                </div>
            </footer>
        </div>
    );
}
