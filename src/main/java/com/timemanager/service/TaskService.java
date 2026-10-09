package com.timemanager.service;

import com.timemanager.dto.TaskRequest;
import com.timemanager.dto.TaskResponse;
import com.timemanager.entity.Task;
import com.timemanager.entity.TaskCategory;
import com.timemanager.entity.TaskPriority;
import com.timemanager.entity.User;
import com.timemanager.exception.ResourceNotFoundException;
import com.timemanager.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final AuthService authService;

    public TaskService(TaskRepository taskRepository, AuthService authService) {
        this.taskRepository = taskRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(TaskCategory category, TaskPriority priority, Boolean completed) {
        User user = authService.getCurrentAuthenticatedUser();
        List<Task> tasks;
        if (category == null && priority == null && completed == null) {
            tasks = taskRepository.findByUserOrderByCreatedAtDesc(user);
        } else {
            tasks = taskRepository.findWithFilters(user, completed, category, priority);
        }

        return tasks.stream().map(TaskResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        User user = authService.getCurrentAuthenticatedUser();

        Task task = new Task(
                request.getTitle(),
                request.getDescription(),
                request.getCategory(),
                request.getPriority(),
                request.getDueDate(),
                request.getEstimatedTimeMinutes(),
                user
        );

        if (request.getCompleted() != null) {
            task.setCompleted(request.getCompleted());
        }

        Task saved = taskRepository.save(task);
        return TaskResponse.fromEntity(saved);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            task.setCategory(request.getCategory());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getEstimatedTimeMinutes() != null) {
            task.setEstimatedTimeMinutes(request.getEstimatedTimeMinutes());
        }
        if (request.getCompleted() != null) {
            task.setCompleted(request.getCompleted());
        }

        Task updated = taskRepository.save(task);
        return TaskResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteTask(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse toggleTaskCompletion(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        task.setCompleted(!task.isCompleted());
        Task updated = taskRepository.save(task);
        return TaskResponse.fromEntity(updated);
    }
}
