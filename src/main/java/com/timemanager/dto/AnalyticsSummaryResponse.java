package com.timemanager.dto;

import java.util.Map;

public class AnalyticsSummaryResponse {

    private long totalTasks;
    private long totalTasksCompleted;
    private long totalTasksPending;
    private double productivityScore; // e.g. 75.0%
    private double totalHoursLoggedToday;
    private double totalHoursLoggedThisWeek;
    private double totalHoursLoggedAllTime;
    private Map<String, Long> categoryTaskCounts;

    public AnalyticsSummaryResponse() {
    }

    public AnalyticsSummaryResponse(long totalTasks, long totalTasksCompleted, long totalTasksPending,
                                    double productivityScore, double totalHoursLoggedToday,
                                    double totalHoursLoggedThisWeek, double totalHoursLoggedAllTime,
                                    Map<String, Long> categoryTaskCounts) {
        this.totalTasks = totalTasks;
        this.totalTasksCompleted = totalTasksCompleted;
        this.totalTasksPending = totalTasksPending;
        this.productivityScore = productivityScore;
        this.totalHoursLoggedToday = totalHoursLoggedToday;
        this.totalHoursLoggedThisWeek = totalHoursLoggedThisWeek;
        this.totalHoursLoggedAllTime = totalHoursLoggedAllTime;
        this.categoryTaskCounts = categoryTaskCounts;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public long getTotalTasksCompleted() {
        return totalTasksCompleted;
    }

    public void setTotalTasksCompleted(long totalTasksCompleted) {
        this.totalTasksCompleted = totalTasksCompleted;
    }

    public long getTotalTasksPending() {
        return totalTasksPending;
    }

    public void setTotalTasksPending(long totalTasksPending) {
        this.totalTasksPending = totalTasksPending;
    }

    public double getProductivityScore() {
        return productivityScore;
    }

    public void setProductivityScore(double productivityScore) {
        this.productivityScore = productivityScore;
    }

    public double getTotalHoursLoggedToday() {
        return totalHoursLoggedToday;
    }

    public void setTotalHoursLoggedToday(double totalHoursLoggedToday) {
        this.totalHoursLoggedToday = totalHoursLoggedToday;
    }

    public double getTotalHoursLoggedThisWeek() {
        return totalHoursLoggedThisWeek;
    }

    public void setTotalHoursLoggedThisWeek(double totalHoursLoggedThisWeek) {
        this.totalHoursLoggedThisWeek = totalHoursLoggedThisWeek;
    }

    public double getTotalHoursLoggedAllTime() {
        return totalHoursLoggedAllTime;
    }

    public void setTotalHoursLoggedAllTime(double totalHoursLoggedAllTime) {
        this.totalHoursLoggedAllTime = totalHoursLoggedAllTime;
    }

    public Map<String, Long> getCategoryTaskCounts() {
        return categoryTaskCounts;
    }

    public void setCategoryTaskCounts(Map<String, Long> categoryTaskCounts) {
        this.categoryTaskCounts = categoryTaskCounts;
    }
}
