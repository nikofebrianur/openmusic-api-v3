class CollaborationsHandler {
    constructor(collaborationsService, playlistsService, validator) {
        this._collaborationsService = collaborationsService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
        this.deleteCollaborationsHandler = this.deleteCollaborationsHandler.bind(this);
    }

    async postCollaborationsHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload);

        const { id: credentialsId } = request.auth.credentials;
        const { playlistId, userId } = request.payload;
        await this._playlistsService.verifyPlaylistAccess(playlistId,credentialsId);
        const collaborationId = await this._collaborationsService.addCollaboration({ playlistId, userId });

        const response = h.response({
            status: 'success',
            message: 'Kolaborasi berhasil ditambahkan',
            data: {
                collaborationId,
            },
        });
        response.code(201);
        return response;
    }

    async deleteCollaborationsHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload);

        const { id: credentialsId } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        await this._playlistsService.verifyPlaylistAccess(playlistId,credentialsId);

        await this._collaborationsService.deleteCollaboration({ playlistId, userId });

        const response = h.response({
            status: 'success',
            message: 'Kolaborasi berhasil dihapus',
          });
          response.code(200);
          return response;
    }
}

module.exports = CollaborationsHandler;
