let accessToken = null;
let refreshToken = null;
let tokenExpiry = null;

export function setTokens({ access, refresh, expiresIn }) {
    accessToken = access;
    refreshToken = refresh;
    tokenExpiry = Date.now() + expiresIn * 1000; // Convert to milliseconds
}

export function getAccessToken() {
    return accessToken;
}

export function getRefreshToken() {
    return refreshToken;
}

//! this functions need a refactoring for a better time managment ( toma en ingle pa avo te lo escribi)
export function isTokenExpired() {
    return !tokenExpiry || Date.now() >= tokenExpiry;
}

