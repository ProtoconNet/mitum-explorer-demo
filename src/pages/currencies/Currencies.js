import React, { Component } from "react";
import './Currencies.scss';
import Card from "../../components/Card";
import SearchBox from "../../components/SearchBox";
import CurrencyInfo from "./CurrencyInfo";
import CurrencyList from "./CurrencyList";

import axios from "axios";

const getCurrencies = async () => {
    return await axios.get(process.env.REACT_APP_NETWORK + process.env.REACT_APP_CURRENCIES);
}

const getCurrency = async (currency) => {
    const network = process.env.REACT_APP_NETWORK;
    const currenciesApi = process.env.REACT_APP_CURRENCIES;
    return await axios.get(network + currenciesApi + "/" + currency);
}

const parseCurrency = (currency) => {
    var idx = currency.indexOf(':');
    if (idx < 0 || currency.indexOf('{') > -1) {
        return null;
    }
    return currency.substring(idx + 1, currency.length);
}

class Currencies extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            currencies: [],
            idx: 0,

            searchRes: {
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
                        currencies: parseResult
                    });
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
                        searchRes: {
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
                    })
                }
            )
            .catch(
                e => {
                    this.setState({
                        searchRes: {
                            showResult: true,
                            currency: null,
                        }
                    })
                }
            )
    }

    componentDidMount() {
        const { params } = this.props.match;
        if (Object.prototype.hasOwnProperty.call(params, "currency")) {
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
        this.props.history.push(`/currencies/${currency}`);
    }

    render() {
        const state = this.state;

        return (
            <div className="currencies-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter currency id"
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearchCurrency(state.search)}
                        value={state.search} />
                </Card>
                {state.searchRes.showResult
                    ? <CurrencyInfo data={state.searchRes} />
                    : <CurrencyList
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