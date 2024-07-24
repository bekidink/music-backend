const Joi = require('joi');
exports. updateSongSchema = Joi.object({
    artistName: Joi.string().optional().messages({
        'string.base': 'Artist Name should be a type of text',
        'string.empty': 'Artist Name cannot be an empty field'
    }),
    
    albumName: Joi.string().optional().messages({
        'string.base': 'Album Name should be a type of text',
        'string.empty': 'Album Name cannot be an empty field'
    }),
   
    songName: Joi.string().optional().messages({
        'string.base': 'Song Name should be a type of text',
        'string.empty': 'Song Name cannot be an empty field'
    }),
    songImageURL: Joi.string().uri().optional().messages({
        'string.base': 'Song Image URL should be a type of text',
        'string.empty': 'Song Image URL cannot be an empty field',
        'string.uri': 'Song Image URL must be a valid URI'
    }),
    songURL: Joi.string().uri().optional().messages({
        'string.base': 'Song URL should be a type of text',
        'string.empty': 'Song URL cannot be an empty field',
        'string.uri': 'Song URL must be a valid URI'
    }),
    category: Joi.string().valid('Classical', 'Popular', 'Rock', 'Hip Hop', 'Jazz', 'Electronic', 'Folk', 'Blues').required().messages({
        'any.required': 'Category is required',
        'any.only': 'Category must be one of Classical, Popular, Rock, Hip hop, Jazz, Electronic, Folk, Blues'
    })
});

exports. songValidationSchema = Joi.object({
    artistName: Joi.string().required().messages({
        'string.base': 'Artist Name should be a type of text',
        'string.empty': 'Artist Name cannot be an empty field',
        'any.required': 'Artist Name is required'
    }),
    
    albums: Joi.array().items(
        Joi.object({
            albumName: Joi.string().required().messages({
                'string.base': 'Album Name should be a type of text',
                'string.empty': 'Album Name cannot be an empty field',
                'any.required': 'Album Name is required'
            }),
           
            songs: Joi.array().items(
                Joi.object({
                    songName: Joi.string().required().messages({
                        'string.base': 'Song Name should be a type of text',
                        'string.empty': 'Song Name cannot be an empty field',
                        'any.required': 'Song Name is required'
                    }),
                    songImageURL: Joi.string().required().messages({
                        'string.base': 'Song Image URL should be a type of text',
                        'string.empty': 'Song Image URL cannot be an empty field',
                        'any.required': 'Song Image URL is required'
                    }),
                    songURL: Joi.string().required().messages({
                        'string.base': 'Song URL should be a type of text',
                        'string.empty': 'Song URL cannot be an empty field',
                        'any.required': 'Song URL is required'
                    }),
                    category: Joi.string().valid('Classical', 'Popular', 'Rock', 'Hip Hop', 'Jazz', 'Electronic', 'Folk', 'Blues').required().messages({
                        'any.required': 'Category is required',
                        'any.only': 'Category must be one of Classical, Popular, Rock, Hip hop, Jazz, Electronic, Folk, Blues'
                    })
                })
            ).required().messages({
                'array.base': 'Songs should be an array',
                'array.empty': 'Songs cannot be an empty field',
                'any.required': 'Songs are required'
            })
        })
    ).required().messages({
        'array.base': 'Albums should be an array',
        'array.empty': 'Albums cannot be an empty field',
        'any.required': 'Albums are required'
    })
});
// exports.module={songValidationSchema,updateSongSchema}