const ClientError = require('../../exceptions/ClientError');

class PlaylistsHandler {
    constructor(playlistsService, playlistSongsService, songsService, validator) {
        this._playlistsService = playlistsService;
        this._playlistSongsService = playlistSongsService;
        this._songsService = songsService;
        this._validator = validator;

        this.postPlaylistByOwnerHandler = this.postPlaylistByOwnerHandler.bind(this);
        this.getPlaylistByOwnerHandler = this.getPlaylistByOwnerHandler.bind(this);
        this.deletePlaylistByOwnerHandler = this.deletePlaylistByOwnerHandler.bind(this);

        this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
        this.getSongInPlaylistHandler = this.getSongInPlaylistHandler.bind(this);
        this.deleteSongInPlaylistHandler = this.deleteSongInPlaylistHandler.bind(this);
    }

    async postPlaylistByOwnerHandler(request, h) {
        try {
            this._validator.validatePostPlaylistPayload(request.payload);

            const { name } = request.payload;
            const { id: credentialId } = request.auth.credentials;

            const playlistId = await this._playlistsService.addPlaylistByOwner({ name, owner: credentialId, });

            const response = h.response({
                status: 'success',
                message: 'Playlist berhasil ditambahkan',
                data: {
                    playlistId,
                },
            });
            response.code(201);
            return response;

        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            return response;

        }
    }

    async getPlaylistByOwnerHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;

            const playlists = await this._playlistsService.getPlaylistByOwner(credentialId);

            const response = h.response({
                status: 'success',
                data: {
                    playlists,
                },
            });
            response.code(200);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            return response;
        }
    }

    async deletePlaylistByOwnerHandler(request, h) {
        try {
            const { id } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._playlistsService.verifyPlaylistOwner(id, credentialId);

            await this._playlistsService.deletePlaylistByOwner(id);

            const response = h.response({
                status: 'success',
                message: 'Playlist berhasil dihapus',
            });
            response.code(200);
            return response;

        } catch (error) {
            if (error instanceof ClientError) {

                const response = h.response({
                    status: 'fail',
                    message: 'Playlist gagal dihapus. Id tidak ditemukan',
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            return response;
        }
    }

    async postSongToPlaylistHandler(request, h) {
        try {
            this._validator.validatePostSongToPlaylistPayload(request.payload);

            const { songId } = request.payload;
            const { playlistId } = request.params;
            const { id: userId } = request.auth.credentials;

            await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

            await this._songsService.verifySongExist(songId);
            await this._playlistSongsService.addSongToPlaylist({ songId, playlistId, userId });

            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan ke playlist',
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: 'Lagu gagal ditambahkan ke playlist',
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            return response;
        }
    }

    async getSongInPlaylistHandler(request, h) {
        try {
            const { id: userId } = request.auth.credentials;
            const { playlistId } = request.params;

            await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

            const playlists = await this._playlistsService.getPlaylistById(playlistId);

            const songsFromPlaylist = await this._playlistSongsService.getSongInPlaylist(playlistId, userId);

            const response = h.response({
                status: 'success',
                message: 'Lagu dalam playlist berhasil didapatkan',
                data: {
                    playlist: {
                        ...playlists,
                        songs: songsFromPlaylist,
                    }
                },
            });
            response.code(200);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {

                const response = h.response({
                    status: 'fail',
                    message: 'Playlist gagal didapatkan. Id tidak ditemukan',
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            return response;
        }
    }

    async deleteSongInPlaylistHandler(request, h) {
        try {
            this._validator.validateDeleteSongFromPlaylistPayload(request.payload);

            const { playlistId } = request.params;
            const { songId } = request.payload;
            const { id: userId } = request.auth.credentials;

            await this._playlistSongsService.deleteSongInPlaylistById(playlistId, songId, userId);

            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil dihapus dari playlist',
            });
            response.code(200);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {

                const response = h.response({
                    status: 'fail',
                    message: 'Lagu gagal dihapus dari playlist. Id tidak ditemukan',
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            return response;
        }
    }
}

module.exports = PlaylistsHandler;