package com.timemanager.dto;

import com.timemanager.entity.TimeLog;

import java.time.LocalDateTime;

public class TimeLogResponse {

    private Long id;
    private Long taskId;
    private String taskTitle;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private String notes;
    private LocalDateTime createdAt;

    public TimeLogResponse() {
    }

    public static TimeLogResponse fromEntity(TimeLog log) {
        TimeLogResponse response = new TimeLogResponse();
        response.setId(log.getId());
        if (log.getTask() != null) {
            response.setTaskId(log.getTask().getId());
            response.setTaskTitle(log.getTask().getTitle());
        }
        response.setStartTime(log.getStartTime());
        response.setEndTime(log.getEndTime());
        response.setDurationMinutes(log.getDurationMinutes());
        response.setNotes(log.getNotes());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
