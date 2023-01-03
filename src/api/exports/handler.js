const ClientError = require('../../exceptions/ClientError');
const songs = require('../songs');

class ExportSongsPlaylistHandler {
    constructor(service, validator, playlistsService, playlistSongsService) {
        this._service = service;
        this._validator = validator;
        this._playlistsService = playlistsService;
        this._playlistSongsService = playlistSongsService;

        this.exportSongsPlaylistHandler = this.exportSongsPlaylistHandler.bind(this);
    }

    async exportSongsPlaylistHandler(request, h) {
        try {
            this._validator.validateExportSongsPayload(request.payload);

            const { id: userId } = request.auth.credentials;
            const { playlistId } = request.params;

            await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

            const playlists = await this._playlistsService.getPlaylistById(playlistId);
            const songsFromPlaylist = await this._playlistSongsService.getSongInPlaylist(playlistId, userId);

            const message = {
                playlist : {
                    id: playlists.id,
                    name: playlists.name,
                    songs: songsFromPlaylist,
                },
                targetEmail: request.payload.targetEmail,
            };

            await this._service.sendMessage('export:playlists', JSON.stringify(message));

            const response = h.response({
                status: 'success',
                message: 'Permintaan Anda dalam antrean',
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
            console.error(error);
            return response;
        }
    }

}

module.exports = ExportSongsPlaylistHandler;