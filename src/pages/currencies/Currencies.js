import React, { Component } from "react";

import './Currencies.scss';

import Card from "../../components/views/Card";
import SearchBox from "../../components/SearchBox";
import CurrencyInfo from "./CurrencyInfo";
import CurrencyList from "./CurrencyList";

import message from '../../lib/message.json';
import page, { currency as pageInfo } from '../../lib/page.json';
import { getCurrencies, getCurrency, parseCurrency } from "../../lib";

const initialState = {
    currencies: [],
    idx: 0,
    currencyRes: {
        showResult: false,
        currency: null,
        amount: null,
        minBalance: null,
        feeer: {
            type: null,
            receiver: null,
            amount: null,
        }
    },
    isLoad: false,
}

class Currencies extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            ...initialState,
        }
    }

    loadCurrencies() {
        getCurrencies()
            .then(
                res => {
                    const currencies = Object.keys(res.data._links);
                    const parseResult = [];
                    currencies.forEach(el => {
                        var parsed = parseCurrency(el);
                        if (parsed) {
                            parseResult.push([parsed]);
                        }
                    });

                    this.setState({
                        isLoad: true,
                        idx: 0,
                        currencies: parseResult
                    });
                }
            )
            .catch(
                e => {
                    this.setState({
                        ...initialState,
                        isLoad: true,
                    })
                    console.error(`${message.error.network} ${message.error.currencies}`);
                }
            )
    }

    loadCurrency(currency) {
        getCurrency(currency)
            .then(
                res => {
                    const data = res.data._embedded;
                    const feeer = data.policy.feeer;

                    this.setState({
                        currencyRes: {
                            showResult: true,
                            currency: data.amount.currency,
                            amount: data.amount.amount,
                            minBalance: data.policy.new_account_min_balance,
                            feeer: {
                                type: feeer.type,
                                receiver: feeer.type !== "nil" ? feeer.receiver : null,
                                amount: feeer.type !== "nil" ? feeer.amount : null,
                            }
                        },
                        search: "",
                        isLoad: true,
                    })
                }
            )
            .catch(
                e => {
                    this.setState({
                        currencyRes: {
                            showResult: true,
                            currency: null,
                            isLoad: true,
                        }
                    })
                }
            )
    }

    componentDidMount() {
        const { params } = this.props.match;
        if (Object.prototype.hasOwnProperty.call(params, pageInfo.key)) {
            this.loadCurrency(params.currency);
        }
        else {
            this.loadCurrencies();
        }
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

    onSearchCurrency(currency) {
        if (currency === "") {
            return;
        }
        this.props.history.push(`${page.currency.default}/${currency}`);
        window.location.reload();
    }

    render() {
        const state = this.state;

        return (
            <div className="currencies-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder={message.placeholder.currency}
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearchCurrency(state.search)}
                        value={state.search} />
                </Card>
                {state.currencyRes.showResult
                    ? <CurrencyInfo data={state.currencyRes} isLoad={state.isLoad}/>
                    : <CurrencyList
                        isLoad={state.isLoad}
                        onPrev={() => this.onPrev()}
                        onNext={() => this.onNext()}
                        onSearchCurrency={(currency) => this.onSearchCurrency(currency)}
                        currencies={state.currencies}
                        idx={state.idx} />}
            </div>
        )
    }
}

export default Currencies;