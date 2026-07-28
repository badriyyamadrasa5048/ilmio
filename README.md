# Madrasa Management System (ilmio)

A comprehensive, role-based web application designed to digitalize and streamline the management of Madrasas. It allows administrators, teachers, and parents to interact seamlessly for daily operations like attendance tracking, task management, and academic performance monitoring.

## 🚀 Features by Role

### 👨‍💼 Administrator
- **Dashboard Overview:** High-level analytics of total students, classes, and teachers.
- **User Management:** Add, edit, and remove teachers and assign classes.
- **Student Management:** Oversee student enrollments and records.
- **System Settings:** Centralized control over application configurations.

### 👨‍🏫 Teacher
- **Class Dashboard:** Access to assigned class details and student list.
- **Attendance Tracking:** Mark and review daily attendance for students.
- **Task Management:** Create, assign, and track daily/weekly tasks and homework.
- **Marks Entry:** Record and manage examination marks for individual students.
- **Progress Tracking:** Monitor task completion percentages.

### 👨‍👩‍👦 Parent
- **Student Dashboard:** View real-time progress of their child.
- **Attendance Records:** Check daily attendance status.
- **Task Progress:** See assigned tasks and completion status.
- **Performance (Marks):** View examination results and academic history.

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite (via Sequelize ORM)
- **Frontend:** EJS (Embedded JavaScript) Templates, HTML5, Vanilla CSS, Vanilla JavaScript
- **Authentication:** express-session, bcryptjs

## 📂 Project Structure

```
ilmio/
├── config/             # Database connection & seeders
├── models/             # Sequelize Models (User, Teacher, Student, Class, etc.)
├── routes/             # Express routes split by roles
├── views/              # EJS Templates
│   ├── admin/          # Admin UI views
│   ├── teacher/        # Teacher UI views
│   ├── parent/         # Parent UI views
│   └── partials/       # Shared UI components (nav, footer, etc.)
├── public/             # Static assets (CSS styles, client-side JS)
└── server.js           # Main application entry point
```

## ⚙️ Installation & Setup

1. **Clone the repository** (if applicable) and navigate to the project directory:
   ```bash
   cd ilmio
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory based on `.env.example` and set up your variables (like `SESSION_SECRET` and `PORT`).

4. **Run the Application:**
   For development (uses nodemon/watch mode):
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```

5. **Database Initialization:**
   The application uses Sequelize to automatically sync models to the SQLite database on startup. A default admin account and sample data might be seeded depending on the `config/seeder.js`.

## 🎨 Design & UI
The application uses a custom, responsive, and modern Vanilla CSS styling system (no heavy frontend frameworks required), ensuring fast load times and an aesthetic, premium user experience.
