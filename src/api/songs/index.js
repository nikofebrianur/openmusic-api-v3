const SongHandler = require('./SongHandler');
const routes = require('../songs/routes');

module.exports = {
    name: 'song-handler',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const songhandler = new SongHandler(service, validator);
        server.route(routes(songhandler));
    },
};
