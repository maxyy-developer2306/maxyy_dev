const mongoose = require('mongoose');
const dns = require('node:dns');

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
  console.log('MongoDB connected');
}

module.exports = connectDatabase;
