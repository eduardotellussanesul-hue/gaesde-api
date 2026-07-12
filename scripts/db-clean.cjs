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

const ADMIN_EMAIL = 'admin@gaesde.com';

// Collections whose documents are fully cleared
const CLEAR_ALL = [
  'courses', 'modules', 'contents', 'contentpdfs', 'contenttexts', 'contentvideos',
  'quizzes', 'questions', 'questionoptions', 'enrollments', 'contentcompletions',
  'quizattempts', 'useranswers', 'certificates', 'reviews', 'comments',
  'categories', 'assignmentsubmissions', 'images',
];

async function main() {
  const uri = readEnvUri();
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('test');

  const admin = await db.collection('users').findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    throw new Error('Admin nao encontrado. Abortando por seguranca.');
  }
  const adminId = admin._id;

  // clear content/course/etc collections
  for (const name of CLEAR_ALL) {
    const exists = await db.listCollections({ name }).hasNext();
    if (!exists) continue;
    const res = await db.collection(name).deleteMany({});
    console.log(`limpo ${name}: ${res.deletedCount} removidos`);
  }

  // users: keep only admin
  const delUsers = await db.collection('users').deleteMany({ email: { $ne: ADMIN_EMAIL } });
  console.log(`users removidos (exceto admin): ${delUsers.deletedCount}`);

  // userroles: keep only admin's
  const urs = await db.collection('userroles').find({}).toArray();
  const toDelete = urs.filter((u) => {
    const uid = String(u.userId ?? u.user_id ?? '');
    return uid !== String(adminId);
  }).map((u) => u._id);
  if (toDelete.length) {
    const delUr = await db.collection('userroles').deleteMany({ _id: { $in: toDelete } });
    console.log(`userroles removidos (exceto admin): ${delUr.deletedCount}`);
  } else {
    console.log('userroles: nada a remover');
  }

  // report final state
  console.log('\n=== ESTADO FINAL (test) ===');
  console.log('users:', await db.collection('users').countDocuments());
  console.log('roles:', await db.collection('roles').countDocuments());
  console.log('userroles:', await db.collection('userroles').countDocuments());
  console.log('courses:', await db.collection('courses').countDocuments());

  await client.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
