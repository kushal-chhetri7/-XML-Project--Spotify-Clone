$(document).ready(async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get('code');

    if (!loadAccessToken() && authorizationCode) {
        try {
            const response = await getAccessToken(authorizationCode);
            storeAccessToken(response.access_token, response.expires_in);
            window.history.replaceState({}, document.title, window.location.pathname);

            const userInfo = await getUserInfo();
            localStorage.setItem('spotify_user_id', userInfo.id); 
            displayUserInfo(userInfo);

            const playlists = await getUserPlaylists();
            if (playlists.items && playlists.items.length > 0) {
                displayUserPlaylists(playlists);
            } else {
                $("#playlists-list").html("<li>No playlists found.</li>");
            }
        } catch (error) {
            console.error("Failed to get access token:", error);
            return;
        }
    } else if (loadAccessToken()) {
        try {
            const userInfo = await getUserInfo();
            localStorage.setItem('spotify_user_id', userInfo.id);
            displayUserInfo(userInfo);

            const playlists = await getUserPlaylists();
            if (playlists.items && playlists.items.length > 0) {
                displayUserPlaylists(playlists);
            } else {
                $("#playlists-list").html("<li>No playlists found.</li>");
            }

        } catch (error) {
            console.error("Failed to load user info or playlists:", error);
        }
    }

    $("#authorize-btn").click(getAuthorizationCode);  

    $("#create-playlist-btn").click(async () => {
        const playlistName = prompt("Enter the name for your new playlist:");
        if (playlistName) {
            try {
                await createNewPlaylist(playlistName);
                alert(`Playlist "${playlistName}" created successfully!`);
                await updateUserPlaylists();
            } catch (error) {
                console.error("Error creating playlist:", error);
                alert("Failed to create playlist. Please try again.");
            }
        }
    });

    $("#search-btn").click(async function() {
        if (!accessToken || !loadAccessToken()) {
            alert("Please authorize your Spotify account first before searching.");
            return;
        }
        const query = $("#search-bar").val();
        if (query) {
            try {
                const tracks = await searchTracks(query);
                displayTracks(tracks.tracks);
            } catch (error) {
                console.error("Error searching for tracks:", error);
            }
        }
    });
});
