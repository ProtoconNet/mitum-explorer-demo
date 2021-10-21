import React, { Component } from "react";
import './Accounts.scss';
import Card from "../components/Card";
import SearchBox from "../components/SearchBox";

class Accounts extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
        }
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    render() {
        return (
            <div className="accounts-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter public key"
                        onChange={(e) => this.onSearchChange(e)}
                        value={this.state.search} />
                </Card>
                <Card id="list" title="Accounts">
                    
                </Card>
            </div>
        )
    }
}

export default Accounts;