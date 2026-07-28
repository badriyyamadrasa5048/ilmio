# Agent Guidelines for Madrasa Management System

## General Rules
- This project uses **Node.js, Express, Sequelize, and EJS**. Always follow this stack when creating new features.
- Avoid using modern frontend frameworks (React, Vue) as the frontend is server-rendered via EJS.
- Ensure all styling is written in Vanilla CSS (found in `public/css/style.css`), do not use Tailwind unless specifically requested.
- Maintain responsive, modern, and premium design aesthetics using the existing CSS tokens.
- **Roles & Authentication:** Always ensure proper role validation in routes (using session data `req.session.role`).

## Database Rules
- Use **Sequelize ORM** for all database queries. Avoid raw SQL queries unless absolutely necessary.
- When creating new models or adding relationships, update `models/index.js` to ensure the associations are correctly mapped.
- Ensure proper `onDelete` cascades are set for relational data.

## Referencing Context
- Always read `project_context.md` when starting a new complex feature to align with the database schema and roles.
