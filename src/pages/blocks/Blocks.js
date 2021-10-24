import React, { Component } from "react";
import './Blocks.scss';
import Card from "../../components/Card";
import SearchBox from "../../components/SearchBox";

class Blocks extends Component {
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

    renderBlock() {

    }

    renderBlocks() {

    }

    render() {
        return (
            <div className="blocks-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter block hash or block height"
                        onChange={(e) => this.onSearchChange(e)}
                        value={this.state.search} />
                </Card>
                <Card id="list" title="Blocks">
                    
                </Card>
            </div>
        )
    }
}

export default Blocks;