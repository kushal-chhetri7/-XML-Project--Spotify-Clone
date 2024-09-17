function displayUserInfo(user) {
    $("#user-info").html(`
        <h2>${user.display_name}</h2>
        <img src="${user.images[0]?.url}" alt="User Image" width="100">
    `);
    
    $("#authorize-btn").hide();
    $("#playlists-list-txt").show();
    $("#create-playlist-btn").show();  
}
function displayUserPlaylists(playlists) {
    localStorage.setItem('user_playlists', JSON.stringify(playlists.items));
    
    const playlistItems = playlists.items.map(playlist => {
        const imageUrl = (playlist.images && playlist.images.length > 0) 
                        ? playlist.images[0].url 
                        : 'default_playlist_image_url';
        
        return `
            <li class="playlist-item" data-playlist-id="${playlist.id}">
                <div class="playlist-info-container">
                    <img src="${imageUrl}" alt="${playlist.name}">
                    <div class="playlist-info">
                        <p class="playlist-name">${playlist.name}</p>
                        <p class="playlist-owner">by ${playlist.owner.display_name}</p>
                    </div>
                </div>
            </li>
        `;
    }).join('');

    $("#playlists-list").html(playlistItems);

    $(".playlist-item").click(function() {
        const playlistId = $(this).data("playlist-id");
        displayPlaylistTracks(playlistId).then(response => {
            displayTracks(response, true);
        }).catch(error => {
            console.error("Error fetching playlist tracks:", error);
            alert("Failed to load tracks. Please try again.");
        });
    });
}

function displayTracks(tracks, isPlaylist = false) {
    const trackItems = tracks.items.map(item => {
        const track = isPlaylist ? item.track : item;
        return `
            <div class="track-item" data-track-id="${track.id}" data-track-name="${track.name}" data-track-artist="${track.artists[0].name}" data-track-album="${track.album.name}" data-track-url="${track.preview_url}">
                <img src="${track.album.images[0]?.url}" alt="${track.name}" width="100">
                <div>
                    <h3>${track.name}</h3>
                    <p>${track.artists.map(artist => artist.name).join(', ')}</p>
                    <button class="add-to-playlist-btn" data-track-id="${track.id}">Add To Playlist</button>
                </div>
            </div>
        `;
    }).join('');

    $("#track-results").html(trackItems);

    $(".track-item").click(function() {
        const trackName = $(this).data("track-name");
        const trackArtist = $(this).data("track-artist");
        const trackAlbum = $(this).data("track-album");
        const trackUrl = $(this).data("track-url");

        if (trackUrl) {
            displayMusicPlayer(trackName, trackArtist, trackAlbum, trackUrl);
        } else {
            alert("This track does not have a preview available.");
        }
    });

    $(".add-to-playlist-btn").click(function(event) {
        event.stopPropagation(); 
        const trackId = $(this).data("track-id"); 
        addToPlaylist(trackId);
    });
}

function displayMusicPlayer(trackName, trackArtist, trackAlbum, trackUrl) {
    const playerHtml = `
        <div class="music-player">
            <h3>Now Playing: ${trackName}</h3>
            <p>Artist: ${trackArtist}</p>
            <p>Album: ${trackAlbum}</p>
            <audio controls autoplay>
                <source src="${trackUrl}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
        </div>
    `;
    $("#track-results").html(playerHtml);
}

function updateUserPlaylists() {
    getUserPlaylists().then(playlists => {
        displayUserPlaylists(playlists);
    }).catch(error => {
        console.error("Error fetching updated playlists:", error);
    });
}

function addToPlaylist(trackId) {
    const playlists = localStorage.getItem('user_playlists');
    if (!playlists) {
        alert("No playlists found. Please authorize and fetch playlists first.");
        return;
    }

    const parsedPlaylists = JSON.parse(playlists);
    const playlistOptions = parsedPlaylists.map(playlist => `
        <option value="${playlist.id}">${playlist.name}</option>
    `).join('');

    const popupHtml = `
        <div id="playlist-popup" class="popup">
            <div class="popup-content">
                <span class="close">&times;</span>
                <h3>Select Playlist to Add Track</h3>
                <select id="playlist-select">
                    ${playlistOptions}
                </select>
                <button id="confirm-add-to-playlist">Add to Playlist</button>
            </div>
        </div>
    `;

    $('body').append(popupHtml);

    $('.close').click(function() {
        $('#playlist-popup').remove();
    });

    $('#confirm-add-to-playlist').click(function() {
        const selectedPlaylistId = $('#playlist-select').val();
        const trackUri = `spotify:track:${trackId}`;

        if (selectedPlaylistId) {
            addTrackToPlaylist(selectedPlaylistId, trackUri).then(() => {
                alert("Track added to playlist successfully!");
                $('#playlist-popup').remove();
                return updateUserPlaylists();
            }).catch(xhr => {
                console.error("Error adding track to playlist:", xhr.responseText);
                alert("Failed to add track to playlist. Please try again.");
            });
        }
    });
}
