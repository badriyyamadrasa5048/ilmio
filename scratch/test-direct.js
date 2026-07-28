const dns = require('dns');
const { Sequelize } = require('sequelize');

console.log('Testing DNS lookup for db.epqvoiasapmelhuhaqhl.supabase.co...');

dns.resolve4('db.epqvoiasapmelhuhaqhl.supabase.co', (err4, a4) => {
  console.log('resolve4 (IPv4):', err4 ? err4.message : a4);
});

dns.resolve6('db.epqvoiasapmelhuhaqhl.supabase.co', (err6, a6) => {
  console.log('resolve6 (IPv6):', err6 ? err6.message : a6);
});

dns.lookup('db.epqvoiasapmelhuhaqhl.supabase.co', { family: 6 }, (err, address) => {
  console.log('family: 6 lookup:', err ? err.message : address);
});

async function testConnection() {
  const directUrl = 'postgresql://postgres:v4C7JfPYJ0BsQCVC@db.epqvoiasapmelhuhaqhl.supabase.co:5432/postgres';
  const sequelize = new Sequelize(directUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  });

  try {
    console.log('\nTesting direct Sequelize connection...');
    await sequelize.authenticate();
    console.log('Direct connection SUCCESSFUL!');
    process.exit(0);
  } catch (connErr) {
    console.error('Direct connection FAILED:', connErr.message);
    process.exit(1);
  }
}

testConnection();
