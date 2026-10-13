process.env.NODE_ENV = 'test';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const baseUri = process.env.MONGODB_URI;
if (!baseUri) throw new Error('MONGODB_URI is not set in .env');

// Split on '?' so we only rewrite the DB name in the path portion
const [beforeQuery, query] = baseUri.split('?');
// Replace the last '/segment' (the db name) with '/campus_test'
const testBase = beforeQuery.replace(/\/[^/]+$/, '/campus_test');
const testUri = query ? `${testBase}?${query}` : testBase;

console.log('[tests] using DB:', testUri.replace(/:[^:@]+@/, ':****@'));

jest.setTimeout(60000);

const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect(testUri, { serverSelectionTimeoutMS: 30000 });
}, 60000);

afterEach(async () => {
  const cols = mongoose.connection.collections;
  for (const k in cols) await cols[k].deleteMany({});
}, 30000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}, 30000);