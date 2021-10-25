import React, { Component } from "react";
import './Operations.scss';
import Card from "../../components/Card";
import SearchBox from "../../components/SearchBox";
import axios from "axios";
import List from "../../components/List";

const network = process.env.REACT_APP_NETWORK;
const allOperationsApi = process.env.REACT_APP_ALL_OPERATIONS;

const operationColumns = ["Fact hash", "Date", "Items"];

const getAllOperations = async () => {
    return await axios.get(network + allOperationsApi);
}

const checkNextLink = async (next) => {
    return await axios.get(network + next);
}

const initialState = {
    idx: 0,
    stack: [],
    operations: [],
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
                                items: Object.prototype.hasOwnProperty.call(operation._embedded.operation.fact, "items")
                                    ? operation._embedded.operation.fact.items.length
                                    : 0
                            })
                        )
                    };

                    checkNextLink(next.href)
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
                    })
                }
            )
    }

    componentDidMount() {
        this.loadOperations();
    }

    onNext() {

    }

    onPrev() {

    }

    isAddress(target) {
        const { modelVersion } = this.props;

        if (target.indexOf(":mca-" + modelVersion) > -1) {
            return true;
        }
        return false;
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    onSearch() {
        const { search } = this.state;

        if (!search) {
            return;
        }

        if (this.isAddress(search)) {
            this.props.history.push(`/account/${search}`);
        }
        else {
            this.props.history.push(`/operation/${search}`);
        }
    }

    render() {
        const { operations, idx, stack } = this.state;
        const items = operations.map(
            operation => [operation.factHash, operation.date, operation.items]
        );

        return (
            <div className="operations-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter fact hash or account address"
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch()}
                        value={this.state.search} />
                </Card>
                <Card id="list" title="Operations">
                    <List
                        columns={operationColumns}
                        items={items}
                        onElementClick={[
                            (x) => { this.props.history.push(`/operation/${x}`); window.location.reload(); },
                            null, null]}
                        onPrevClick={() => this.onPrev()}
                        onNextClick={() => this.onNext()}
                        isLastPage={idx + 1 >= stack.length}
                        isFirstPage={idx <= 0} />
                </Card>
            </div>
        )
    }
}

export default Operations;