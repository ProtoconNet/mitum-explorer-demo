import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './DropNavigation.scss';

import logo from "../images/logo2.png";
import page from '../lib/page.json';
import message from '../lib/message.json';

class DropNavigation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isChecked: false,
        }
    }

    onCheckOut() {
        this.setState({
            isChecked: false,
        });
    }

    onCheck() {
        this.setState({
            isChecked: !this.state.isChecked
        })
    }

    render() {
        return (
            <header className="drop-nav-container">
                <input className='burger-check' id="burger-check" type="checkbox" checked={this.state.isChecked} readOnly/>
                <div id="header">
                    <label className="burger-icon" htmlFor="burger-check"
                        onClick={() => this.onCheck()}>
                        <span className="burger-sticks"></span>
                    </label>
                    <Link className="drop-nav-title" to={page.node.default}
                        onClick={() => this.onCheckOut()}>
                        <img id="logo" src={logo} alt="logo" />
                        <p>{message.title}</p>
                    </Link>
                </div>
                <div className='drop-nav-menu'>
                    <section id='menus'>
                        <Link to={page.blocks.default}
                            onClick={() => this.onCheckOut()}>
                            <p>{message.menu.blocks}</p>
                        </Link>
                        <Link to={page.operations.default}
                            onClick={() => this.onCheckOut()}>
                            <p>{message.menu.operations}</p>
                        </Link>
                        <Link to={page.accounts.default}
                            onClick={() => this.onCheckOut()}>
                            <p>{message.menu.accounts}</p>
                        </Link>
                        <Link to={page.currencies.default}
                            onClick={() => this.onCheckOut()}>
                            <p>{message.menu.currencies}</p>
                        </Link>
                        <Link to={page.document.default}
                            onClick={() => this.onCheckOut()}>
                            <p>{message.menu.document}</p>
                        </Link>
                    </section>
                </div>
            </header>
        );
    }
}

export default DropNavigation;