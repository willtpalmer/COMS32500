const {getDatabase} = require('./sqlite');

async function insertTest(test) {
	const db = await getDatabase();
	const sql = 'CREATE TABLE IF NOT EXISTS test (name TEXT)';
	await db.run(sql, function(e) {
    if (e) {
      return console.log(e.message);
    }
  	});
	await db.run('INSERT INTO test(name) VALUES(?)', [test], function(e) {
    if (e) {
      return console.log(e.message);
    }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  	});
	
}

async function getTests() {
	const db = await getDatabase();
	const sql = "SELECT * FROM test"
	return new Promise(resolve=>{
		db.all(sql, function(e, res) {
			if (e) {
				return console.log(e.message);
			}
			resolve(res);
		});
	});
	console.log(out);
}

module.exports = {
	insertTest,
	getTests,
};


