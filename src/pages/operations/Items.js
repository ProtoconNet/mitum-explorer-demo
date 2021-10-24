import React, { Component } from "react";
import './Items.scss';
import Card from "../../components/Card";

class Items extends Component {
    render() {
        return (
            <div className="items-container">
                <Card id="list" title="Items in Operation">
                    
                </Card>
            </div>
        )
    }
}

export default Items;