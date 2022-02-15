import React, { Component } from "react";
import { connect } from 'react-redux';

import './Account.scss';
import Card from "../../components/views/Card";
import SearchBox from "../../components/SearchBox";
import List from "../../components/views/List";
import DetailCard from "../../components/views/DetailCard";

import { blockcity as docHint } from '../../lib/hint.json';
import page, { account as pageInfo } from '../../lib/page.json';
import { account as accountKeys } from '../../lib/keys.json';
import message from '../../lib/message.json';
import columns from '../../lib/columns.json';
import { getAccount, getAccountOperations, getAccountDocuments, getResponse, isAddress, parseDate } from "../../lib";
import LoadingIcon from "../../components/LoadingIcon";
import KeyRespList from "../../components/responsive/KeyRespList";
import BalanceRespList from "../../components/responsive/BalanceRespList";
import OperationRespList from "../../components/responsive/OperationRespList";
import DataView from "../../components/DataView";
import DocumentRespList from "../../components/responsive/DocumentsRespList";

const initialState = {
    keysRes: {
        idx: 0,
        keys: [],
        threshold: -1,
    },
    balancesRes: {
        idx: 0,
        balances: [],
    },
    operationsRes: {
        idx: 0,
        linkStack: [],
        operations: [],
    },
    documentsRes: {
        idx: 0,
        linkStack: [],
        documents: [],
    },
    addressRes: null,
    isAccountLoad: false,
    isOperLoad: false,
    isDocLoad: false,
    raw: "",
}

const DOC_USER = "USER";
const DOC_LAND = "LAND";
const DOC_VOTE = "VOTE";
const DOC_HISTORY = "HISTORY";

