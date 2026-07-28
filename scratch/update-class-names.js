const { Class } = require('../models');

async function updateClasses() {
  try {
    const classes = await Class.findAll();
    console.log('Current classes in database:');
    for (const c of classes) {
      console.log(`- ID: ${c.id}, Name: "${c.name}", Section: "${c.section}"`);
    }

    console.log('\nUpdating classes to rename "Grade" to "Class" and set section to empty string...');
    for (const c of classes) {
      let newName = c.name;
      if (c.name.startsWith('Grade ')) {
        newName = c.name.replace('Grade ', 'Class ');
      }
      
      c.name = newName;
      c.section = ""; // Set to empty string
      await c.save();
      console.log(`- Updated Class ID ${c.id}: Name: "${c.name}", Section: "${c.section}"`);
    }

    console.log('✅ Class names and sections successfully migrated!');
  } catch (error) {
    console.error('❌ Failed to update classes:', error);
  }
}

updateClasses();
