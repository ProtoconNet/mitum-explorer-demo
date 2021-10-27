import { combineReducers } from 'redux';
import { persistReducer } from "redux-persist";
import storageSession from 'redux-persist/lib/storage/session';
import { reducer as info } from './versionReducer';
import { reducer as network } from './networkReducer';

const persistConfig = {
    key: "root",
    storage: storageSession,
    whitelist: ["info", "network"]
};

const rootReducer = combineReducers({
    info,
    network,
});

export default persistReducer(persistConfig, rootReducer);