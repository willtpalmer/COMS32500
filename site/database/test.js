const {getDatabase} = require('./mongo');

const collectionName = "tests";

async function insertTest(test) {
	const database = await getDatabase();
	const {insertedId} = await database.collection(collectionName).insertOne(test);
	return insertedId;
}

async function getTests() {
	const database = await getDatabase();
	return await database.collection(collectionName).find({}).toArray();
}

module.exports = {
	insertTest,
	getTests,
};