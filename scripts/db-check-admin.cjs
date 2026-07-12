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
  const db = client.db('test');

  const admin = await db.collection('users').findOne({ email: 'admin@gaesde.com' });
  console.log('ADMIN:', admin ? { id: admin._id.toString(), email: admin.email, name: admin.name } : 'NAO ENCONTRADO');

  const roles = await db.collection('roles').find({}).toArray();
  console.log('ROLES:', roles.map((r) => ({ id: r._id.toString(), slug: r.slug })));

  if (admin) {
    const urs = await db.collection('userroles').find({}).toArray();
    console.log('USERROLES total:', urs.length);
    urs.forEach((u) => console.log('  ur userId=', String(u.userId ?? u.user_id), 'roleId=', String(u.roleId ?? u.role_id)));
  }

  await client.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
