# Madrasa Management System - Context & Architecture

## Overview
A web-based Madrasa Management System designed to handle multiple roles (Admin, Teacher, Parent) for managing students, attendance, marks, and daily/weekly tasks.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** Supabase PostgreSQL (via Sequelize ORM)
- **Frontend:** EJS Templating Engine, Vanilla CSS/JS
- **Authentication:** express-session, bcryptjs

## Database Schema (Models)
- **User:** Handles authentication and role-based access (`admin`, `teacher`, `parent`). Uses `referenceId` to link to Teacher or Student profiles.
- **Class:** Fixed to 12 classes (`Class 1` to `Class 12`), auto-seeded on startup. Features a `level` field for correct numerical sorting. Linked to a Class Teacher. No UI for creation/deletion, only assignment.
- **Student:** Linked to a Class. Parents view their child's data via reference.
- **Teacher:** Profile for teachers. (Qualification and Subject fields removed; assignment is done dynamically via Class).
- **Attendance:** Daily attendance tracking per student.
- **Mark:** Examination marks for students.
- **Task:** Assignments or tasks created by Teachers/Admins for a Class.
- **TaskCompletion:** Tracks the completion status (and potentially percentage) of tasks by Students.

## Roles and Access
- **Admin:** Full access to manage teachers, classes, students, system settings, and overview dashboards.
- **Teacher:** Can manage their assigned class, mark attendance, enter marks, assign tasks, and track completions.
- **Parent:** Can view their child's dashboard, check attendance, marks, and task progress.

## Directory Structure
- `models/`: Sequelize models and relationships (`index.js`).
- `routes/`: Express routers organized by role (`auth.js`, `admin.js`, `teacher.js`, `parent.js`, `dashboard.js`).
- `views/`: EJS templates separated by role (`admin/`, `teacher/`, `parent/`) and shared components (`partials/`).
- `public/`: Static assets (CSS, JS, images).
- `config/`: Database connection and seeder.
