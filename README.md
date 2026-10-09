# TimeFlow - Time Management System Web Application

A production-ready full-stack Time Management System built with a **Java (Spring Boot 3)** backend REST API and a modern **React (TypeScript + Tailwind CSS)** frontend.

---

## 🛠️ Tech Stack & Architecture

- **Backend**:
  - Java 17+ (JDK 26 compatible)
  - Spring Boot 3.3.4 (Spring Web, Spring Data JPA, Spring Security 6)
  - JWT Authentication (JJWT 0.12.6 with HMAC-SHA256)
  - In-Memory H2 Database (with H2 Web Console at `/h2-console`)
  - Optional PostgreSQL driver with `docker-compose.yml`
  - Maven Wrapper (`mvnw` / `mvnw.cmd`)
- **Frontend**:
  - React 18 + TypeScript + Vite
  - Tailwind CSS for styling
  - Lucide-React icons
  - Axios API client with automatic JWT token injection
  - Zero-setup pre-packaged Web Single Page App embedded in `src/main/resources/static`
- **Security**:
  - Stateless JWT token authentication
  - User-isolated task and time log data partitions (users only see their own records)
  - Password hashing with BCrypt

---

## 📂 Codebase Directory Structure

```text
time-management-app/
├── pom.xml                                   # Spring Boot Maven build definition
├── mvnw / mvnw.cmd                          # Maven wrapper executables
├── docker-compose.yml                        # Local PostgreSQL container definition
├── src/
│   ├── main/
│   │   ├── java/com/timemanager/
│   │   │   ├── TimeManagementApplication.java # Spring Boot main entrypoint
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java       # Spring Security 6 & CORS configuration
│   │   │   │   └── DataInitializer.java      # Demo seed user & initial tasks/logs
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java       # /api/v1/auth/signup & login
│   │   │   │   ├── TaskController.java       # /api/v1/tasks CRUD & filters
│   │   │   │   ├── TimeLogController.java    # /api/v1/timelogs Pomodoro session tracker
│   │   │   │   └── AnalyticsController.java  # /api/v1/analytics/summary KPIs
│   │   │   ├── dto/                          # Request & Response Data Transfer Objects
│   │   │   ├── entity/                       # JPA Entities: User, Task, TimeLog, Enums
│   │   │   ├── exception/                    # GlobalExceptionHandler & custom exceptions
│   │   │   ├── repository/                   # Spring Data JPA Repositories
│   │   │   ├── security/                     # JwtTokenProvider, JwtFilter, UserDetails
│   │   │   └── service/                      # Business logic: Auth, Task, TimeLog, Analytics
│   │   └── resources/
│   │       ├── application.yml               # H2, JPA, and JWT configurations
│   │       └── static/
│   │           └── index.html                # Zero-setup complete web client UI
│   └── test/
│       └── java/com/timemanager/
│           ├── TimeManagementApplicationTests.java
│           └── TimeManagerApiTests.java      # End-to-end MockMvc integration tests
└── frontend/                                 # Modular React TypeScript source
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx
        ├── context/AuthContext.tsx
        ├── components/
        │   ├── Sidebar.tsx
        │   ├── Navbar.tsx
        │   ├── TaskModal.tsx
        │   └── PomodoroTimer.tsx
        ├── pages/
        │   ├── DashboardPage.tsx
        │   ├── TasksPage.tsx
        │   ├── PomodoroPage.tsx
        │   ├── AnalyticsPage.tsx
        │   ├── LoginPage.tsx
        │   └── SignupPage.tsx
        ├── services/api.ts
        └── types/index.ts
```

---

## 🚀 Instant Quick Start

### 1. Run the Spring Boot Backend & Web UI
Execute the Maven wrapper command from the project root:

```powershell
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

Once started:
- **Application Web UI**: Open [http://localhost:8080](http://localhost:8080)
- **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - JDBC URL: `jdbc:h2:mem:timedb`
  - User: `sa`
  - Password: *(leave blank)*

### 2. Default Demo Account
The database is pre-seeded with sample tasks and logs for testing:
- **Username**: `demo`
- **Password**: `password123`

---

## 📡 REST API Reference

All protected endpoints require the header `Authorization: Bearer <jwt-token>`.

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/signup` | Register new user | No |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT | No |
| `GET`  | `/api/v1/auth/me` | Fetch authenticated user profile | Yes |

### Tasks Management (`/api/v1/tasks`)
| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/v1/tasks` | Get tasks for current user | `category` (WORK, PERSONAL, STUDY), `priority` (HIGH, MEDIUM, LOW), `completed` (true/false) |
| `POST` | `/api/v1/tasks` | Create a new task | — |
| `GET` | `/api/v1/tasks/{id}` | Get task by ID | — |
| `PUT` | `/api/v1/tasks/{id}` | Update task details | — |
| `PATCH` | `/api/v1/tasks/{id}/toggle-complete` | Toggle task completion status | — |
| `DELETE` | `/api/v1/tasks/{id}` | Delete task | — |

### Pomodoro & Time Logs (`/api/v1/timelogs`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/timelogs` | Log a finished Pomodoro session. If `taskId` is supplied, automatically increments the task's `actualTimeLoggedMinutes`. |
| `GET` | `/api/v1/timelogs` | List time logs for current user |
| `GET` | `/api/v1/timelogs/task/{taskId}` | List logs for a specific task |

### Analytics Summary (`/api/v1/analytics`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/analytics/summary` | Returns `totalTasksCompleted`, `productivityScore` (%), `totalHoursLoggedToday`, `totalHoursLoggedThisWeek`, and lifetime stats |

---

## ⏱️ Pomodoro Timer Auto-Sync Flow
1. User starts a 25-minute Deep Work session (or custom duration) in the Pomodoro widget.
2. An optional task from the user's task board can be selected in the "Attach to Task" dropdown.
3. Upon timer completion:
   - Web Audio API triggers an alert chime.
   - A POST request is automatically fired to `/api/v1/timelogs`.
   - The Spring Boot backend persists the `TimeLog` and increments `Task.actualTimeLoggedMinutes`.
   - Analytics metrics (productivity score and hours logged today/week) update in real-time.

---

## 🐘 Optional PostgreSQL Execution

To switch from H2 to PostgreSQL:
1. Start the container:
   ```bash
   docker-compose up -d
   ```
2. In `src/main/resources/application.yml`, update the datasource:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/timedb
       username: postgres
       password: postgrespassword
     jpa:
       database-platform: org.hibernate.dialect.PostgreSQLDialect
       hibernate:
         ddl-auto: update
   ```
