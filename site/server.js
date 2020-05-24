// Run a node.js web server for local development of a static web site. Create a
// site folder, put server.js in it, create a sub-folder called "public", with
// at least a file "index.html" in it. Start the server with "node server.js &",
// and visit the site at the address printed on the console.
//     The server is designed so that a site will still work if you move it to a
// different platform, by treating the file system as case-sensitive even when
// it isn't (as on Windows and some Macs). URLs are then case-sensitive.
//     All HTML files are assumed to have a .html extension and are delivered as
// application/xhtml+xml for instant feedback on XHTML errors. Content
// negotiation is not implemented, so old browsers are not supported. Https is
// not supported. Add to the list of file types in defineTypes, as necessary.

// Change the port to the default 80, if there are no permission issues and port
// 80 isn't already in use. The root folder corresponds to the "/" url.
const {getDatabase} = require('./database/sqlite');
const {insertTest, getTests} = require('./database/test');
const {initialiseArtistsTable, insertArtist, dropArtistsTable, getArtists, getArtist} = require('./database/artists');
const {initialiseAlbumsTable, dropAlbumsTable, insertAlbum, getDiscography} = require('./database/albums');
const {initialiseTracksTable, dropTracksTable, insertTrack} = require('./database/tracks');
const {initialiseImagesTable, dropImagesTable, insertImage, getImages} = require('./database/images');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

let port = 8080;
let root = "./public"

// Load the library modules, and define the global constants and variables.
// Load the promises version of fs, so that async/await can be used.
// See http://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
// The file types supported are set up in the defineTypes function.
// The paths variable is a cache of url paths in the site, to check case.
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

app.all('/', async(req, res) => {
    if (req.method === 'GET') {
        //res.status(OK).sendFile(__dirname + '/public/index.html');
        res.render('index', {
            test: "OUTOUT"
        });
        /*res.render("/public/index.html", {
            drinks: "drinks",
            tagline: "tagline"
        });*/
    } else if (req.method === 'POST') {

    } else if (req.method === 'PUT') {
        
    }
});

app.all('/test', async(req, res) => {
    if (req.method === 'GET') {
        res.status(OK).send(await getTests());
    } else if (req.method === 'POST') {
        res.status(OK).send(await insertTest('This is a test database record'));

    } else if (req.method === 'PUT') {
        
    }
});

