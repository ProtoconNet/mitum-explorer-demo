import React, { Component } from "react";
import './Operation.scss';
import Card from "../../components/Card";
import SearchBox from "../../components/SearchBox";

class Operation extends Component {
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
            <div className="operation-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter fact hash or account address"
                        onChange={(e) => this.onSearchChange(e)}
                        value={this.state.search} />
                </Card>
                <Card id="list" title="Operation Information">
                    
                </Card>
            </div>
        )
    }
}

export default Operation;