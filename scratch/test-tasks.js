const { Task, TaskCompletion, User } = require('../models');

async function test() {
  try {
    console.log('Fetching tasks count...');
    const count = await Task.count();
    console.log(`Current tasks in database: ${count}`);
    
    console.log('Fetching task completions count...');
    const compCount = await TaskCompletion.count();
    console.log(`Current task completions in database: ${compCount}`);

    console.log('✅ Models successfully synced with database!');
  } catch (error) {
    console.error('❌ Failed to test models:', error);
  }
}

test();
