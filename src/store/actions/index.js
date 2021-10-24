export const SET_NODE_INFO = "node/set-node-info";

export function setNodeInfo(modelVersion, networkVersion, blockHeight) {
    return {
        type: SET_NODE_INFO,
        modelVersion,
        networkVersion,
        blockHeight
    }
}