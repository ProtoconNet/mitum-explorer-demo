import React from "react";
import "./Footer.scss";

export default function Navigation() {
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
                    <p id="copyright-link" onClick={() => window.location.href = copyrightLink}>{copyrightText}</p>
                    <p>{` All rights reserved`}</p>
                </div>
            </footer>
        </div>
    );
}
