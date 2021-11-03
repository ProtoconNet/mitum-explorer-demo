import axios from 'axios';

const env = process.env;
export const urls = {
    default: env.REACT_APP_NETWORK,
    account: env.REACT_APP_ACCOUNT,
    accounts: env.REACT_APP_ACCOUNTS,
    currencies: env.REACT_APP_CURRENCIES,
    block: env.REACT_APP_BLOCK,
    blocks: env.REACT_APP_BLOCKS,
    manifest: env.REACT_APP_MANIFEST,
    operations: env.REACT_APP_OPERATIONS,
    operation: env.REACT_APP_OPERATION,
    allOperation: env.REACT_APP_ALL_OPERATIONS,
}

export async function getResponse(api, next) {
    return await axios.get(api + next);
}

export async function getNodeInfo(api) {
    return await axios.get(api + "");
}

export async function getAccount(api, address) {
    return await axios.get(api + urls.account + address);
}

export async function getAllOperations(api) {
    return await axios.get(api + urls.allOperation);
}

export async function getAccountOperations(api, address) {
    return await axios.get(api + urls.account + address + urls.operations);
}

export async function getOperation(api, hash) {
    return await axios.get(api + urls.operation + hash);
}

export async function getAccounts(api, publicKey) {
    return await axios.get(api + urls.accounts + publicKey);
}

export async function getBlock(api, block) {
    return await axios.get(api + `${urls.block}${block}${urls.manifest}`);
};

export async function getBlockOperations(api, block) {
    return await axios.get(api + `${urls.block}${block}${urls.operations}`);
}

export async function getBlocks(api, currHeight) {
    return await axios.get(api + urls.blocks + (currHeight - 10));
};

export async function getCurrencies(api) {
    return await axios.get(api + urls.currencies);
}

export async function getCurrency(api, currency) {
    return await axios.get(api + urls.currencies + "/" + currency);
}

// libs
export function parseCurrency(currency) {
    var idx = currency.indexOf(':');
    if (idx < 0 || currency.indexOf('{') > -1) {
        return null;
    }
    return currency.substring(idx + 1, currency.length);
}

export function parseDate(date, isFull) {
    let parsed = Array.from(date)
        .map(
            x => {
                switch (x) {
                    case '-':
                        return "/";
                    case 'T':
                        return ", ";
                    case 'Z':
                        return "";
                    default:
                        return x;
                }
            }
        )
        .join('');

    const idx = parsed.indexOf('.');
    if(idx < 0 || isFull) {
        return parsed;
    }
    else {
        return parsed.substring(0, idx);
    }
}

export function key() {
    return "" + Math.random();
}

export function isAddress(target, version) {

    const idx = target.indexOf(`:${process.env.REACT_APP_ACCOUNT_HINT}-${version}`);
    if (idx < 0) {
        return false;
    }

    const address = target.substring(0, idx);
    if (!/^[a-zA-Z0-9]+(?![^a-zA-Z0-9])\b/.test(address.trim())) {
        return false;
    }

    return true;
}
