const { Sequelize } = require('sequelize');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function testIPv6() {
  const dbUrl = 'postgresql://postgres:v4C7JfPYJ0BsQCVC@[2406:da14:1772:ea00:7ee9:d24:751d:f165]:5432/postgres';
  console.log('Testing direct IPv6 connection to Supabase...');
  
  const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        servername: 'db.epqvoiasapmelhuhaqhl.supabase.co'
      }
    }
  });

  try {
    await sequelize.authenticate();
    console.log('🎉 SUCCESS! Connected directly to Supabase PostgreSQL over IPv6!');
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('\n📊 Tables in Supabase:');
    results.forEach(r => console.log(' - ' + r.table_name));

    const [users] = await sequelize.query('SELECT id, username, role FROM "Users"');
    console.log('\n👤 Users count:', users.length);
    const [classes] = await sequelize.query('SELECT id, name, level FROM "Classes" ORDER BY level ASC');
    console.log('🏫 Classes count:', classes.length);
    const [students] = await sequelize.query('SELECT id, name, "admissionNumber" FROM "Students"');
    console.log('👨‍🎓 Students count:', students.length);
    process.exit(0);
  } catch (err) {
    console.error('❌ IPv6 connection error:', err.message);
    process.exit(1);
  }
}

testIPv6();
