import axios from "axios";

// network
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

export function link(apiLink) {
    return urls.default + apiLink;
}

export async function getResponse(next) {
    return await axios.get(link(next));
}

export async function getNodeInfo() {
    return await axios.get(link(""));
}

export async function getAccount(address) {
    return await axios.get(link(urls.account + address));
}

export async function getAllOperations() {
    return await axios.get(link(urls.allOperation));
}

export async function getAccountOperations(address) {
    return await axios.get(link(urls.account + address + urls.operations));
}

export async function getAccounts(publicKey) {
    return await axios.get(link(urls.accounts + publicKey));
}

export async function getBlock(block) {
    return await axios.get(link(`${urls.block}${block}${urls.manifest}`));
};

export async function getBlockOperations(block) {
    return await axios.get(link(`${urls.block}${block}${urls.operations}`));
}

export async function getBlocks(currHeight) {
    return await axios.get(link(urls.blocks + (currHeight - 10)));
};

export async function getCurrencies() {
    return await axios.get(link(urls.currencies));
}

export async function getCurrency(currency) {
    return await axios.get(link(urls.currencies + "/" + currency));
}

// libs
export function parseCurrency(currency) {
    var idx = currency.indexOf(':');
    if (idx < 0 || currency.indexOf('{') > -1) {
        return null;
    }
    return currency.substring(idx + 1, currency.length);
}

export function parseDate(date) {
    return Array.from(date)
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
