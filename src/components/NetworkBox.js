import React, { Component } from 'react';
import { clearNetwork, setNetwork } from '../store/actions';
import './NetworkBox.scss';

import message from '../lib/message.json';
import { connect } from 'react-redux';

class NetworkBox extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isActive: false,
            network: this.props.api,
        }
    }

    onChange(e) {
        this.setState({
            network: e.target.value
        });
    }

    onSet() {
        const network = this.state.network.trim();
        if (!network) {
            return;
        }
        this.props.setNetwork(network);
        this.setState({
            isActive: false,
        })
        alert(message.setting.network.success + network);
    }

    onClear() {
        this.props.clearNetwork();
        this.setState({
            isActive: false,
            network: process.env.REACT_APP_NETWORK
        })
        alert(message.setting.network.success + process.env.REACT_APP_NETWORK);
    }

    render() {
        return (
            <div className="network-box-container">
                {
                    this.state.isActive
                        ? (
                            <section id="network-box-active">
                                <input id="network-box-input"
                                    type="text/plain"
                                    autoComplete="on"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    autoSave="off"
                                    autoFocus="off"
                                    disabled={!this.state.isActive}
                                    onChange={(e) => this.onChange(e)}
                                    value={this.state.network}
                                />
                                <button onClick={() => this.onSet()} id="network-box-button">set</button>
                                <button onClick={() => this.onClear()} id="network-box-button">reset</button>
                            </section>
                        )
                        : <p id="network-box-api" onClick={() => this.setState({ isActive: true })}>{this.props.api}</p>
                }
            </div>
        )
    }
}

const mapStateToProps = state => ({
    api: state.network.api
});

const mapDispatchToProps = dispatch => ({
    setNetwork: (network) => dispatch(setNetwork(network)),
    clearNetwork: () => dispatch(clearNetwork()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NetworkBox);