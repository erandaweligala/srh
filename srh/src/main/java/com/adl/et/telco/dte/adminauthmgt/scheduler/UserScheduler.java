package com.adl.et.telco.dte.adminauthmgt.scheduler;


import com.adl.et.telco.dte.adminauthmgt.client.ums.UserManagementClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

@Service
@Slf4j
public class UserScheduler {
    @Autowired
    private UserManagementClient userManagementClient;

    @Scheduled(fixedRate = 60000) // 1 minutes = 60,000 milliseconds
    public void expireUsers() {
        try {
            userManagementClient.expireUsers();
            log.info("SRH | Scheduler Executed in UserManagementClient.expireUsers with rate {}","60000");
        } catch (IllegalArgumentException e) {
            log.error("SRH | Scheduler Exception in UserManagementClient.expireUsers.IllegalArgumentException | {}", e.getLocalizedMessage());
        } catch (RestClientException e) {
            log.error("SRH | Scheduler Exception in UserManagementClient.expireUsers.RestClientException | {}", e.getLocalizedMessage());
        }
    }
}
