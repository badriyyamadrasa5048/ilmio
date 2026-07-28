const sequelize = require('./config/database');

async function fixClassLevels() {
  try {
    await sequelize.authenticate();
    const { Class } = require('./models');
    
    const classes = await Class.findAll();
    for (const c of classes) {
      // Extract number from class name (e.g. "Class 1" -> 1, "Class 10" -> 10)
      const match = c.name.match(/\d+/);
      const levelNum = match ? parseInt(match[0], 10) : c.id;
      
      await c.update({ level: levelNum });
      console.log(`Updated ${c.name} (id: ${c.id}) with level: ${levelNum}`);
    }
    
    console.log('All class levels updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing class levels:', err);
    process.exit(1);
  }
}

fixClassLevels();
