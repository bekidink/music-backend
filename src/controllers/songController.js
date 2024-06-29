const Song = require('../model/song');
const Joi = require('joi');
const { updateSongSchema } = require('../validation/validation');

const songValidationSchema = Joi.object({
    artistName: Joi.string().required(),
    artistImageURL: Joi.string().required(),
    albums: Joi.array().items(
        Joi.object({
            albumName: Joi.string().required(),
            albumImageURL: Joi.string().required(),
            songs: Joi.array().items(
                Joi.object({
                    songName: Joi.string().required(),
                    songImageURL: Joi.string().required(),
                    songURL: Joi.string().required(),
                    category: Joi.string().valid('Classical', 'Popular', 'Rock','Hip hop','Jazz','Electronic','Folk','Blues').required()
                })
            ).required()
        })
    ).required()
});

// Get all songs
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


// Update a song by ID
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
        // Find the song by song ID
        let song = await Song.findOne({ "albums.songs._id": songId });

        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }

        // Find the album and the song within the album
        const albumIndex = song.albums.findIndex(album => album.songs.some(song => song._id.toString() === songId));
        if (albumIndex === -1) {
            return res.status(404).json({ message: 'Album not found' });
        }

        const songIndex = song.albums[albumIndex].songs.findIndex(song => song._id.toString() === songId);
        if (songIndex === -1) {
            return res.status(404).json({ message: 'Song not found' });
        }

        // Remove the song from the album
        song.albums[albumIndex].songs.splice(songIndex, 1);

        // Save the updated song document
        await song.save();
        res.status(200).json({ success: true, message: 'Song deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Delete a song by ID

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
