


const {getDatabase} = require('./database/sqlite');
const {insertTest, getTests} = require('./database/test');
const {initialiseArtistsTable, insertArtist, dropArtistsTable, getArtists, getArtist, changeArtistImage, updateArtist} = require('./database/artists');
const {initialiseAlbumsTable, dropAlbumsTable, insertAlbum, getDiscography} = require('./database/albums');
const {initialiseTracksTable, dropTracksTable, insertTrack} = require('./database/tracks');
const {initialiseImagesTable, dropImagesTable, insertImage, getImages} = require('./database/images');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const multer = require('multer');

let port = 8080;
let root = "./public"

let http = require("http");
let fs = require("fs").promises;
let OK = 200, NotFound = 404, BadType = 415, Error = 500;
let types, paths;

const app = express();
app.use(express.static("public"));
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));


app.set('view engine', 'ejs');

app.listen(port, () => {
  console.log('listening on ' + port);
})

cleanDatabase();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname+"/public/images/artists");
    },
    filename: async function (req, file, cb) {
        cb(null, req.params.artistName);
    }
});


let uploadArtist = multer({ storage: storage });
app.post('/upload/artistPhoto/:artistName', uploadArtist.single('photo'), async(req, res) => {
    if(req.file) {
        await changeArtistImage(req.params.artistName, "/images/artists/"+req.params.artistName);
        res.status(OK).json(req.file);
    }
    else {
        res.status(500);
        console.log("Uploading image failed");
    }
});


app.all('/', async(req, res) => {
    if (req.method === 'GET') {
        let artists = await getArtists();
        res.status(OK).render('main', {
            artists: artists
        });
    } else if (req.method === 'POST') {

    } else if (req.method === 'PUT') {
        
    }
});

app.all('/newArtist', async(req, res) => {
    if (req.method === 'GET') {
        res.status(OK).render('new', {

        });
    } else if (req.method === 'POST') {

    } else if (req.method === 'PUT') {
        
    }
});

app.all('/artists/:artistName/edit', async(req, res) => {
    if (req.method === 'GET') {
        let artist = await getArtist(req.params.artistName);
        if (artist !== undefined) {
            res.status(OK).render('edit', {
                artist: artist,
            });
    } else res.status(NotFound).send("Artist not found");

    } else if (req.method === 'POST') {

    } else if (req.method === 'PUT') {
        
    }
});

app.all('/artists', async(req, res) => {
    if (req.method === 'GET') {
    } else if (req.method === 'POST') {
        let name = req.body.bandname.replace(/ /g,"-");
        let insert = await insertArtist(name, "/images/icons/blank.jpg", req.body.bio, req.body.genre);
        if (insert ==0) {
            res.status(Error).send("Band name taken, please try a different name");
        }
        else {
            res.status(OK).redirect("/artists/"+name+"/edit");
        }
    } else if (req.method === 'PUT') {
        
    }
});

app.all('/artists/:artistName', async(req, res) => {
    if (req.method === 'GET') {
        let artist = await getArtist(req.params.artistName);
        if (artist !== undefined) {
            let discography = await getDiscography(artist.id);
            let images = await getImages(artist.id);
            res.status(OK).render('artist', {
                artist: artist,
                discography: discography,
                images: images
            });

        } else res.status(NotFound).send("Artist not found");

    } else if (req.method === 'POST') {
        let artist = await getArtist(req.params.artistName);
        if (artist !== undefined) {
            await updateArtist(artist.id, req.body.bio, req.body.genre);
            res.status(OK).redirect("/artists/"+req.params.artistName+"/edit");

        } else res.status(NotFound).send("Specified Artist not found");

    } else if (req.method === 'PUT') {
        
    }
});

app.all('/artists/:artistName/albums', async(req, res) => {
    if (req.method === 'GET') {
        let artist = await getArtist(req.params.artistName);
        if (artist !== undefined) {
            res.status(OK).send(await getDiscography(artist.id));
        } else res.status(NotFound).send("Specified Artist not found");
        

    } else if (req.method === 'POST') {
        let artist = (await getArtist(req.params.artistName));
        if (artist !== undefined) {
            let albumId = await insertAlbum(req.body.title, req.body.releaseDate, req.body.imageURL, artist.id);
            res.status(OK).send('A row has been inserted into the albums table with ID: '+albumId);


        } else res.status(NotFound).send("Specified Artist not found");

    } else if (req.method === 'PUT') {
        
    }
});

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname+"/public/images/albums");
    },
    filename: function (req, file, cb) {
        let name = req.params.artistName+"--"+req.body.albumName.replace(/ /g,"-");
        cb(null, name);
    }
});


uploadAlbum = multer({ storage: storage2 });
app.post('/upload/:artistName/album', uploadAlbum.single('albumimage'), async(req, res) => {
    let artist = (await getArtist(req.params.artistName));
    if (artist !== undefined) {
        console.log(req.body.albumName);
        let path = "/images/albums/"+req.params.artistName+"--"+req.body.albumName.replace(/ /g,"-");
        let spotURL = "";
        try{
            spotURL = new URL(req.body.spotifyLink);
        }
        catch (e) {
            res.send("Bad spotify URL")
        };
        if(spotURL) {
            let spotify = spotURL.pathname.replace("/album/", "");
            let albumId = await insertAlbum(req.body.albumName, req.body.releaseYear, path, artist.id, spotify);
            res.status(OK).redirect("/artists/"+req.params.artistName+"/edit");
        }
        if(req.file) {
            
        }
        else {
            res.status(500);
            console.log("Uploading image failed");

        } 
    } else res.status(NotFound).send("Specified Artist not found");
});

