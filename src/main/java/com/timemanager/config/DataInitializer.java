package com.timemanager.config;

import com.timemanager.entity.Task;
import com.timemanager.entity.TaskCategory;
import com.timemanager.entity.TaskPriority;
import com.timemanager.entity.TimeLog;
import com.timemanager.entity.User;
import com.timemanager.repository.TaskRepository;
import com.timemanager.repository.TimeLogRepository;
import com.timemanager.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final TimeLogRepository timeLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           TaskRepository taskRepository,
                           TimeLogRepository timeLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.timeLogRepository = timeLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            logger.info("Initializing demo user and initial sample data...");

            User demoUser = new User("demo", "demo@antigravity.io", passwordEncoder.encode("password123"));
            demoUser = userRepository.save(demoUser);

            // Sample Task 1: Work
            Task task1 = new Task(
                    "Design Spring Boot REST API Architecture",
                    "Define controllers, DTOs, JPA entities, and JWT security filters.",
                    TaskCategory.WORK,
                    TaskPriority.HIGH,
                    LocalDate.now().plusDays(2),
                    120,
                    demoUser
            );
            task1.setActualTimeLoggedMinutes(50);
            task1.setCompleted(false);
            task1 = taskRepository.save(task1);

            // Sample Task 2: Study
            Task task2 = new Task(
                    "Review TypeScript Generic Interfaces",
                    "Study advanced React hooks and state management with TypeScript.",
                    TaskCategory.STUDY,
                    TaskPriority.MEDIUM,
                    LocalDate.now().plusDays(5),
                    90,
                    demoUser
            );
            task2.setActualTimeLoggedMinutes(25);
            task2.setCompleted(false);
            task2 = taskRepository.save(task2);

            // Sample Task 3: Personal
            Task task3 = new Task(
                    "Morning Workout & Hydration",
                    "30-minute cardio and stretching routine.",
                    TaskCategory.PERSONAL,
                    TaskPriority.LOW,
                    LocalDate.now(),
                    30,
                    demoUser
            );
            task3.setActualTimeLoggedMinutes(30);
            task3.setCompleted(true);
            task3 = taskRepository.save(task3);

            // Sample Task 4: Work
            Task task4 = new Task(
                    "Deploy Pomodoro Timer Frontend",
                    "Build responsive Tailwind CSS UI with Lucide-React icons and sound alerts.",
                    TaskCategory.WORK,
                    TaskPriority.HIGH,
                    LocalDate.now().plusDays(1),
                    75,
                    demoUser
            );
            task4.setActualTimeLoggedMinutes(0);
            task4.setCompleted(false);
            taskRepository.save(task4);

            // Sample Time Logs
            TimeLog log1 = new TimeLog(
                    task1,
                    demoUser,
                    LocalDateTime.now().minusHours(3),
                    LocalDateTime.now().minusHours(3).plusMinutes(25),
                    25,
                    "Pomodoro Session 1: JWT & SecurityFilterChain setup"
            );
            timeLogRepository.save(log1);

            TimeLog log2 = new TimeLog(
                    task1,
                    demoUser,
                    LocalDateTime.now().minusHours(2),
                    LocalDateTime.now().minusHours(2).plusMinutes(25),
                    25,
                    "Pomodoro Session 2: Implemented Repository queries & DTOs"
            );
            timeLogRepository.save(log2);

            TimeLog log3 = new TimeLog(
                    task2,
                    demoUser,
                    LocalDateTime.now().minusHours(1),
                    LocalDateTime.now().minusHours(1).plusMinutes(25),
                    25,
                    "Pomodoro Session 1: Studied TypeScript utility types"
            );
            timeLogRepository.save(log3);

            logger.info("Demo data initialized successfully. Login credentials: demo / password123");
        }
    }
}
