const {getDatabase} = require('./sqlite');

async function initialiseAlbumsTable() {
	const db = await getDatabase();
	const prepSQL = db.prepare('CREATE TABLE IF NOT EXISTS albums (\
									id INTEGER PRIMARY KEY,\
									title TEXT NOT NULL,\
									releaseDate DATE,\
									imageURL TEXT,\
									spotifyURL TEXT,\
									artist_id INTEGER NOT NULL,\
									FOREIGN KEY (artist_id)\
										REFERENCES artists(id)\
								)');
	return new Promise(resolve=>{
		prepSQL.run((e)=>{
			if (e) resolve(console.log(e.message));
    		else resolve(console.log('Albums table initialised'));
		});
	});
}

async function dropAlbumsTable() {
	const db = await getDatabase();
	const prepSQL = db.prepare("DROP TABLE IF EXISTS albums");
	return new Promise(resolve=>{
		prepSQL.run((e)=>{
			if (e) resolve(console.log(e.message));
			else resolve(console.log("Albums table dropped"));
		});
	});
}


async function insertAlbum(title, releaseDate, imageURL, artist_id, spotifyURL="") {
	const db = await getDatabase();
	const prepSQL = db.prepare('INSERT INTO albums(title, releaseDate, imageURL, spotifyURL, artist_id)\
				 				VALUES(?,?,?,?,?)');
	await prepSQL.run([title, releaseDate, imageURL, spotifyURL, artist_id], (e)=>{
		if (e) console.log(e.message);
		else console.log('A row has been inserted into the albums table');
	});
	const prepSQL1 = db.prepare('SELECT last_insert_rowid()');
	return new Promise(resolve=>{
	prepSQL1.get((e, res)=>{
		if (e) resolve(console.log(e.message));
		else resolve(res['last_insert_rowid()']);
		});
	});
}

async function getDiscography(artistId) {
	const db = await getDatabase();
	const prepSQL = db.prepare('SELECT *\
								FROM albums\
								WHERE artist_id = ?');
	return new Promise(resolve=>{
		prepSQL.all([artistId],(e, res)=>{
    		if (e) resolve(console.log(e.message));
    		else resolve(res);
  		});
  	});
}

module.exports = {
	initialiseAlbumsTable,
	dropAlbumsTable,
	insertAlbum,
	getDiscography
};