import React, { Component } from "react";
import './Currencies.scss';
import Card from "../components/Card";
import SearchBox from "../components/SearchBox";
import axios from "axios";
import List from "../components/List";

class Currencies extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            currencies: [],
            idx: 0,
        }
    }

    async getCurrencies() {
        return await axios.get(process.env.REACT_APP_NETWORK + process.env.REACT_APP_CURRENCIES);
    }

    componentDidMount() {
        this.getCurrencies()
            .then(
                res => {
                    const parseCurrency = (currency) => {
                        var idx = currency.indexOf(':');
                        if (idx < 0 || currency.indexOf('{') > -1) {
                            return null;
                        }
                        return currency.substring(idx + 1, currency.length);
                    }

                    const currencies = Object.keys(res.data._links);
                    const parseResult = [];
                    currencies.forEach(el => {
                        var parsed = parseCurrency(el);
                        if (parsed) {
                            parseResult.push([parsed]);
                        }
                    });

                    this.setState({
                        currencies: parseResult
                    });
                }
            )
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    onPrev() {
        this.setState({
            idx: this.state.idx - 10 < 0 ? 0 : this.state.idx - 10
        });
    }

    onNext() {
        this.setState({
            idx: this.state.idx + 10 > this.state.currencies.length ? this.state.idx : this.state.idx + 10,
        });
    }

    render() {
        return (
            <div className="currencies-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter currency id"
                        onChange={(e) => this.onSearchChange(e)}
                        value={this.state.search} />
                </Card>
                <Card id="list" title="Currencies">
                    <List columns={["Currency ID"]} list={
                        this.state.currencies.slice(
                            this.state.idx,
                            (this.state.idx + 10 >= this.state.currencies.length
                                ? this.state.currencies.length
                                : this.state.idx + 10)
                        )}
                        onPrevClick={() => this.onPrev()}
                        onNextClick={() => this.onNext()}
                        isLastPage={this.state.idx + 10 >= this.state.currencies.length}
                        isFirstPage={this.state.idx === 0} />
                </Card>
            </div>
        )
    }
}

export default Currencies;