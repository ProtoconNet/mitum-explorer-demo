import React, { Component } from "react";
import { connect } from 'react-redux';
import './Accounts.scss';
import Card from "../../components/Card";
import SearchBox from "../../components/SearchBox";
import List from "../../components/List";

import axios from "axios";

const network = process.env.REACT_APP_NETWORK;
const accountsApi = process.env.REACT_APP_ACCOUNTS;

const accountsColumns = ["Account"];

const getAccounts = async (publicKey) => {
    return axios.get(network + accountsApi + publicKey);
}

const initialState = {
    result: {
        accounts: [],
    },
    accountsIdx: 0,
    accountsStack: [],
}

class Accounts extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            searchRes: initialState,
        }
    }

    loadAccounts(publicKey) {
        getAccounts(publicKey)
            .then(
                res => {
                    const accounts = res.data._embedded;
                    const { self, next } = res.data._links;

                    this.setState({
                        searchRes: {
                            result: {
                                ...this.state.searchRes.result,
                                accounts: accounts.map(account => account._embedded.address)
                            },
                            accountsIdx: 0,
                            accountsStack: [self.href, next.href],
                        }
                    })
                }
            )
            .catch(
                e => {
                    this.setState({
                        searchRes: initialState,
                    });
                }
            )
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    onSearch() {
        if (this.isAddress(this.state.search)) {
            this.props.history.push(`/account/${this.state.search}`)
        }
        else {
            this.props.history.push(`/accounts/${this.state.search}`);
        }
    }

    onAccountsPrev() {

    }

    onAccountsNext() {

    }

    isAddress(target) {
        const { version } = this.props;

        if (target.indexOf(":mca-" + version) > -1) {
            return true;
        }
        return false;
    }

    renderAccounts() {
        return (
            <Card id="accounts" title="Public Keys">

            </Card>
        );

    }

    render() {
        const state = this.state;
        return (
            <div className="accounts-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter account address or public key"
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch()}
                        value={state.search} />
                </Card>
                {this.renderAccounts()}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    version: state.version.version,
});

export default connect(
    mapStateToProps,
    null
)(Accounts);