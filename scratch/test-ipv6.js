const { Sequelize } = require('sequelize');

console.log('Testing direct connection via IPv6 address...');

const sequelize = new Sequelize('postgres://postgres:v4C7JfPYJ0BsQCVC@[2406:da14:1772:ea00:cd42:b0d4:a059:a01b]:5432/postgres', {
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
    await sequelize.authenticate();
    console.log('IPv6 Direct Connection SUCCESSFUL!');
    process.exit(0);
  } catch (err) {
    console.error('IPv6 Direct Connection FAILED:', err.message);
    process.exit(1);
  }
}

main();
