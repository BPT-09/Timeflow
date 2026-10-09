package com.timemanager.service;

import com.timemanager.dto.AnalyticsSummaryResponse;
import com.timemanager.entity.Task;
import com.timemanager.entity.User;
import com.timemanager.repository.TaskRepository;
import com.timemanager.repository.TimeLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final TaskRepository taskRepository;
    private final TimeLogRepository timeLogRepository;
    private final AuthService authService;

    public AnalyticsService(TaskRepository taskRepository,
                            TimeLogRepository timeLogRepository,
                            AuthService authService) {
        this.taskRepository = taskRepository;
        this.timeLogRepository = timeLogRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary() {
        User user = authService.getCurrentAuthenticatedUser();

        long totalTasks = taskRepository.countByUser(user);
        long completedTasks = taskRepository.countByUserAndCompleted(user, true);
        long pendingTasks = totalTasks - completedTasks;

        double productivityScore = 0.0;
        if (totalTasks > 0) {
            productivityScore = Math.round(((double) completedTasks / totalTasks) * 1000.0) / 10.0;
        }

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfWeek = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .atStartOfDay();

        long minutesToday = timeLogRepository.sumDurationMinutesByUserAndStartTimeAfter(user, startOfToday);
        long minutesThisWeek = timeLogRepository.sumDurationMinutesByUserAndStartTimeAfter(user, startOfWeek);
        long minutesAllTime = timeLogRepository.sumTotalDurationMinutesByUser(user);

        double hoursToday = Math.round((minutesToday / 60.0) * 10.0) / 10.0;
        double hoursThisWeek = Math.round((minutesThisWeek / 60.0) * 10.0) / 10.0;
        double hoursAllTime = Math.round((minutesAllTime / 60.0) * 10.0) / 10.0;

        // Breakdown of tasks by category
        List<Task> allUserTasks = taskRepository.findByUserOrderByCreatedAtDesc(user);
        Map<String, Long> categoryCounts = new HashMap<>();
        categoryCounts.put("WORK", 0L);
        categoryCounts.put("PERSONAL", 0L);
        categoryCounts.put("STUDY", 0L);

        for (Task t : allUserTasks) {
            String cat = t.getCategory().name();
            categoryCounts.put(cat, categoryCounts.getOrDefault(cat, 0L) + 1);
        }

        return new AnalyticsSummaryResponse(
                totalTasks,
                completedTasks,
                pendingTasks,
                productivityScore,
                hoursToday,
                hoursThisWeek,
                hoursAllTime,
                categoryCounts
        );
    }
}
