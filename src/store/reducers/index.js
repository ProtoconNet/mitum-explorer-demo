import { combineReducers } from 'redux';
import { persistReducer } from "redux-persist";
import storageSession from 'redux-persist/lib/storage/session';
import {reducer as info} from './versionReducer';

const persistConfig = {
    key: "root",
    storage: storageSession,
    whitelist: ["info"]
};

const rootReducer = combineReducers({
    info
});

export default persistReducer(persistConfig, rootReducer);