app.all('/artists', async(req, res) => {
    if (req.method === 'GET') {
        res.status(OK).send(await getArtists());
    } else if (req.method === 'POST') {
        res.status(OK).send(await insertArtist(req.body.name, req.body.imageURL, req.body.bio));

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
        await insertArtist("Polyphia", "/images/artists/Polyphia/polyphia.jpg", "Hailing from the quiet suburbs of Plano, Texas, progressive rock outfit, Polyphia, are anything but mild-mannered. With adistinctly thought-outand well-orchestrated sound, the quartet pummels out blistering blast beats, and an onslaught of guitarshreds that blends, seamlessly, withmelodic grooves and a humble intensity that never wears on the ear. Capitalizing on a \"Standard of Excellence\", the band wishes to inspire those who listen with their doctrine of uncompromised work ethic and self-motivated success");
        let artistId = (await getArtist("Polyphia")).id;
        await insertAlbum("New Levels New Devils", "2018", "/images/albums/polyphia--new-levels-new-devils.jpg", artistId);
        await insertAlbum("Renaissance", "2016", "/images/albums/polyphia--renaissance.jpg", artistId);
        await insertAlbum("Muse", "2014", "/images/albums/polyphia--muse.jpg", artistId);
        await insertImage("/images/artists/Polyphia/polyphia-1.jpg", artistId);
        await insertImage("/images/artists/Polyphia/polyphia-2.jpg", artistId);
        await insertImage("/images/artists/Polyphia/polyphia-3.jpg", artistId);
        await insertImage("/images/artists/Polyphia/polyphia-4.jpg", artistId);
        await insertImage("/images/artists/Polyphia/polyphia-5.jpg", artistId);
        //let albumId = await insertAlbum("My third album", "2020-03-01", "/images/example3.jpg", artistId);
        //await insertTrack("Track 1", 1, albumId);
        //await insertTrack("Track 2", 2, albumId);
        //await insertTrack("Track 3", 3, albumId);
        //await insertTrack("Track 4", 4, albumId);

        await insertArtist("Animals-As-Leaders", "/images/artists/Animals-As-Leaders/animals-as-leaders.jpg", "Animals as Leaders is an American, Washington, D.C.–based instrumental progressive metal band, formed by guitarist Tosin Abasi in 2007,which now includes guitarist Javier Reyes and drummer Matt Garstka. Their self-titled debut album was released in April 2009 byProstheticRecords. Tosin Abasi and Javier Reyes are also members of the supergroup T.R.A.M alongside former The Mars Volta wind instrumentalist AdrianTerrazas and Suicidal Tendencies drummer Eric Moore. Their second album, entitled Weightless was released on November 8th, 2011 in the US, November 4th in Europe,and November 7th in theUK. It includes Abasi and Reyes on guitars, and Navene Koperweis on drums. The band released their third album, The Joy Of Motion, their first album with drummer Matt Garstka,on March 25, 2014");
        artistId = (await getArtist("Animals-As-Leaders")).id;
        await insertAlbum("The Madness of Many", "2016", "/images/albums/animals-as-leaders--the-madness-of-many.jpg", artistId);
        await insertAlbum("The Joy of Motion", "2014", "/images/albums/animals-as-leaders--the-joy-of-motion.jpg", artistId);
        await insertAlbum("Weightless", "2011", "/images/albums/animals-as-leaders--weightless.jpg", artistId);
        await insertAlbum("Animals as Leaders", "2009", "/images/albums/animals-as-leaders--animals-as-leaders.jpg", artistId);
        await insertImage("/images/artists/Animals-As-Leaders/animals-as-leaders-1.jpg", artistId);
        await insertImage("/images/artists/Animals-As-Leaders/animals-as-leaders-2.jpg", artistId);
        await insertImage("/images/artists/Animals-As-Leaders/animals-as-leaders-3.jpg", artistId);


    }
    catch(e) {

    }
}



// Check the site, giving quick feedback if it hasn't been set up properly.
// Start the http service. Accept only requests from localhost, for security.
// If successful, the handle function is called for each request.
async function start() {
    try {
            await fs.access(root);
            await fs.access(root + "/index.html");
            types = defineTypes();
            paths = new Set();
            paths.add("/");
            let service = http.createServer(handle);
            service.listen(port, "localhost");
            let address = "http://localhost";
            if (port != 80) address = address + ":" + port;
            console.log("Server running at", address);
        }
        catch (err) { console.log(err); process.exit(1); }
}



// Serve a request by delivering a file.
async function handle(request, response) {
    let url = request.url;
    if (url.endsWith("/")) url = url + "index.html";
    let ok = await checkPath(url);
    if (! ok) return fail(response, NotFound, "URL not found (check case)");
    let type = findType(url);
    if (type == null) return fail(response, BadType, "File type not supported");
    let file = root + url;
    let content = await fs.readFile(file);
    deliver(response, type, content);
}

// Check if a path is in or can be added to the set of site paths, in order
// to ensure case-sensitivity.
async function checkPath(path) {
    if (! paths.has(path)) {
        let n = path.lastIndexOf("/", path.length - 2);
        let parent = path.substring(0, n + 1);
        let ok = await checkPath(parent);
        if (ok) await addContents(parent);
    }
    return paths.has(path);
}

// Add the files and subfolders in a folder to the set of site paths.
async function addContents(folder) {
    let folderBit = 1 << 14;
    let names = await fs.readdir(root + folder);
    for (let name of names) {
        let path = folder + name;
        let stat = await fs.stat(root + path);
        if ((stat.mode & folderBit) != 0) path = path + "/";
        paths.add(path);
    }
}

// Find the content type to respond with, or undefined.
function findType(url) {
    let dot = url.lastIndexOf(".");
    let extension = url.substring(dot + 1);
    return types[extension];
}

// Deliver the file that has been read in to the browser.
function deliver(response, type, content) {
    let typeHeader = { "Content-Type": type };
    response.writeHead(OK, typeHeader);
    response.write(content);
    response.end();
}

// Give a minimal failure response to the browser
function fail(response, code, text) {
    let textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(code, textTypeHeader);
    response.write(text, "utf8");
    response.end();
}

// The most common standard file extensions are supported, and html is
// delivered as "application/xhtml+xml".  Some common non-standard file
// extensions are explicitly excluded.  This table is defined using a function
// rather than just a global variable, because otherwise the table would have
// to appear before calling start().  NOTE: add entries as needed or, for a more
// complete list, install the mime module and adapt the list it provides.
function defineTypes() {
    let types = {
        html : "application/xhtml+xml",
        css  : "text/css",
        js   : "application/javascript",
        mjs  : "application/javascript", // for ES6 modules
        png  : "image/png",
        gif  : "image/gif",    // for images copied unchanged
        jpeg : "image/jpeg",   // for images copied unchanged
        jpg  : "image/jpeg",   // for images copied unchanged
        svg  : "image/svg+xml",
        json : "application/json",
        pdf  : "application/pdf",
        txt  : "text/plain",
        ttf  : "application/x-font-ttf",
        woff : "application/font-woff",
        aac  : "audio/aac",
        mp3  : "audio/mpeg",
        mp4  : "video/mp4",
        webm : "video/webm",
        ico  : "image/x-icon", // just for favicon.ico
        xhtml: undefined,      // non-standard, use .html
        htm  : undefined,      // non-standard, use .html
        rar  : undefined,      // non-standard, platform dependent, use .zip
        doc  : undefined,      // non-standard, platform dependent, use .pdf
        docx : undefined,      // non-standard, platform dependent, use .pdf
    }
    return types;
}
