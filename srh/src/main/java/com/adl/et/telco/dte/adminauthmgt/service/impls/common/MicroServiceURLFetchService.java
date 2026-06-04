package com.adl.et.telco.dte.adminauthmgt.service.impls.common;

import com.adl.et.telco.dte.adminauthmgt.repository.route.Actions;
import com.adl.et.telco.dte.adminauthmgt.repository.route.ActionsRepository;
import com.adl.et.telco.dte.adminauthmgt.repository.route.RouteInfo;
import com.adl.et.telco.dte.adminauthmgt.repository.route.RouteInfoRepository;
import com.adl.et.telco.dte.adminauthmgt.util.constants.AdminAuthConstant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MicroServiceURLFetchService {

    @Autowired
    private RouteInfoRepository repository;

    @Autowired
    private ActionsRepository actionsRepository;



    public Map<String, String> checkAndReturnURL(String uri, List<Long> actions) throws HttpClientErrorException {
        Map<String, String> msDataMap = new HashMap<>();

        List<RouteInfo> routes = repository.findByActionIds(actions);
        Optional<RouteInfo> route = routes.stream().filter(r -> uri.contains(r.getInPath())).findFirst();

        if(route.isPresent()){
            String microServiceURL = route.get().getOutURL();

            if (Boolean.TRUE.equals(route.get().getIsPathVariableAvailable())) {
                log.debug("url with path variables building url");
                microServiceURL = updateMicroserviceURL(microServiceURL, uri, route.get().getInPath());
            }

            Optional<Actions> actionDto = actionsRepository.findById(route.get().getActionIds());
            if(actionDto.isPresent()){
                msDataMap.put(AdminAuthConstant.ACTION_ID, String.valueOf(actionDto.get().getId()));
                msDataMap.put(AdminAuthConstant.TYPE,actionDto.get().getType());
            }

            msDataMap.put(AdminAuthConstant.MSURL, microServiceURL);
            msDataMap.put(AdminAuthConstant.ACTIONS, getActionString(route.get().getActions()));

            return msDataMap;

        }else
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN);

    }

    private String getActionString(List<Actions> actionsList) {
        try {
            String actionString = null;
            if (actionsList != null) {
                actionString = actionsList.stream().map(Actions::getName).collect(Collectors.joining(","));
            }
            return actionString;
        } catch (Exception e){
            log.error("Error while getting action string", e);
            return null;
        }
    }



    private String updateMicroserviceURL(String microServiceUrl,
                                         String apiUrl,
                                         String inPath) {

        // Get everything after inPath
        String remainingPath = apiUrl.substring(apiUrl.indexOf(inPath) + inPath.length());

        // Remove leading slash if exists
        if (remainingPath.startsWith("/")) {
            remainingPath = remainingPath.substring(1);
        }

        // Remove trailing slash from microservice URL if exists
        if (microServiceUrl.endsWith("/")) {
            microServiceUrl = microServiceUrl.substring(0, microServiceUrl.length() - 1);
        }

        return microServiceUrl + "/" + remainingPath;
    }

}
