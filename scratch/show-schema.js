const { sequelize } = require('../models');

async function run() {
  try {
    const [results] = await sequelize.query("SELECT name, sql FROM sqlite_master WHERE type='table'");
    console.log('--- Table Schemas ---');
    results.forEach(r => {
      console.log(`Table: ${r.name}`);
      console.log(r.sql);
      console.log('---------------------\n');
    });
  } catch (err) {
    console.error(err);
  }
}

run();
