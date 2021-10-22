export const SET_VERSION = "SET_VERSION";

export function setVersion(version) {
    return {
        type: SET_VERSION,
        version,
    }
}