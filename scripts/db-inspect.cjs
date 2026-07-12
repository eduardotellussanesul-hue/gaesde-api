/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

function readEnvUri() {
  const envPath = path.resolve(__dirname, '../.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const line = content.split('\n').find((l) => l.startsWith('MONGODB_URI='));
  return line.slice('MONGODB_URI='.length).trim();
}

async function main() {
  const uri = readEnvUri();
  const client = new MongoClient(uri);
  await client.connect();
  // list databases
  const admin = client.db().admin();
  const { databases } = await admin.listDatabases();
  for (const d of databases) {
    if (['admin', 'local', 'config'].includes(d.name)) continue;
    const db = client.db(d.name);
    const cols = await db.listCollections().toArray();
    console.log(`\n== DB: ${d.name} ==`);
    for (const c of cols) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`  ${c.name}: ${count}`);
    }
  }
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
