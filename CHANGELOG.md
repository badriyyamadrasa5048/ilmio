# Changelog & Important Updates

## Recent Updates

### 1. Database Migration & Environment
- **Supabase PostgreSQL:** The database was successfully migrated from SQLite to Supabase PostgreSQL.
- **Sync & Alter:** The application uses `sequelize.sync({ alter: true })` on startup to ensure database schemas are automatically updated without destroying data (except when formatting).
- **Environment Variables:** Credentials are securely managed in `.env` using `DB_DIALECT=postgres` and the corresponding `DB_URI`.

### 2. Database Formatting
- **Admin Danger Zone:** Added a "Format Database" feature in the Admin Dashboard.
- **Confirmation Requirement:** Requires typing `FORMAT` to proceed. It executes a `force: true` sync that drops all tables and restarts the database.
- **Clean State Seeding:** The format functionality was updated to ONLY seed the default Admin user (`admin` / `admin123`) instead of mock data, giving a truly clean state.

### 3. Class Management (Fixed 1-12)
- **Static Class Generation:** The system now automatically generates `Class 1` to `Class 12` on startup if no classes exist.
- **UI Restriction:** Removed the ability to create new classes or delete existing classes from the Admin UI. Admins can only edit existing classes (e.g., to assign teachers or set timings).
- **Numerical Sorting:** Added a `level` field (integer) to the `Class` model so classes are sorted numerically (Class 1, Class 2... Class 10) instead of alphabetically.

### 4. Teacher Management
- **Fields Removed:** Removed `Email`, `Qualification`, and `Teaching Subject` fields from the `Teacher` model and the UI.
- **Phone Number Login:** Teachers now log in using their **Phone Number** as their username.
- **Custom Password:** Admins can set a custom login password when creating or editing a teacher (defaults to `teacher123` if left blank).
- **Class Assignments:** A teacher can be assigned to multiple classes. This is done from the **Classes** page by editing a class and selecting the teacher from the dropdown.

## Important Notes for Future Development
- **Do Not Revert to SQLite:** All queries and sync behaviors are now optimized for PostgreSQL. Do not change `DB_DIALECT` back to `sqlite`.
- **EJS & Vanilla CSS:** Continue using the established tech stack (Node, Express, Sequelize, EJS, Vanilla CSS). Avoid modern frontend frameworks (React/Vue) or Tailwind CSS unless explicitly requested.
- **Roles:** Always validate `req.session.role` in routes. The application relies heavily on session data for routing and access control.
