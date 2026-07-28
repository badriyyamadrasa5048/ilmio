const { User, Class } = require('../models');

async function seedDatabase() {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Seeding database with default admin user...');
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
    }

    const classCount = await Class.count();
    if (classCount === 0) {
      console.log('Seeding Class 1 to Class 12...');
      const classesData = [];
      for (let i = 1; i <= 12; i++) {
        classesData.push({
          name: `Class ${i}`,
          level: i,
          section: 'A',
          startTime: '08:30:00',
          endTime: '15:30:00',
          graceTime: 10
        });
      }
      await Class.bulkCreate(classesData);
    }

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = seedDatabase;
