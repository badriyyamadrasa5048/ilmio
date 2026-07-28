const { User } = require('../models');

async function checkUsers() {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'role'] });
    console.log('Current Users in SQLite DB:', users.map(u => u.toJSON()));
    process.exit(0);
  } catch (err) {
    console.error('Error checking users:', err);
    process.exit(1);
  }
}

checkUsers();
