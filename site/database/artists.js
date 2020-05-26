const {getDatabase} = require('./sqlite');

async function initialiseArtistsTable() {
	const db = await getDatabase();
	const prepSQL = db.prepare('CREATE TABLE IF NOT EXISTS artists (\
									id INTEGER PRIMARY KEY,\
									name TEXT NOT NULL UNIQUE,\
									imageURL TEXT,\
									biography TEXT, \
									genre TEXT\
								)');
	return new Promise(resolve=>{
		prepSQL.run((e)=>{
			if (e) resolve(console.log(e.message));
    		else resolve(console.log('Artists table initialised'));
		});
	});
}

async function dropArtistsTable() {
	const db = await getDatabase();
	const prepSQL = db.prepare("DROP TABLE IF EXISTS artists");
	return new Promise(resolve=>{
		prepSQL.run((e)=>{
			if (e) resolve(console.log(e.message));
			else resolve(console.log("Artists table dropped"));
		});
	});
}	

async function insertArtist(name, imageURL, bio, genre="") {
	const db = await getDatabase();
	const prepSQL = db.prepare('INSERT INTO artists(name, imageURL, biography, genre)\
				 				VALUES(?,?,?,?)');
	return new Promise(resolve=>{
		prepSQL.run([name, imageURL, bio, genre], (e)=>{
    		if (e) {
    			console.log(e.message);
    			resolve(0);
    		}
    		else resolve(console.log('A row has been inserted into the artists table'));
  		});
  	});
}

async function getArtists() {
	const db = await getDatabase();
	const prepSQL = db.prepare('SELECT * FROM artists');
	return new Promise(resolve=>{
		prepSQL.all((e, res)=>{
    		if (e) resolve(console.log(e.message));
    		else resolve(res);
  		});
  	});
}

async function getArtist(artistName) {
	const db = await getDatabase();
	const prepSQL = db.prepare('SELECT * \
								FROM artists\
								WHERE name = ?');
	return new Promise(resolve=>{
		prepSQL.get([artistName],(e, res)=>{
    		if (e) resolve(console.log(e.message));
    		else resolve(res);
  		});
  	});
}

async function changeArtistImage(artistName, imageURL) {
	const db = await getDatabase();
	const prepSQL = db.prepare('UPDATE artists\
				 				SET imageURL = ?\
				 				WHERE name = ?');
	return new Promise(resolve=>{
		prepSQL.run(imageURL, artistName, (e)=>{
    		if (e) console.log(e.message);
    		else resolve(console.log(artistName+' image URL updated'));
  		});
  	});
}


async function updateArtist(id, biography, genre) {
	const db = await getDatabase();
	const prepSQL = db.prepare('UPDATE artists\
				 				SET biography = ?, genre = ?\
				 				WHERE id = ?');
	return new Promise(resolve=>{
		prepSQL.run(biography, genre, id, (e)=>{
    		if (e) console.log(e.message);
    		else resolve(console.log(id+" biography and genre updated"));
  		});
  	});
}





module.exports = {
	initialiseArtistsTable,
	insertArtist,
	dropArtistsTable,
	getArtists,
	getArtist,
	changeArtistImage,
	updateArtist
};