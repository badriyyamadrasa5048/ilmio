const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

// If running on Vercel, Netlify, or DB_DIALECT is postgres, use PostgreSQL / Supabase
const isPostgres = process.env.DB_DIALECT === 'postgres' || process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;
const dbUrl = process.env.DB_URL || 'postgresql://postgres:v4C7JfPYJ0BsQCVC@db.epqvoiasapmelhuhaqhl.supabase.co:5432/postgres';

if (isPostgres && dbUrl) {
  // Supabase PostgreSQL configuration
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false, // Turn off logging for cleaner terminal
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Supabase connections
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else if (process.env.DB_DIALECT === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'madrasa_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  // SQLite configuration (default for local development)
  const sqliteStorage = process.env.DB_STORAGE || path.join(__dirname, '../database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteStorage,
    logging: false
  });
}

module.exports = sequelize;
