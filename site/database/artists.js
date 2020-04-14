const {getDatabase} = require('./sqlite');

async function initialiseArtistsTable() {
	const db = await getDatabase();
	const prepSQL = db.prepare('CREATE TABLE IF NOT EXISTS artists (\
									id INTEGER PRIMARY KEY,\
									name TEXT NOT NULL,\
									imageURL TEXT,\
									biography TEXT \
								);');
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

async function insertArtist(name, imageURL, bio) {
	const db = await getDatabase();
	const prepSQL = db.prepare('INSERT INTO artists(name, imageURL, biography)\
				 				VALUES(?,?,?);')
	return new Promise(resolve=>{
		prepSQL.run([name, imageURL, bio], (e)=>{
    		if (e) resolve(console.log(e.message));
    		else resolve(console.log('A row has been inserted into the artists table'));
  		});
  	});
}

async function getArtists() {
	const db = await getDatabase();
	const prepSQL = db.prepare('SELECT * FROM artists;')
	return new Promise(resolve=>{
		prepSQL.all((e, res)=>{
    		if (e) resolve(console.log(e.message));
    		else resolve(res);
  		});
  	});
}



module.exports = {
	initialiseArtistsTable,
	insertArtist,
	dropArtistsTable,
	getArtists,
};