import * as actions from '../actions';

const initialState = {
    modelVersion: "v0.0.1",
    networkVersion: "v0.0.0",
    blockHeight: 0,
    suffrages: [],
    isLoad: false,
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.SET_NODE_INFO:
            return {
                ...state,
                modelVersion: action.modelVersion,
                networkVersion: action.networkVersion,
                blockHeight: action.blockHeight,
                suffrages: action.suffrages,
                isLoad: true,
            };
        default:
            return state;
    }
}