const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");

class AlbumLikesService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addAlbumLike(userId, albumId) {
        const id = `album_likes-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        }

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError("Gagal memberikan like ke album");
        }

        await this._cacheService.delete(`album_likes:${albumId}`);
        return result.rows[0].id;
    }

    async getLikesCount(albumId) {
        try {
            const result = await this._cacheService.get(`album_likes:${albumId}`);
            return {
                count: JSON.parse(result),
                source: "cache",
            };
        } catch (error) {
            const query = {
                text: "SELECT * FROM album_likes WHERE album_id = $1",
                values: [albumId],
            };

            const result = await this._pool.query(query);
            if (!result.rows.length) {
                throw new InvariantError("Album belum ada like");
            }

            await this._cacheService.set(`album_likes:${albumId}`, JSON.stringify(result.rows.length));

            return {
                count: result.rows.length,
                source: "db",
            };
        }
    }

    async deleteAlbumLike(userId, albumId) {
        const query = {
          text: "DELETE FROM album_likes WHERE user_id = $1 AND album_id = $2 returning id",
          values: [userId, albumId],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rows.length) {
          throw new InvariantError("Gagal memberi dislike");
        }
    
        await this._cacheService.delete(`album_likes:${albumId}`);
      }

    async verifyLikes(userId, albumId) {
        const query = {
          text: "SELECT * FROM album_likes WHERE user_id = $1 AND album_id = $2",
          values: [userId, albumId],
        };
    
        const result = await this._pool.query(query);
    
        return result.rows.length;
      }
}

module.exports = AlbumLikesService;
