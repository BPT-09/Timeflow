package com.timemanager;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.timemanager.dto.LoginRequest;
import com.timemanager.dto.SignupRequest;
import com.timemanager.dto.TaskRequest;
import com.timemanager.dto.TimeLogRequest;
import com.timemanager.entity.TaskCategory;
import com.timemanager.entity.TaskPriority;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class TimeManagerApiTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String jwtToken;
    private static Long createdTaskId;

    @Test
    @Order(1)
    void testUserSignupAndLogin() throws Exception {
        // Test Login with Pre-seeded demo user
        LoginRequest loginRequest = new LoginRequest("demo", "password123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username", is("demo")))
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        jwtToken = objectMapper.readTree(responseBody).get("token").asText();

        // Also test creating a brand new user
        SignupRequest signup = new SignupRequest("bob_tester", "bob@example.com", "secure123");
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username", is("bob_tester")));
    }

    @Test
    @Order(2)
    void testTaskCreationAndFiltering() throws Exception {
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("Unit Test Spring Security");
        taskRequest.setDescription("Validate JWT endpoints with MockMvc");
        taskRequest.setCategory(TaskCategory.STUDY);
        taskRequest.setPriority(TaskPriority.HIGH);
        taskRequest.setDueDate(LocalDate.now().plusDays(3));
        taskRequest.setEstimatedTimeMinutes(60);

        MvcResult createResult = mockMvc.perform(post("/api/v1/tasks")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title", is("Unit Test Spring Security")))
                .andExpect(jsonPath("$.category", is("STUDY")))
                .andExpect(jsonPath("$.actualTimeLoggedMinutes", is(0)))
                .andReturn();

        createdTaskId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // Test filtering by category
        mockMvc.perform(get("/api/v1/tasks")
                        .header("Authorization", "Bearer " + jwtToken)
                        .param("category", "STUDY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @Order(3)
    void testTimeLogAndAutoTaskUpdate() throws Exception {
        // Log a 25-minute Pomodoro session attached to the created task
        TimeLogRequest logRequest = new TimeLogRequest(
                createdTaskId,
                LocalDateTime.now().minusMinutes(25),
                LocalDateTime.now(),
                25,
                "Focused MockMvc test writing"
        );

        mockMvc.perform(post("/api/v1/timelogs")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.durationMinutes", is(25)))
                .andExpect(jsonPath("$.taskId", is(createdTaskId.intValue())));

        // Verify that the task's actual logged time was automatically incremented by 25 mins
        mockMvc.perform(get("/api/v1/tasks/" + createdTaskId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.actualTimeLoggedMinutes", is(25)));
    }

    @Test
    @Order(4)
    void testAnalyticsSummaryEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/summary")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTasks", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.productivityScore").isNumber())
                .andExpect(jsonPath("$.totalHoursLoggedToday").isNumber())
                .andExpect(jsonPath("$.totalHoursLoggedThisWeek").isNumber());
    }
}