class Account extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            ...initialState,
        }
    }

    loadAccountInfo(address) {
        getAccount(this.props.api, address)
            .then(
                res => {
                    const data = res.data._embedded;

                    this.setState({
                        isAccountLoad: true,
                        raw: JSON.stringify(res.data, null, 4),
                        addressRes: data.address,
                        keysRes: {
                            threshold: data.keys.threshold,
                            keys: data.keys.keys.map(
                                key => ({
                                    key: key.key,
                                    weight: key.weight,
                                })
                            ).sort((x, y) => {
                                if (x.key < y.key) {
                                    return -1;
                                }
                                else if (x.key > y.key) {
                                    return 1;
                                }
                                return 0;
                            }),
                            idx: 0,
                        },
                        balancesRes: {
                            balances: data.balance.map(
                                balance => ({
                                    currency: balance.currency,
                                    amount: balance.amount,
                                })
                            ).sort((x, y) => {
                                if (x.currency < y.currency) {
                                    return -1;
                                }
                                else if (x.currency > y.currency) {
                                    return 1;
                                }
                                return 0;
                            }),
                            idx: 0,
                        }
                    });
                }
            )
            .catch(
                e => {
                    this.setState({
                        ...initialState,
                        isAccountLoad: true,
                    });
                }
            )

        getAccountOperations(this.props.api, address)
            .then(
                res => {
                    const operations = res.data._embedded;
                    const { self, next } = res.data._links;
                    const nextState = {
                        operations: operations.map(
                            operation => ({
                                factHash: operation._embedded.operation.fact.hash,
                                date: operation._embedded.confirmed_at,
                                height: operation._embedded.height,
                            })
                        ),
                        idx: 0,
                    }

                    getResponse(this.props.api, next.href)
                        .then(
                            res => {
                                this.setState({
                                    isOperLoad: true,
                                    operationsRes: {
                                        ...nextState,
                                        linkStack: [self.href, next.href],
                                    }
                                })
                            }
                        )
                        .catch(
                            e => {
                                this.setState({
                                    isOperLoad: true,
                                    operationsRes: {
                                        ...nextState,
                                        linkStack: [self.href],
                                    }
                                })
                            }
                        )

                }
            )
            .catch(
                e => {
                    this.setState({
                        isOperLoad: true,
                        operationsRes: {
                            ...initialState.operationsRes,
                        }
                    });
                }
            )

        getAccountDocuments(this.props.api, address)
            .then(
                res => {
                    const documents = res.data._embedded;
                    const { self, next } = res.data._links;
                    const nextState = {
                        documents: documents.map(
                            doc => {
                                const id = doc._embedded.document.info.docid.id;
                                const suffix = id.substring(id.length - 3);
                                let docType = "UNKNOWN";

                                switch(suffix) {
                                    case docHint.docid.user:
                                        docType = DOC_USER;
                                        break;
                                    case docHint.docid.land:
                                        docType = DOC_LAND;
                                        break;
                                    case docHint.docid.vote:
                                        docType = DOC_VOTE;
                                        break;
                                    case docHint.docid.history:
                                        docType = DOC_HISTORY;
                                        break;
                                    default:
                                }

                                return {
                                    docType,
                                    id,
                                    owner: doc._embedded.document.owner,
                                    height: doc._embedded.height
                                };
                            }
                        ),
                        idx: 0,
                    }

                    getResponse(this.props.api, next.href)
                        .then(
                            res => {
                                
                                this.setState({
                                    isDocLoad: true,
                                    documentsRes: {
                                        ...nextState,
                                        linkStack: [self.href, next.href],
                                    }
                                })
                            }
                        )
                        .catch(
                            e => {
                                this.setState({
                                    isDocLoad: true,
                                    documentsRes: {
                                        ...nextState,
                                        linkStack: [self.href],
                                    }
                                })
                            }
                        )

                }
            )
            .catch(
                e => {
                    this.setState({
                        isDocLoad: true,
                        documentsRes: {
                            ...initialState.documentsRes,
                        }
                    });
                }
            )
    }

    componentDidMount() {
        const { params } = this.props.match;
        if (Object.prototype.hasOwnProperty.call(params, pageInfo.key)) {
            this.loadAccountInfo(params.address);
        }
        else {
            this.props.history.push(page.accounts.default);
        }
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    onSearch() {
        const search = this.state.search.trim();

        if (!search) {
            return;
        }

        if (isAddress(search)) {
            this.props.history.push(`${page.account.default}/${search}`);
            window.location.reload();
        }
        else {
            this.props.history.push(`${page.accounts.default}/${search}`);
        }
    }

    onPubPrev() {
        const { idx } = this.state.keysRes;
        this.setState({
            keysRes: {
                ...this.state.keysRes,
                idx: idx - 10 < 0 ? 0 : idx - 10
            }
        });
    }

    onPubNext() {
        const { idx, keys } = this.state.keysRes;
        this.setState({
            keysRes: {
                ...this.state.keysRes,
                idx: idx + 10 > keys.length ? idx : idx + 10,
            }
        })
    }

    onBalancePrev() {
        const { idx } = this.state.balancesRes;
        this.setState({
            balancesRes: {
                ...this.state.balancesRes,
                idx: idx - 10 <= 0 ? 0 : idx - 10,
            }
        });
    }

    onBalanceNext() {
        const { idx, balances } = this.state.balancesRes;
        this.setState({
            balancesRes: {
                ...this.state.balancesRes,
                idx: idx + 10 > balances.length ? idx : idx + 10,
            }
        });
    }

    onOperationPrev() {
        const { idx, linkStack } = this.state.operationsRes;

        if (idx <= 0) {
            this.setState({ isOperLoad: true });
            return;
        }
        else {
            getResponse(this.props.api, linkStack[idx - 1])
                .then(
                    res => {
                        const operations = res.data._embedded;

                        this.setState({
                            operationsRes: {
                                ...this.state.operationsRes,
                                operations: operations.map(
                                    operation => ({
                                        factHash: operation._embedded.operation.fact.hash,
                                        date: operation._embedded.confirmed_at,
                                        height: operation._embedded.height,
                                    })
                                ),
                                idx: idx - 1,
                            },
                            isOperLoad: true,
                        });
                    }
                )
                .catch(
                    e => {
                        this.setState({
                            isOperLoad: true,
                        });
                        console.error(`${message.error.network} ${message.error.operations}`);
                    }
                )
        }
    }

    onOperationNext() {
        const { idx, linkStack } = this.state.operationsRes;

        if (idx + 1 >= linkStack.length) {
            this.setState({ isOperLoad: true });
            return;
        }
        else {
            getResponse(this.props.api, linkStack[idx + 1])
                .then(
                    res => {
                        const operations = res.data._embedded;
                        const nextState = {
                            ...this.state.operationsRes,
                            operations: operations.map(
                                operation => ({
                                    factHash: operation._embedded.operation.fact.hash,
                                    date: operation._embedded.confirmed_at,
                                    height: operation._embedded.height,
                                })
                            ),
                            idx: idx + 1,
                        }

                        if (idx + 2 > linkStack.length) {
                            const { next } = res.data._links;
                            getResponse(this.props.api, next.href)
                                .then(
                                    nextRes => {
                                        this.setState({
                                            operationsRes: {
                                                ...nextState,
                                                linkStack: linkStack.concat([next.href]),
                                            },
                                            isOperLoad: true,
                                        })
                                    }
                                )
                                .catch(
                                    e => {
                                        this.setState({
                                            operationsRes: {
                                                ...nextState,
                                            },
                                            isOperLoad: true,
                                        })
                                    }
                                )
                        }
                        else {
                            this.setState({
                                operationsRes: {
                                    ...nextState,
                                },
                                isOperLoad: true,
                            })
                        }
                    }
                )
                .catch(
                    e => {
                        this.setState({
                            isOperLoad: true,
                        });
                        console.error(`${message.error.network} ${message.error.operations}`);
                    }
                )
        }

    }

    onDocumentsNext() {
        const { idx, linkStack } = this.state.documentsRes;

        if (idx + 1 >= linkStack.length) {
            this.setState({ isDocLoad: true });
            return;
        }
        else {
            getResponse(this.props.api, linkStack[idx + 1])
                .then(
                    res => {
                        const documents = res.data._embedded;
                        const nextState = {
                            ...this.state.documentsRes,
                            documents: documents.map(
                                doc => {
                                    const id = doc.document.info.docid.id;
                                    let docType = "UNKNOWN";
    
                                    switch(id) {
                                        case docHint.docid.user:
                                            docType = DOC_USER;
                                            break;
                                        case docHint.docid.land:
                                            docType = DOC_LAND;
                                            break;
                                        case docHint.docid.vote:
                                            docType = DOC_VOTE;
                                            break;
                                        case docHint.docid.history:
                                            docType = DOC_HISTORY;
                                            break;
                                        default:
                                    }
    
                                    return {
                                        docType,
                                        id,
                                        owner: doc.document.owner,
                                        height: doc.height
                                    };
                                }
                            ),
                            idx: idx + 1,
                        }

                        if (idx + 2 > linkStack.length) {
                            const { next } = res.data._links;
                            getResponse(this.props.api, next.href)
                                .then(
                                    nextRes => {
                                        this.setState({
                                            documentsRes: {
                                                ...nextState,
                                                linkStack: linkStack.concat([next.href]),
                                            },
                                            isDocLoad: true,
                                        })
                                    }
                                )
                                .catch(
                                    e => {
                                        this.setState({
                                            documentsRes: {
                                                ...nextState,
                                            },
                                            isDocLoad: true,
                                        })
                                    }
                                )
                        }
                        else {
                            this.setState({
                                documentsRes: {
                                    ...nextState,
                                },
                                isDocLoad: true,
                            })
                        }
                    }
                )
                .catch(
                    e => {
                        this.setState({
                            isDocLoad: true,
                        });
                        console.error(`${message.error.network} ${message.error.documents}`);
                    }
                )
        }
    }

    onDocumentsPrev() {
        const { idx, linkStack } = this.state.documentsRes;
 
        if (idx <= 0) {
            this.setState({ isDocLoad: true });
            return;
        }
        else {
            getResponse(this.props.api, linkStack[idx - 1])
                .then(
                    res => {
                        const documents = res.data._embedded;

                        this.setState({
                            documentsRes: {
                                ...this.state.documentsRes,
                                documents: documents.map(
                                    doc => {
                                        const id = doc.document.info.docid.id;
                                        let docType = "UNKNOWN";
        
                                        switch(id) {
                                            case docHint.docid.user:
                                                docType = DOC_USER;
                                                break;
                                            case docHint.docid.land:
                                                docType = DOC_LAND;
                                                break;
                                            case docHint.docid.vote:
                                                docType = DOC_VOTE;
                                                break;
                                            case docHint.docid.history:
                                                docType = DOC_HISTORY;
                                                break;
                                            default:
                                        }
        
                                        return {
                                            docType,
                                            id,
                                            owner: doc.document.owner,
                                            height: doc.height
                                        };
                                    }
                                ),
                                idx: idx - 1,
                            },
                            isDocLoad: true,
                        });
                    }
                )
                .catch(
                    e => {
                        this.setState({
                            isDocLoad: true,
                        });
                        console.error(`${message.error.network} ${message.error.documents}`);
                    }
                )
        }
    }

    renderAccountInfo() {
        const { addressRes, balancesRes, keysRes, isAccountLoad } = this.state;

        if (!addressRes) {
            return (
                <Card id="account-info" title="Account Information">
                    <p>Not found</p>
                </Card>
            )
        }

        const { keys } = keysRes;
        const { balances } = balancesRes;

        const pubItems = keys
            .map(key => [key.key, key.weight])
            .slice(keysRes.idx, (keysRes.idx + 10 >= keys.length ? keys.length : keysRes.idx + 10))
        const balancesItems = balances
            .map(currency => [currency.currency, currency.amount])
            .slice(balancesRes.idx, (balancesRes.idx + 10 >= balances.length ? balances.length : balancesRes.idx + 10))

        const plainTitleStyle = {
            fontSize: "0.9rem",
            fontWeight: "500",
            color: "#404040",
            padding: "0",
            margin: "0",
            width: "100%",
            textAlign: "start",
            letterSpacing: "0.5px",
        }

        if (isAccountLoad) {
            return (
                <Card id="account-info" title="Account Information">
                    <DetailCard
                        keyIndex={null}
                        items={[
                            [accountKeys.address, addressRes],
                        ]} />

                    <p style={plainTitleStyle}>{`Keys (${accountKeys.threshold} : ${keysRes.threshold})`}</p>
                    <List columns={Object.values(columns.public_keys)}
                        items={pubItems}
                        onElementClick={[
                            (x) => this.props.history.push(`${page.accounts.default}/${x}`),
                            null
                        ]}
                        onPrevClick={() => this.onPubPrev()}
                        onNextClick={() => this.onPubNext()}
                        isFirstPage={keysRes.idx === 0}
                        isLastPage={keysRes.idx + 10 >= keys.length} />
                    <KeyRespList items={pubItems}
                        history={this.props.history}
                        onPrevClick={() => this.onPubPrev()}
                        onNextClick={() => this.onPubNext()}
                        isFirstPage={keysRes.idx === 0}
                        isLastPage={keysRes.idx + 10 >= keys.length} />
                    <p style={plainTitleStyle}>Balances</p>
                    <BalanceRespList items={balancesItems}
                        history={this.props.history}
                        onPrevClick={() => this.onBalancePrev()}
                        onNextClick={() => this.onBalanceNext()}
                        isFirstPage={balancesRes.idx === 0}
                        isLastPage={balancesRes.idx + 10 >= balances.length} />
                    <DataView data={this.state.raw} />
                </Card>
            );
        }
        else {
            return <Card id="account-info" title="Account Information"><LoadingIcon /></Card>
        }

    }

    renderOperations() {
        const { isOperLoad } = this.state;
        const { idx, linkStack, operations } = this.state.operationsRes;

        if (!operations) {
            return (
                <Card id="operations" title="Operations">
                    <p>{message.replace.null}</p>
                </Card>
            )
        }

        const operationItems = operations
            .map(operation => [operation.factHash, parseDate(operation.date, false), operation.height]);

        return (
            isOperLoad
                ? (
                    <Card id="operations" title="Operations">
                        <List columns={Object.values(columns.operations)}
                            items={operationItems}
                            onElementClick={[
                                (x) => this.props.history.push(`${page.operation.default}/${x}`),
                                null,
                                (x) => this.props.history.push(`${page.block.default}/${x}`),
                            ]}
                            onPrevClick={() => { this.setState({ isOperLoad: false }); this.onOperationPrev(); }}
                            onNextClick={() => { this.setState({ isOperLoad: false }); this.onOperationNext(); }}
                            isFirstPage={idx === 0}
                            isLastPage={idx + 1 >= linkStack.length} />
                        <OperationRespList
                            history={this.props.history}
                            items={operationItems}
                            onPrevClick={() => { this.setState({ isOperLoad: false }); this.onOperationPrev(); }}
                            onNextClick={() => { this.setState({ isOperLoad: false }); this.onOperationNext(); }}
                            isFirstPage={idx === 0}
                            isLastPage={idx + 1 >= linkStack.length} />
                    </Card>
                )
                : (
                    <Card id="operations" title="Operations">
                        <LoadingIcon />
                    </Card>
                )
        );
    }

    renderDocuments() {
        const { isDocLoad } = this.state;
        const { idx, linkStack, documents } = this.state.documentsRes;

        if (!documents) {
            return (
                <Card id="documents" title="Documents">
                    <p>{message.replace.null}</p>
                </Card>
            )
        }

        const documentItems = documents
            .map(document => [document.docType, document.id, document.owner, document.height]);

        return (
            isDocLoad
                ? (
                    <Card id="documents" title="Documents">
                        <List columns={Object.values(columns.documents)}
                            items={documentItems}
                            side="left"
                            onElementClick={[
                                null,
                                (x) => this.props.history.push(`${page.document.default}/${x}`),
                                (x) => this.props.history.push(`${page.account.default}/${x}`),
                                (x) => this.props.history.push(`${page.block.default}/${x}`),
                            ]}
                            onPrevClick={() => { this.setState({ isDocLoad: false }); this.onDocumentPrev(); }}
                            onNextClick={() => { this.setState({ isDocLoad: false }); this.onDocumentNext(); }}
                            isFirstPage={idx === 0}
                            isLastPage={idx + 1 >= linkStack.length} />
                        <DocumentRespList
                            history={this.props.history}
                            items={documentItems}
                            onPrevClick={() => { this.setState({ isDocLoad: false }); this.onDocumentPrev(); }}
                            onNextClick={() => { this.setState({ isDocLoad: false }); this.onDocumentNext(); }}
                            isFirstPage={idx === 0}
                            isLastPage={idx + 1 >= linkStack.length} />
                    </Card>
                )
                : (
                    <Card id="documents" title="Documents">
                        <LoadingIcon />
                    </Card>
                )
        );
    }

    render() {
        const state = this.state;
        return (
            <div className="account-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder={message.placeholder.account}
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch()}
                        value={state.search} />
                </Card>
                {this.renderAccountInfo()}
                {this.renderOperations()}
                {this.renderDocuments()}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    api: state.network.api,
    modelVersion: state.info.modelVersion,
});

export default connect(
    mapStateToProps,
    null
)(Account);