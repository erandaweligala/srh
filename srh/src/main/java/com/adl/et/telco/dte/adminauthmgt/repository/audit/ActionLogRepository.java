package com.adl.et.telco.dte.adminauthmgt.repository.audit;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ActionLogRepository extends JpaRepository<ActionLog, Long>, JpaSpecificationExecutor<ActionLog> {

    Optional<ActionLog> findByActivityId(String activityId);

    @Modifying
    @Transactional
    @Query("UPDATE ActionLog a SET a.status = :status, a.statusDescription = :statusDescription, a.updatedAt = :updatedAt, a.isUpdate = :isUpdate WHERE a.activityId = :activityId")
    int updateStatus(@Param("activityId") String activityId,
                     @Param("status") String status,
                     @Param("statusDescription") String statusDescription,
                     @Param("updatedAt") LocalDateTime updatedAt,
                     @Param("isUpdate") Boolean isUpdate);
}
