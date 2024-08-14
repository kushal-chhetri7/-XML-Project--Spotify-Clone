function getUserInfo() {
    return $.ajax({
        url: "https://api.spotify.com/v1/me",
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

function getUserPlaylists() {
    return $.ajax({
        url: "https://api.spotify.com/v1/me/playlists",
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

function searchTracks(query) {
    return $.ajax({
        url: `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}`,
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

function displayPlaylistTracks(playlistId) {
    return $.ajax({
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

function createNewPlaylist(playlistName) {
    const userId = localStorage.getItem('spotify_user_id');
    if (!userId) {
        alert("User ID not found. Please authorize first.");
        return;
    }

    return $.ajax({
        url: `https://api.spotify.com/v1/users/${userId}/playlists`,
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        data: JSON.stringify({
            name: playlistName,
            public: false, 
            description: "New playlist created via Spotify API"
        })
    });
}

function addTrackToPlaylist(playlistId, trackUri) {
    return $.ajax({
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        data: JSON.stringify({
            uris: [trackUri],
            position: 0
        })
    });
}
