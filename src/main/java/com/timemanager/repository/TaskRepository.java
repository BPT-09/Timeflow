package com.timemanager.repository;

import com.timemanager.entity.Task;
import com.timemanager.entity.TaskCategory;
import com.timemanager.entity.TaskPriority;
import com.timemanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserOrderByCreatedAtDesc(User user);

    Optional<Task> findByIdAndUser(Long id, User user);

    long countByUser(User user);

    long countByUserAndCompleted(User user, boolean completed);

    @Query("SELECT t FROM Task t WHERE t.user = :user " +
           "AND (:completed IS NULL OR t.completed = :completed) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "ORDER BY t.dueDate ASC NULLS LAST, t.createdAt DESC")
    List<Task> findWithFilters(
            @Param("user") User user,
            @Param("completed") Boolean completed,
            @Param("category") TaskCategory category,
            @Param("priority") TaskPriority priority
    );
}
