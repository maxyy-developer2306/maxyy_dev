const mongoose = require('mongoose');
const dns = require('node:dns');
const Permit = require('../models/Permit');

async function removeUniquePermitNumberIndex() {
  let indexes;
  try {
    indexes = await Permit.collection.indexes();
  } catch (error) {
    if (error.code === 26) return;
    throw error;
  }

  const index = indexes.find(index =>
    index.unique
    && Object.keys(index.key).length === 1
    && index.key.permitNumber === 1
  );
  if (!index) return;

  await Permit.collection.dropIndex(index.name);
  console.log('Removed unique Permit Number index');
}

async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');

  if (process.env.MONGODB_DNS_SERVERS !== undefined) {
    const servers = process.env.MONGODB_DNS_SERVERS.split(',').map(server => server.trim());
    if (servers.some(server => !server)) {
      throw new Error('MONGODB_DNS_SERVERS must be a comma-separated list of DNS servers');
    }
    dns.setServers(servers);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await removeUniquePermitNumberIndex();
  console.log('MongoDB connected');
}

module.exports = connectDatabase;
