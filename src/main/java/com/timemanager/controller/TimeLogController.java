package com.timemanager.controller;

import com.timemanager.dto.TimeLogRequest;
import com.timemanager.dto.TimeLogResponse;
import com.timemanager.service.TimeLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/timelogs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TimeLogController {

    private final TimeLogService timeLogService;

    public TimeLogController(TimeLogService timeLogService) {
        this.timeLogService = timeLogService;
    }

    @PostMapping
    public ResponseEntity<TimeLogResponse> logSession(@Valid @RequestBody TimeLogRequest request) {
        TimeLogResponse response = timeLogService.logSession(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TimeLogResponse>> getAllTimeLogs() {
        List<TimeLogResponse> logs = timeLogService.getTimeLogs();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TimeLogResponse>> getTimeLogsByTask(@PathVariable Long taskId) {
        List<TimeLogResponse> logs = timeLogService.getTimeLogsByTaskId(taskId);
        return ResponseEntity.ok(logs);
    }
}
