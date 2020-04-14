const sqlite3 = require('sqlite3').verbose();
let db = null;	

async function startDatabase() {
	return new Promise(resolve=>{
		return db = new sqlite3.Database('./database/database.db', (e) => {
		  	if (e) {
		    	resolve(console.error(e.message));
		  	}
		  	resolve(console.log('Connected to SQlite database.'));
		});
	});
  	
}

async function closeDatabase() {
	db.close((e) => {
	 	if (e) {
	    	return console.error(e.message);
	  	}
	  	console.log('Close the database connection.');
	});
} 

async function getDatabase() {
	if (!db) await startDatabase();
  	return db;
}

module.exports = {
  startDatabase,
  closeDatabase,
  getDatabase,
};