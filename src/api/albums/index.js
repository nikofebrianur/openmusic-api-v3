const AlbumHandler = require('./AlbumHandler');
const routes = require('./routes');

module.exports = {
    name: 'album-handler',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const albumhandler = new AlbumHandler(service, validator);
        server.route(routes(albumhandler));
    },
};
