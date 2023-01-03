const ClientError = require('../../exceptions/ClientError');

class UploadCoverHandler {
    constructor(service, validator, albumService) {
        this._service = service;
        this._validator = validator;
        this._albumService = albumService;

        this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);

    }

    async postUploadCoverHandler(request, h) {
        try {
            const { cover } = request.payload;
            const { id } = request.params;

            this._validator.validateCoverHeaders(cover.hapi.headers);

            const filename = await this._service.writeFile(cover, cover.hapi);
            const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

            await this._albumService.addCoverAlbumById(id, coverUrl);
            const response = h.response({
                status: 'success',
                message: 'Cover berhasil ditambahkan',
                data: {
                    fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`,
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
            console.error(error);
            return response;
        }
    }
}

module.exports = UploadCoverHandler;