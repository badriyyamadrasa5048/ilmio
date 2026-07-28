const { Sequelize } = require('sequelize');

const testUrl = 'postgresql://postgres.epqvoiasapmelhuhaqhl:v4C7JfPYJ0BsQCVC@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

const sequelize = new Sequelize(testUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

async function main() {
  try {
    console.log('Testing pooler connection...');
    await sequelize.authenticate();
    console.log('Connection successful!');
    
    // Check if table exists
    const [results] = await sequelize.query('SELECT tablename FROM pg_tables WHERE schemaname = \'public\'');
    console.log('Tables:', results);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

main();
