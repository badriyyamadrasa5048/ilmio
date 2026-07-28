const { Class, Student } = require('../models');
const sequelize = require('../config/database');

async function seed12Classes() {
  try {
    console.log('Seeding Class 1 to Class 12...');

    // Option: Upsert or ensure Class 1 through Class 12 exist
    for (let i = 1; i <= 12; i++) {
      const className = `Class ${i}`;
      const existing = await Class.findOne({ where: { name: className } });
      if (!existing) {
        await Class.create({
          name: className,
          level: i,
          section: 'A',
          startTime: '08:30:00',
          endTime: '15:30:00',
          graceTime: 10
        });
        console.log(`Created ${className}`);
      } else {
        await existing.update({ level: i });
        console.log(`Updated ${className} with level ${i}`);
      }
    }

    const totalClasses = await Class.count();
    console.log(`Classes seeding complete. Total classes in DB: ${totalClasses}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding classes:', err);
    process.exit(1);
  }
}

seed12Classes();
