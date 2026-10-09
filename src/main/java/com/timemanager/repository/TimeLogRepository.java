package com.timemanager.repository;

import com.timemanager.entity.TimeLog;
import com.timemanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {

    List<TimeLog> findByUserOrderByStartTimeDesc(User user);

    @Query("SELECT t FROM TimeLog t WHERE t.task.id = :taskId AND t.user = :user ORDER BY t.startTime DESC")
    List<TimeLog> findByTaskIdAndUser(@Param("taskId") Long taskId, @Param("user") User user);

    @Query("SELECT COALESCE(SUM(t.durationMinutes), 0) FROM TimeLog t WHERE t.user = :user AND t.startTime >= :since")
    long sumDurationMinutesByUserAndStartTimeAfter(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(t.durationMinutes), 0) FROM TimeLog t WHERE t.user = :user")
    long sumTotalDurationMinutesByUser(@Param("user") User user);
}
