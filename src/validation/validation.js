const Joi = require('joi');
 const updateSongSchema = Joi.object({
    artistName: Joi.string().optional(),
    artistImageURL: Joi.string().uri().optional(),
    albumName: Joi.string().optional(),
    albumImageURL: Joi.string().uri().optional(),
    songName: Joi.string().optional(),
    songImageURL: Joi.string().uri().optional(),
    songURL: Joi.string().uri().optional(),
    category: Joi.string().optional()
})
exports.module=updateSongSchema