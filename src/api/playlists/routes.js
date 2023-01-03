const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists',
        handler: handler.postPlaylistByOwnerHandler,
        options: {
            auth: 'openmusicsapp_jwt',
          },
    },
    {
        method: 'GET',
        path: '/playlists',
        handler: handler.getPlaylistByOwnerHandler,
        options: {
            auth: 'openmusicsapp_jwt',
          },
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}',
        handler: handler.deletePlaylistByOwnerHandler,
        options: {
            auth: 'openmusicsapp_jwt',
          },
    },
    {
        method: 'POST',
        path: '/playlists/{playlistId}/songs',
        handler: handler.postSongToPlaylistHandler,
        options: {
            auth: 'openmusicsapp_jwt',
          },
    },
    {
        method: 'GET',
        path: '/playlists/{playlistId}/songs',
        handler: handler.getSongInPlaylistHandler,
        options: {
            auth: 'openmusicsapp_jwt',
          },
    },
    {
        method: 'DELETE',
        path: '/playlists/{playlistId}/songs',
        handler: handler.deleteSongInPlaylistHandler,
        options: {
            auth: 'openmusicsapp_jwt',
          },
    },
];

module.exports = routes;
