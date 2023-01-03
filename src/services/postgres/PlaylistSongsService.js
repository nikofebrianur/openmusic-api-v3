const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
    constructor(playlistsService) {
        this._pool = new Pool();
        this._playlistsService = playlistsService;
    }

    async addSongToPlaylist(payload) {
        const id = `playlistsongs-${nanoid(16)}`;
        
        const { playlistId, userId, songId } = payload;
        await this._playlistsService.verifyPlaylistExist(playlistId);
        await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

        const query = {
            text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }

        return result.rows[0].id;
    }

    async getSongInPlaylist(playlistId) {
        const query = {
            text: 'SELECT songs.id, songs.title, songs.performer FROM playlists INNER JOIN playlistsongs ON playlistsongs.playlist_id = playlists.id INNER JOIN songs ON songs.id = playlistsongs.song_id WHERE playlists.id = $1',
            values: [playlistId],
        };
        const result = await this._pool.query(query);

        if (!result.rows) {
            throw new InvariantError('Lagu tidak ditemukan di playlist');
        }
        return result.rows;
    }

    async deleteSongInPlaylistById(playlistId, songId, userId) {
        await this._playlistsService.verifyPlaylistExist(playlistId);
        await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

        const query = {
            text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
        }
    }
}

module.exports = PlaylistSongsService;