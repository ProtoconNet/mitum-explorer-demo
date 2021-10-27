export const SET_NETWORK = "network/set-network";
export const CLEAR_NETWORK = "network/clear-network";

export const SET_NODE_INFO = "node/set-node-info";

export function setNodeInfo(modelVersion, networkVersion, blockHeight, suffrages) {
    return {
        type: SET_NODE_INFO,
        modelVersion,
        networkVersion,
        blockHeight,
        suffrages,
    }
}

export function setNetwork(network) {
    return {
        type: SET_NETWORK,
        network,
    }
}

export function clearNetwork() {
    return {
        type: CLEAR_NETWORK,
    }
}