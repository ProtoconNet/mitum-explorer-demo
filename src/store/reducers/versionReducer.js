import * as actions from '../actions';

const initialState = {
    version: "v0.0.1",
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.SET_VERSION:
            return {
                ...state,
               version: action.version,
            };
        default:
            return state;
    }
}