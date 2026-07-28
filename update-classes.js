const sequelize = require('./config/database');

async function updateClassNames() {
  try {
    await sequelize.authenticate();
    const { Class } = require('./models');
    
    for (let i = 1; i <= 12; i++) {
      await Class.update(
        { name: `Class ${i}` },
        { where: { name: `Grade ${i}` } }
      );
    }
    console.log('Class names updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating classes:', err);
    process.exit(1);
  }
}

updateClassNames();