const storage3 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname+"/public/images/artists");
    },
    filename: function (req, file, cb) {
        let name = req.params.artistName+"-"+Date.now();
        cb(null, name);
    }
});

let uploadPhoto = multer({ storage: storage3 });
app.post('/upload/:artistName/image', uploadPhoto.single('artistphoto'), async(req, res) => {
    if(req.file) {
        let artist = (await getArtist(req.params.artistName));
        if (artist !== undefined) {
             await insertImage("/images/artists/"+req.file.filename, artist.id);
            res.status(OK).redirect("/artists/"+req.params.artistName+"/edit");
        } else res.status(NotFound).send("Specified Artist not found");

    }
    else {
        res.status(500);
        console.log("Uploading image failed");
    }
});


app.all('/albums', async(req, res) => {
    if (req.method === 'GET') {

    } else if (req.method === 'POST') {
        
        

    } else if (req.method === 'PUT') {
        
    }
});

async function cleanDatabase() {
    try{
        await getDatabase();
        console.log('Cleaning database...');
        await dropArtistsTable();
        await initialiseArtistsTable();
        await dropAlbumsTable();
        await initialiseAlbumsTable();
        await dropTracksTable();
        await initialiseTracksTable();
        await dropImagesTable();
        await initialiseImagesTable();
        console.log('Database clean complete');

        insertTestData();
    }
    catch(e) {
        console.log(e);
    }
}

async function insertTestData() {
    try {
        await insertArtist("Polyphia", "/images/artists/polyphia.jpg", "Hailing from the quiet suburbs of Plano, Texas, progressive rock outfit, Polyphia, are anything but mild-mannered. With adistinctly thought-outand well-orchestrated sound, the quartet pummels out blistering blast beats, and an onslaught of guitarshreds that blends, seamlessly, withmelodic grooves and a humble intensity that never wears on the ear. Capitalizing on a \"Standard of Excellence\", the band wishes to inspire those who listen with their doctrine of uncompromised work ethic and self-motivated success", "Progressive Metal");
        let artistId = (await getArtist("Polyphia")).id;
        await insertAlbum("New Levels New Devils", "2018", "/images/albums/polyphia--new-levels-new-devils.jpg", artistId, "1JYk1k73qSbXCCCciopZH7");
        await insertAlbum("Renaissance", "2016", "/images/albums/polyphia--renaissance.jpg", artistId, "1Ki56K82avE7nTkZEyVIE7",);
        await insertAlbum("Muse", "2014", "/images/albums/polyphia--muse.jpg", artistId, "1yTULCIrJxzeaJeaV5BXqp");
        await insertImage("/images/artists/polyphia-1.jpg", artistId);
        await insertImage("/images/artists/polyphia-2.jpg", artistId);
        await insertImage("/images/artists/polyphia-3.jpg", artistId);
        await insertImage("/images/artists/polyphia-4.jpg", artistId);
        await insertImage("/images/artists/polyphia-5.jpg", artistId);
        //let albumId = await insertAlbum("My third album", "2020-03-01", "/images/example3.jpg", artistId);
        //await insertTrack("Track 1", 1, albumId);
        //await insertTrack("Track 2", 2, albumId);
        //await insertTrack("Track 3", 3, albumId);
        //await insertTrack("Track 4", 4, albumId);

        await insertArtist("Animals-As-Leaders", "/images/artists/animals-as-leaders.jpg", "Animals as Leaders is an American, Washington, D.C.–based instrumental progressive metal band, formed by guitarist Tosin Abasi in 2007,which now includes guitarist Javier Reyes and drummer Matt Garstka. Their self-titled debut album was released in April 2009 byProstheticRecords. Tosin Abasi and Javier Reyes are also members of the supergroup T.R.A.M alongside former The Mars Volta wind instrumentalist AdrianTerrazas and Suicidal Tendencies drummer Eric Moore. Their second album, entitled Weightless was released on November 8th, 2011 in the US, November 4th in Europe,and November 7th in theUK. It includes Abasi and Reyes on guitars, and Navene Koperweis on drums. The band released their third album, The Joy Of Motion, their first album with drummer Matt Garstka,on March 25, 2014", "Progressive Metal");
        artistId = (await getArtist("Animals-As-Leaders")).id;
        await insertAlbum("The Madness of Many", "2016", "/images/albums/animals-as-leaders--the-madness-of-many.jpg", artistId, "13jTvLPx2N9JbLOmq4yYQW");
        await insertAlbum("The Joy of Motion", "2014", "/images/albums/animals-as-leaders--the-joy-of-motion.jpg", artistId, "3BfAgyF1AdYKaOO7EBoDw4");
        await insertAlbum("Weightless", "2011", "/images/albums/animals-as-leaders--weightless.jpg", artistId, "7IoPLwGpntUE7VaEXEU67i");
        await insertAlbum("Animals as Leaders", "2009", "/images/albums/animals-as-leaders--animals-as-leaders.jpg", artistId, "1BRtQtljRJIxroJXI20K39");
        await insertImage("/images/artists/animals-as-leaders-1.jpg", artistId);
        await insertImage("/images/artists/animals-as-leaders-2.jpg", artistId);
        await insertImage("/images/artists/animals-as-leaders-3.jpg", artistId);




    }
    catch(e) {

    }
}
