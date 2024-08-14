const CLIENT_ID = "f2ad6ef5dad44666bb5b7bd676962320";
const CLIENT_SECRET = "ee97d2b611d34a77a91bd453912d2752";
const REDIRECT_URI = "http://localhost:5500/";
let accessToken = null;

function getAuthorizationCode() {
    const scopes = 'user-read-private playlist-modify-private playlist-modify-public user-library-read playlist-read-private';
    window.location.href = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
}

function getAccessToken(authorizationCode) {
    return $.ajax({
        url: "https://accounts.spotify.com/api/token",
        method: "POST",
        headers: {
            Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
            grant_type: "authorization_code",
            code: authorizationCode,
            redirect_uri: REDIRECT_URI
        }	
    });
}

function storeAccessToken(token, expiresIn) {
    accessToken = token;
    const expirationTime = Date.now() + expiresIn * 1000;
    localStorage.setItem('spotify_access_token', token);
    localStorage.setItem('spotify_token_expiration', expirationTime);
}

function loadAccessToken() {
    const token = localStorage.getItem('spotify_access_token');
    const expirationTime = localStorage.getItem('spotify_token_expiration');
    if (token && expirationTime && Date.now() < expirationTime) {
        accessToken = token;
        return true;
    }
    return false;
}
