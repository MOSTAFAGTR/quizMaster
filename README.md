# Modular Quiz System 

This project is a web-based Modular Quiz System designed to allow instructors to create and manage quizzes, and for students to take these quizzes and track their performance. This prototype focuses on core functionalities and demonstrates key software engineering principles.

## I. Core Features Implemented in Prototype

### 1. User Management
    -   **User Registration:** Separate registration for 'Student' and 'Instructor' roles with email and password.
    -   **User Login:** Secure login for registered users.
    -   **Authentication:** JWT (JSON Web Tokens) are used for session management after login.
    *   **Role-Based Access Control (RBAC):** Certain features and API endpoints are protected based on user roles (e.g., only instructors can create quizzes).

### 2. Quiz Creation & Management (Instructor Role)
    -   **Create Quiz:** Instructors can create a new quiz by providing a title.
    -   **Add Questions:** Instructors can add Multiple Choice Questions (MCQs) to their created quizzes. Each MCQ includes:
        -   Question text.
        -   2 to 4 answer options.
        -   Designation of the single correct answer.
    -   **View Created Quizzes:** Instructors can see a list of quizzes they have created on their dashboard.
    -   **Edit/Manage Questions:** Instructors can navigate to an "edit" page for each quiz to add more questions or view existing ones.
    -   **Delete Questions:** Instructors can delete individual questions from their quizzes.
    -   **Delete Quizzes:** Instructors can delete entire quizzes they have created.

### 3. Quiz Taking Experience (Student Role)
    -   **View Available Quizzes:** Students see a list of all available quizzes on their dashboard.
    -   **Take Quiz:** Students can select a quiz and proceed to a quiz player interface.
    -   **Question Navigation:** Questions are presented one at a time. Students can navigate to the next (and previous) question.
    -   **Answer Selection:** Students can select one option for each MCQ.
    *   **Quiz Submission:** Students can submit their completed answers.

### 4. Result & Feedback System (Student Role)
    -   **Instant Grading (MCQs):** Upon submission, MCQs are graded immediately.
    -   **Score Display:** Students see their score (e.g., X out of Y correct) and percentage on a results screen after submission.
    -   **Detailed Breakdown:** The results screen shows each question, the student's selected answer, the correct answer, and indicates if their answer was correct or incorrect.
    -   **Attempt History on Dashboard:** The student dashboard displays statistics like average score, number of unique quizzes taken, and a list of recent attempts. Quizzes in the "available" list are marked if previously attempted.

### 5. Profile Management (Authenticated Users)
    -   **View Profile:** Users can view their basic profile information (email, role).
    -   **Change Password (UI Present):** A dedicated page allows users to attempt to change their password (frontend UI and client-side validation implemented; backend API for actual change is also implemented).
    -   **(Conceptual) Profile Completion:** The profile page UI includes a visual for profile completion percentage and task list (data is currently placeholder).
    -   **(Conceptual) Quiz Performance on Profile:** For students, the profile page UI includes a section for quiz performance statistics (linked to real data from attempts).

## II. System Components

### A. Frontend (Client-Side - React Application)
    -   **Built with:** React (using Create ReactApp with TypeScript)
    -   **Routing:** `react-router-dom` for client-side navigation.
    -   **State Management:**
        -   Component-level state (`useState`, `useEffect`).
        -   Global Authentication State: React Context API (`AuthContext`) for managing user login status, token, and user details, with persistence in `localStorage`.
    -   **API Communication:** `axios` for making HTTP requests to the backend. Centralized in service modules.
    -   **Structure:**
        -   `src/components/`: Contains reusable UI components.
            -   `auth/`: Login and Register form components.
            -   `common/`: Generic components like `ProtectedRoute`, `CircleProgress`, `LoadingSpinner`, `ErrorDisplay`, `SuccessDisplay`.
        -   `src/features/` (or `src/pages/`): Contains main page/feature components.
            -   `auth/ChangePasswordPage.tsx`
            -   `dashboard/InstructorDashboardPage.tsx`, `StudentDashboardPage.tsx`
            -   `home/HomePage.tsx`
            -   `profile/ProfilePage.tsx`
            -   `quiz_builder/CreateQuizPage.tsx`, `EditQuizPage.tsx`
            -   `quiz_player/QuizPlayerPage.tsx`
        -   `src/context/AuthContext.tsx`: Manages global authentication state.
        -   `src/services/`: Abstraction layer for API calls (`auth.service.ts`, `quiz.service.ts`, `attempt.service.ts`).
        -   `src/types/index.ts`: Shared TypeScript interfaces.
        -   `src/App.tsx`: Main application component, sets up routing and layout.
        -   `src/App.css`, `src/AuthPages.css`, `src/index.css`: Styling. (And potentially page-specific CSS files like `ProfilePage.css`)

### B. Backend (Server-Side - Node.js/Express Application)
    -   **Built with:** Node.js with Express.js framework (using TypeScript).
    -   **API Type:** RESTful API.
    -   **Authentication:** JWT-based (token signed on login, verified for protected routes).
    -   **Password Hashing:** `bcryptjs` for securely hashing and comparing passwords.
    *   **Data Storage:** **In-memory arrays** (`usersDB`, `quizzesDB`, `quizAttemptsDB`) for prototype purposes. Data is not persisted across server restarts.
    -   **Structure (Refactored):**
        -   `src/api/`: Contains modules for different API resources.
            -   `auth/`: `auth.routes.ts`, `auth.controller.ts`, `auth.service.ts`
            -   `quiz/`: `quiz.routes.ts`, `quiz.controller.ts`, `quiz.service.ts`
            -   `attempt/`: `attempt.routes.ts`, `attempt.controller.ts`, `attempt.service.ts`
        -   `src/config/jwt.config.ts`: JWT secret and expiration settings.
        -   `src/middleware/auth.middleware.ts`: Contains `protect` (token verification) and `authorizeInstructor` (role check) middleware.
        -   `src/models/`: Defines data structures/interfaces (`user.model.ts`, `quiz.model.ts`, `attempt.model.ts`) and holds the in-memory data arrays.
        -   `src/server.ts`: Main Express application setup, mounts routers and global middleware (CORS, body-parser, error handling, logging).
