import { combineReducers } from 'redux';
import { persistReducer } from "redux-persist";
import storageSession from 'redux-persist/lib/storage/session';
import {reducer as version} from './versionReducer';

const persistConfig = {
    key: "root",
    storage: storageSession,
    whitelist: ["version"]
};

const rootReducer = combineReducers({
    version
});

export default persistReducer(persistConfig, rootReducer);