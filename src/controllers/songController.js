const Song = require('../model/song');
const Joi = require('joi');
const updateSongSchema = Joi.object({
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

const songValidationSchema = Joi.object({
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

exports.createSong = async (req, res) => {
    const { artistName, artistImageURL, albums } = req.body;

    // Validate the request body
    const { error } = songValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    try {
        let song = await Song.findOne({ artistName });

        if (!song) {
            song = new Song({
                artistName,
                artistImageURL,
                albums
            });
        } else {
            albums.forEach(newAlbum => {
                const albumIndex = song.albums.findIndex(album => album.albumName === newAlbum.albumName);
                if (albumIndex > -1) {
                    newAlbum.songs.forEach(newSong => {
                        const songIndex = song.albums[albumIndex].songs.findIndex(song => song.songName === newSong.songName);
                        if (songIndex > -1) {
                            // Optionally update song details if needed
                        } else {
                            song.albums[albumIndex].songs.push(newSong);
                        }
                    });
                } else {
                    song.albums.push(newAlbum);
                }
            });
        }

        await song.save();
        res.status(200).json({ success: true, data: song });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.searchSongs = async (req, res) => {
    const { query } = req.query;
  
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
  
    const searchRegex = new RegExp(query, 'i');
  
    try {
      const songs = await Song.aggregate([
        { $unwind: '$albums' },
        { $unwind: '$albums.songs' },
        {
          $match: {
            $or: [
              { 'albums.songs.songName': searchRegex },
              { artistName: searchRegex },
              { 'albums.songs.category': searchRegex }
            ]
          }
        },
        {
          $group: {
            _id: {
              artistId: '$_id',
              albumId: '$albums._id'
            },
            artistName: { $first: '$artistName' },
            artistImageURL: { $first: '$artistImageURL' },
            albumName: { $first: '$albums.albumName' },
            albumImageURL: { $first: '$albums.albumImageURL' },
            songs: {
              $push: {
                _id: '$albums.songs._id',
                songName: '$albums.songs.songName',
                songImageURL: '$albums.songs.songImageURL',
                songURL: '$albums.songs.songURL',
                category: '$albums.songs.category'
              }
            },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' }
          }
        },
        {
          $group: {
            _id: '$_id.artistId',
            artistName: { $first: '$artistName' },
            artistImageURL: { $first: '$artistImageURL' },
            albums: {
              $push: {
                _id: '$_id.albumId',
                albumName: '$albumName',
                albumImageURL: '$albumImageURL',
                songs: '$songs'
              }
            },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' }
          }
        },
        {
          $project: {
            _id: 1,
            artistName: 1,
            artistImageURL: 1,
            createdAt: 1,
            updatedAt: 1,
            albums: {
              $filter: {
                input: '$albums',
                as: 'album',
                cond: { $gt: [{ $size: '$$album.songs' }, 0] }
              }
            }
          }
        }
      ]);
  
      res.status(200).json(songs);
    } catch (error) {
      res.status(500).json({ message: 'Error searching songs', error });
    }
  };
  
  
  exports.getOverallStatistics = async (req, res) => {
    try {
        const totalSongs = await Song.aggregate([
            { $unwind: '$albums' },
            { $unwind: '$albums.songs' },
            { $count: 'totalSongs' }
        ]);

        const totalArtists = await Song.distinct('artistName');

        const totalAlbums = await Song.aggregate([
            { $unwind: '$albums' },
            { $group: { _id: '$albums.albumName' } },
            { $count: 'totalAlbums' }
        ]);

        const totalGenres = await Song.aggregate([
            { $unwind: '$albums' },
            { $unwind: '$albums.songs' },
            { $group: { _id: '$albums.songs.category' } },
            { $count: 'totalGenres' }
        ]);

        const songsByGenre = await Song.aggregate([
            { $unwind: '$albums' },
            { $unwind: '$albums.songs' },
            { $group: { _id: '$albums.songs.category', count: { $sum: 1 } } }
        ]);

        const songsByArtist = await Song.aggregate([
            { $unwind: '$albums' },
            { $unwind: '$albums.songs' },
            { $group: { _id: '$artistName', count: { $sum: 1 } } }
        ]);

        const albumsByArtist = await Song.aggregate([
            { $unwind: '$albums' },
            { $group: { _id: '$artistName', albums: { $addToSet: '$albums.albumName' } } },
            { $project: { _id: 1, count: { $size: '$albums' } } }
        ]);

        const songsInAlbum = await Song.aggregate([
            { $unwind: '$albums' },
            { $group: { _id: '$albums.albumName', count: { $sum: 1 } } }
        ]);

        const statistics = {
            totalSongs: totalSongs[0]?.totalSongs || 0,
            totalArtists: totalArtists.length,
            totalAlbums: totalAlbums[0]?.totalAlbums || 0,
            totalGenres: totalGenres[0]?.totalGenres || 0,
            songsByGenre,
            songsByArtist,
            albumsByArtist,
            songsInAlbum
        };

        res.status(200).json(statistics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllSongs = async (req, res) => {
    try {
        const songs = await Song.find();
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSongById = async (req, res) => {
    const songId = req.params.id;

    try {
        // Find the song by nested song ID
        const song = await Song.findOne({ "albums.songs._id": songId });

        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }

        // Find the album and the song within the album
        const album = song.albums.find(album => album.songs.some(song => song._id.toString() === songId));
        const songDetail = album.songs.find(song => song._id.toString() === songId);

        // Construct the response
        const response = {
            artistName: song.artistName,
            artistImageURL: song.artistImageURL,
            albumName: album.albumName,
            albumImageURL: album.albumImageURL,
            song: songDetail
        };

        res.status(200).json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.updateSong = async (req, res) => {
    const songId = req.params.id;

    // Validate the request body
    const { error } = updateSongSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { artistName, artistImageURL, albumName, albumImageURL, songName, songImageURL, songURL, category } = req.body;

    try {
        let song = await Song.findOne({ "albums.songs._id": songId });

        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }

        const albumIndex = song.albums.findIndex(album => album.songs.some(song => song._id.toString() === songId));
        const songIndex = song.albums[albumIndex].songs.findIndex(song => song._id.toString() === songId);

        if (artistName) song.artistName = artistName;
        if (artistImageURL) song.artistImageURL = artistImageURL;
        if (albumName) song.albums[albumIndex].albumName = albumName;
        if (albumImageURL) song.albums[albumIndex].albumImageURL = albumImageURL;
        if (songName) song.albums[albumIndex].songs[songIndex].songName = songName;
        if (songImageURL) song.albums[albumIndex].songs[songIndex].songImageURL = songImageURL;
        if (songURL) song.albums[albumIndex].songs[songIndex].songURL = songURL;
        if (category) song.albums[albumIndex].songs[songIndex].category = category;

        await song.save();
        res.status(200).json({ success: true, data: song });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSong = async (req, res) => {
    const songId = req.params.id;

    try {
       
        let songDoc = await Song.findOne({ "albums.songs._id": songId });

        if (!songDoc) {
            return res.status(404).json({ message: 'Song not found' });
        }

        
        const albumIndex = songDoc.albums.findIndex(album => album.songs.some(song => song._id.toString() === songId));
        if (albumIndex === -1) {
            return res.status(404).json({ message: 'Album not found' });
        }

        const songIndex = songDoc.albums[albumIndex].songs.findIndex(song => song._id.toString() === songId);
        if (songIndex === -1) {
            return res.status(404).json({ message: 'Song not found' });
        }

        
        if (songDoc.albums[albumIndex].songs.length === 1) {
            
            await Song.findByIdAndDelete(songDoc._id);
            return res.status(200).json({ success: true, message: 'Album with the only song deleted successfully' });
        } else {
            
            songDoc.albums[albumIndex].songs.splice(songIndex, 1);

            await songDoc.save();
            return res.status(200).json({ success: true, message: 'Song deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
