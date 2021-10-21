import React, { Component } from "react";
import './Operations.scss';
import Card from "../components/Card";
import SearchBox from "../components/SearchBox";

class Operations extends Component {
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
            <div className="operations-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter fact hash or account address"
                        onChange={(e) => this.onSearchChange(e)}
                        value={this.state.search} />
                </Card>
                <Card id="list" title="Operations">
                    
                </Card>
            </div>
        )
    }
}

export default Operations;