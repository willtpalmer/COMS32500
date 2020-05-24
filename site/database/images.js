const {getDatabase} = require('./sqlite');

async function initialiseImagesTable() {
	const db = await getDatabase();
	const prepSQL = db.prepare('CREATE TABLE IF NOT EXISTS images (\
									id INTEGER PRIMARY KEY,\
									url TEXT,\
									artist_id INTEGER NOT NULL,\
									FOREIGN KEY (artist_id)\
										REFERENCES artists(id)\
								)');
	return new Promise(resolve=>{
		prepSQL.run((e)=>{
			if (e) resolve(console.log(e.message));
    		else resolve(console.log('Images table initialised'));
		});
	});
}

async function dropImagesTable() {
	const db = await getDatabase();
	const prepSQL = db.prepare("DROP TABLE IF EXISTS images");
	return new Promise(resolve=>{
		prepSQL.run((e)=>{
			if (e) resolve(console.log(e.message));
			else resolve(console.log("Images table dropped"));
		});
	});
}

async function insertImage(url, artist_id) {
	const db = await getDatabase();
	const prepSQL = db.prepare('INSERT INTO images(url, artist_id)\
				 				VALUES(?,?)');
	await prepSQL.run([url, artist_id], (e)=>{
		if (e) console.log(e.message);
		else console.log('A row has been inserted into the images table');
	});
	const prepSQL1 = db.prepare('SELECT last_insert_rowid()');
	return new Promise(resolve=>{
	prepSQL1.get((e, res)=>{
		if (e) resolve(console.log(e.message));
		else resolve(res['last_insert_rowid()']);
		});
	});
}

async function getImages(artistId) {
	const db = await getDatabase();
	const prepSQL = db.prepare('SELECT *\
								FROM images\
								WHERE artist_id = ?');
	return new Promise(resolve=>{
		prepSQL.all([artistId],(e, res)=>{
    		if (e) resolve(console.log(e.message));
    		else resolve(res);
  		});
  	});
}

module.exports = {
	initialiseImagesTable,
	dropImagesTable,
	insertImage,
	getImages
};