const {getDatabase} = require('./sqlite');

async function initialiseTracksTable() {
	const db = await getDatabase();
	const prepSQL = db.prepare('CREATE TABLE IF NOT EXISTS tracks (\
									id INTEGER PRIMARY KEY,\
									title TEXT NOT NULL,\
									play_order INTEGER NOT NULL,\
									album_id INTEGER NOT NULL,\
									FOREIGN KEY (album_id)\
										REFERENCES albums(id)\
								)');
	return new Promise(resolve=>{
		prepSQL.run((e)=>{
			if (e) resolve(console.log(e.message));
    		else resolve(console.log('Tracks table initialised'));
		});
	});
}

async function dropTracksTable() {
	const db = await getDatabase();
	const prepSQL = db.prepare("DROP TABLE IF EXISTS tracks");
	return new Promise(resolve=>{
		prepSQL.run((e)=>{
			if (e) resolve(console.log(e.message));
			else resolve(console.log("Tracks table dropped"));
		});
	});
}

async function insertTrack(title, playerOrder, albumId) {
	const db = await getDatabase();
	const prepSQL = db.prepare('INSERT INTO tracks(title, play_order, album_id)\
				 				VALUES(?,?,?)');
	return new Promise(resolve=>{
		prepSQL.run([title, playerOrder, albumId], (e)=>{
    		if (e) resolve(console.log(e.message));
    		else resolve(console.log('A row has been inserted into the tracks table'))
  		});
  	});
}

module.exports = {
	initialiseTracksTable,
	dropTracksTable,
	insertTrack
};