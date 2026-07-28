const { Task, Class } = require('../models');

async function check() {
  try {
    console.log('Fetching tasks...');
    const tasks = await Task.findAll({ include: [{ model: Class, as: 'class' }] });
    console.log(`Retrieved ${tasks.length} tasks successfully.`);
    if (tasks.length > 0) {
      console.log('Sample task fields:', {
        id: tasks[0].id,
        title: tasks[0].title,
        targetRole: tasks[0].targetRole,
        class: tasks[0].class ? tasks[0].class.name : null
      });
    }
    console.log('✅ Tasks check passed!');
  } catch (error) {
    console.error('❌ Tasks check failed:', error);
  }
}

check();
