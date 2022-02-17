import React, { Component } from "react";
import { connect } from "react-redux";

import './Documents.scss';

import Card from "../../components/views/Card";
import SearchBox from "../../components/SearchBox";
import List from "../../components/views/List";

import { blockcity as docHint } from '../../lib/hint.json';
import message from '../../lib/message.json';
import page from '../../lib/page.json';
import columns from '../../lib/columns.json';
import { getAllDocuments, getResponse, isBlockCityDocumentId } from '../../lib';
import LoadingIcon from "../../components/LoadingIcon";
import DocumentRespList from "../../components/responsive/DocumentsRespList";

const initialState = {
    idx: 0,
    stack: [],
    documents: [],
    isLoad: false,
}

const DOC_USER = "USER";
const DOC_LAND = "LAND";
const DOC_VOTE = "VOTE";
const DOC_HISTORY = "HISTORY";


class Documents extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            ...initialState,
        }
    }

    loadDocuments() {
        getAllDocuments(this.props.api)
            .then(
                res => {
                    const documents = res.data._embedded;
                    const { self, next } = res.data._links;

                    const nextState = {
                        idx: 0,
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
                        isLoad: true,
                    };

                    getResponse(this.props.api, next.href)
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
        this.loadDocuments();
    }

    onNext() {
        const { idx, stack } = this.state;

        if (idx + 1 >= stack.length) {
            this.setState({ isLoad: true });
            return;
        }

        getResponse(this.props.api, stack[idx + 1])
            .then(
                res => {
                    const documents = res.data._embedded;

                    const nextState = {
                        idx: idx + 1,
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
                        isLoad: true,
                    };

                    if (idx + 2 > stack.length) {
                        this.setState({
                            ...nextState,
                        });
                        return;
                    }

                    const { next } = res.data._links;
                    getResponse(this.props.api, next.href)
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
                    console.error(`${message.error.network} ${message.error.documents}`);
                }
            )
    }

    onPrev() {
        const { idx, stack } = this.state;

        if (idx <= 0) {
            this.setState({ isLoad: true });
            return;
        }

        getResponse(this.props.api, stack[idx - 1])
            .then(
                res => {
                    const documents = res.data._embedded;
                    this.setState({
                        idx: idx - 1,
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
                        isLoad: true,
                    })
                }
            )
            .catch(
                e => {
                    this.setState({
                        isLoad: true,
                    });
                    console.error(`${message.error.network} ${message.error.documents}`);
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

        if (!search) {
            return;
        }

        if (isBlockCityDocumentId(search)) {
            this.props.history.push(`${page.document.default}/${search}`);
            window.location.reload();
        }
        else {
            alert("invalid document id")
            this.setState({
                search: ""
            });
        }
    }

    renderDocuments() {
        const { isLoad } = this.state;
        const { idx, stack, documents } = this.state;

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
            isLoad
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
                            onPrevClick={() => { this.setState({ isDocLoad: false }); this.onPrev(); }}
                            onNextClick={() => { this.setState({ isDocLoad: false }); this.onNext(); }}
                            isFirstPage={idx === 0}
                            isLastPage={idx + 1 >= stack.length} />
                        <DocumentRespList
                            history={this.props.history}
                            items={documentItems}
                            onPrevClick={() => { this.setState({ isDocLoad: false }); this.onPrev(); }}
                            onNextClick={() => { this.setState({ isDocLoad: false }); this.onNext(); }}
                            isFirstPage={idx === 0}
                            isLastPage={idx + 1 >= stack.length} />
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
        return (
            <div className="documents-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder={message.placeholder.operation}
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch()}
                        value={this.state.search} />
                </Card>
                {
                    this.state.isLoad
                        ? this.renderDocuments()
                        : <LoadingIcon />
                }
            </div>
        )
    }
}

const mapStateToProps = state => ({
    modelVersion: state.info.modelVersion,
    api: state.network.api,
});

export default connect(
    mapStateToProps,
    null
)(Documents);