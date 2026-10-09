package com.timemanager.service;

import com.timemanager.dto.TimeLogRequest;
import com.timemanager.dto.TimeLogResponse;
import com.timemanager.entity.Task;
import com.timemanager.entity.TimeLog;
import com.timemanager.entity.User;
import com.timemanager.exception.ResourceNotFoundException;
import com.timemanager.repository.TaskRepository;
import com.timemanager.repository.TimeLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimeLogService {

    private final TimeLogRepository timeLogRepository;
    private final TaskRepository taskRepository;
    private final AuthService authService;

    public TimeLogService(TimeLogRepository timeLogRepository,
                          TaskRepository taskRepository,
                          AuthService authService) {
        this.timeLogRepository = timeLogRepository;
        this.taskRepository = taskRepository;
        this.authService = authService;
    }

    @Transactional
    public TimeLogResponse logSession(TimeLogRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        Task task = null;

        if (request.getTaskId() != null) {
            task = taskRepository.findByIdAndUser(request.getTaskId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.getTaskId()));

            // Automatically increment actual time logged on the attached task
            int currentActual = task.getActualTimeLoggedMinutes() != null ? task.getActualTimeLoggedMinutes() : 0;
            task.setActualTimeLoggedMinutes(currentActual + request.getDurationMinutes());
            taskRepository.save(task);
        }

        TimeLog timeLog = new TimeLog(
                task,
                user,
                request.getStartTime(),
                request.getEndTime(),
                request.getDurationMinutes(),
                request.getNotes()
        );

        TimeLog savedLog = timeLogRepository.save(timeLog);
        return TimeLogResponse.fromEntity(savedLog);
    }

    @Transactional(readOnly = true)
    public List<TimeLogResponse> getTimeLogs() {
        User user = authService.getCurrentAuthenticatedUser();
        return timeLogRepository.findByUserOrderByStartTimeDesc(user)
                .stream()
                .map(TimeLogResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimeLogResponse> getTimeLogsByTaskId(Long taskId) {
        User user = authService.getCurrentAuthenticatedUser();
        return timeLogRepository.findByTaskIdAndUser(taskId, user)
                .stream()
                .map(TimeLogResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
