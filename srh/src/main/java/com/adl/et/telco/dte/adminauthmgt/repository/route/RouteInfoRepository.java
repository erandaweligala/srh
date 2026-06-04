package com.adl.et.telco.dte.adminauthmgt.repository.route;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteInfoRepository extends JpaRepository<RouteInfo,Long> {
    @Query(nativeQuery = true, value = "select * from route_info ri inner join route_to_actions rta on rta.route_id = ri.id and rta.action_id in (:actions) ")
    List<RouteInfo> findByActionIds(List<Long> actions);

//    @Query("SELECT DISTINCT r.activity FROM RouteInfo r")
//    List<String> findAllDistinctActivities();
}
