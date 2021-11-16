import axios from 'axios';
import hint from './hint.json';

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
    if (idx < 0) {
        return null;
    }

    if(currency.indexOf('{') > -1 || currency.indexOf('}') > -1) {
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
    if (idx < 0 || isFull) {
        return parsed;
    }
    else {
        return parsed.substring(0, idx);
    }
}

export function parseDecimalFromAmount(amount) {

    const len = amount.length;
    const precision = process.env.REACT_APP_PRECISION;

    if (len > precision) {
        const integer = amount.substring(0, len - precision);
        const remain = amount.substring(len - precision);

        return `${integer}.${remain}`;
    }
    else if (len === precision) {
        return `0.${amount}`;
    }
    else {
        for (var i = 0; i < precision - len; i++) {
            amount = '0' + amount;
        }
        return `0.${amount}`;
    }
}

export function key() {
    return "" + Math.random();
}

export function isAddress(target, version) {

    const idx = target.indexOf(`~${hint.account}-${version}`);
    if (idx < 0) {
        return false;
    }

    const address = target.substring(0, idx);
    if (!/^[a-zA-Z0-9]+(?![^a-zA-Z0-9])\b/.test(address.trim())) {
        return false;
    }

    return true;
}

export function isPublicKey(target, version) {

    const idx = target.indexOf('~');
    if (idx < 0) {
        return false;
    }

    const pubHint = target.substring(idx + 1);
    switch (pubHint) {
        case hint.pubkey.btc + `-${version}`:
        case hint.pubkey.ether + `-${version}`:
        case hint.pubkey.stellar + `-${version}`:
            return true;
        default: return false;
    }
}

export function isCurrency(target) {
    if (!/^[A-Z]{3}(?![^*])\b/.test(target.trim())) {
        return false;
    }
    return true;
}