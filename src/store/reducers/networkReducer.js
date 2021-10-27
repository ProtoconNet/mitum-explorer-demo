import * as actions from '../actions';

const env = process.env;
const initialState = {
    api: env.REACT_APP_NETWORK,
}

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.SET_NETWORK:
            return {
                ...state,
                api: action.network,
            };
        case actions.CLEAR_NETWORK:
            return {
                ...state,
                api: env.REACT_APP_NETWORK,
            }
        default:
            return state;
    }
}