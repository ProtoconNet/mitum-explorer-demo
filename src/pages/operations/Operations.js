import React, { Component } from "react";
import { connect } from "react-redux";

import './Operations.scss';

import Card from "../../components/views/Card";
import SearchBox from "../../components/SearchBox";
import List from "../../components/views/List";

import message from '../../lib/message.json';
import page from '../../lib/page.json';
import columns from '../../lib/columns.json';
import { getAllOperations, getResponse, isAddress, parseDate } from '../../lib';
import LoadingIcon from "../../components/LoadingIcon";

const initialState = {
    idx: 0,
    stack: [],
    operations: [],
    isLoad: false,
}

class Operations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            ...initialState,
        }
    }

    loadOperations() {
        getAllOperations()
            .then(
                res => {
                    const operations = res.data._embedded;
                    const { self, next } = res.data._links;

                    const nextState = {
                        idx: 0,
                        operations: operations.map(
                            operation => ({
                                factHash: operation._embedded.operation.fact.hash,
                                date: operation._embedded.confirmed_at,
                                height: operation._embedded.height,
                            })
                        ),
                        isLoad: true,
                    };

                    getResponse(next.href)
                        .then(
                            res => {
                                this.setState({
                                    ...nextState,
                                    stack: [self.href, next.href],
                                })
                            }
                        )
                        .catch(
                            e => {
                                this.setState({
                                    ...nextState,
                                    stack: [self.href],
                                })
                            }
                        )
                }
            )
            .catch(
                e => {
                    this.setState({
                        ...initialState,
                        isLoad: true,
                    })
                }
            )
    }

    componentDidMount() {
        this.loadOperations();
    }

    onNext() {
        const { idx, stack } = this.state;

        if (idx + 1 >= stack.length) {
            this.setState({isLoad: true});
            return;
        }

        getResponse(stack[idx + 1])
            .then(
                res => {
                    const operations = res.data._embedded;

                    const nextState = {
                        idx: idx + 1,
                        operations: operations.map(
                            operation => ({
                                factHash: operation._embedded.operation.fact.hash,
                                date: operation._embedded.confirmed_at,
                                height: operation._embedded.height,
                            })
                        ),
                        isLoad: true,
                    };

                    if (idx + 2 > stack.length) {
                        this.setState({
                            ...nextState,
                        });
                        return;
                    }

                    const { next } = res.data._links;
                    getResponse(next.href)
                        .then(
                            nextRes => {
                                this.setState({
                                    ...nextState,
                                    stack: stack.concat([next.href]),
                                })
                            }
                        )
                        .catch(
                            e => {
                                this.setState({
                                    ...nextState,
                                })
                            }
                        )
                }
            )
            .catch(
                e => {
                    this.setState({
                        isLoad: true,
                    })
                    console.error(`${message.error.network} ${message.error.operations}`);
                }
            )
    }

    onPrev() {
        const { idx, stack } = this.state;

        if (idx <= 0) {
            this.setState({isLoad: true});
            return;
        }

        getResponse(stack[idx - 1])
            .then(
                res => {
                    const operations = res.data._embedded;
                    this.setState({
                        idx: idx - 1,
                        operations: operations.map(
                            operation => ({
                                factHash: operation._embedded.operation.fact.hash,
                                date: operation._embedded.confirmed_at,
                                height: operation._embedded.height,
                            })
                        ),
                        isLoad: true,
                    })
                }
            )
            .catch(
                e => {
                    this.setState({
                        isLoad: true,
                    });
                    console.error(`${message.error.network} ${message.error.operations}`);
                }
            )
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    onSearch() {
        const search = this.state.search.trim();
        const version = this.props.modelVersion;

        if (!search) {
            return;
        }

        if (isAddress(search, version)) {
            this.props.history.push(`${page.account.default}/${search}`);
        }
        else {
            this.props.history.push(`${page.operation.default}/${search}`);
        }
    }

    render() {
        const { operations, idx, stack } = this.state;
        const items = operations.map(
            operation => [operation.factHash, parseDate(operation.date), operation.height]
        );

        return (
            <div className="operations-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder={message.placeholder.account}
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch()}
                        value={this.state.search} />
                </Card>
                <Card id="list" title="Operations">
                    {
                        this.state.isLoad
                            ? (
                                <List
                                    columns={Object.values(columns.operations)}
                                    items={items}
                                    onElementClick={[
                                        (x) => { this.props.history.push(`${page.operation.default}/${x}`); window.location.reload(); },
                                        null,
                                        (x) => { this.props.history.push(`${page.block.default}/${x}`) }
                                    ]}
                                    onPrevClick={() => { this.setState({ isLoad: false }); this.onPrev(); }}
                                    onNextClick={() => { this.setState({ isLoad: false }); this.onNext(); }}
                                    isLastPage={idx + 1 >= stack.length}
                                    isFirstPage={idx <= 0} />
                            )
                            : <LoadingIcon />
                    }
                </Card>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    modelVersion: state.info.modelVersion,
});

export default connect(
    mapStateToProps,
    null
)(Operations);