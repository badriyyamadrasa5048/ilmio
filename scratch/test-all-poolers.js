const { Sequelize } = require('sequelize');

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-northeast-1',
  'us-east-1',
  'eu-central-1'
];

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const url = `postgresql://postgres.epqvoiasapmelhuhaqhl:v4C7JfPYJ0BsQCVC@${host}:5432/postgres`;
  
  const sequelize = new Sequelize(url, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log(`\n SUCCESS! Region ${region} (${host}) connected!`);
    return host;
  } catch (err) {
    console.log(`Failed ${region} (${host}): ${err.message}`);
    return null;
  }
}

async function main() {
  for (const r of regions) {
    const success = await testRegion(r);
    if (success) {
      process.exit(0);
    }
  }
  console.log('\nAll pooler regions failed.');
  process.exit(1);
}

main();
