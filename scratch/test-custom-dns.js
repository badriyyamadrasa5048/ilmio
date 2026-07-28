const dns = require('dns');

console.log('Testing with Google DNS 8.8.8.8...');
dns.setServers(['8.8.8.8', '1.1.1.1']);

dns.resolve4('db.epqvoiasapmelhuhaqhl.supabase.co', (err, addresses) => {
  console.log('Google DNS resolve4:', err ? err.message : addresses);
});

dns.resolve6('db.epqvoiasapmelhuhaqhl.supabase.co', (err, addresses) => {
  console.log('Google DNS resolve6:', err ? err.message : addresses);
});

dns.resolve4('aws-0-ap-northeast-1.pooler.supabase.com', (err, addresses) => {
  console.log('Pooler resolve4:', err ? err.message : addresses);
});
