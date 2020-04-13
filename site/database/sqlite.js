const sqlite3 = require('sqlite3').verbose();
let db = null;	

async function startDatabase() {
  	db = new sqlite3.Database('./database/test.db', (e) => {
	  	if (e) {
	    	return console.error(e.message);
	  	}
	  console.log('Connected to the in-memory SQlite database.');
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