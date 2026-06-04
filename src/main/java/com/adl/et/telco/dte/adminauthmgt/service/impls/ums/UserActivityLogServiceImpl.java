package com.adl.et.telco.dte.adminauthmgt.service.impls.ums;

import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.PageDetailDto;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
import com.adl.et.telco.dte.adminauthmgt.repository.audit.ActionLog;
import com.adl.et.telco.dte.adminauthmgt.repository.audit.ActionLogRepository;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.UserActivityLogInterface;
import com.adl.et.telco.dte.adminauthmgt.specification.ActionLogSpecification;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.DisplayResultCodeEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static com.adl.et.telco.dte.adminauthmgt.util.access.AuthLoggingConstants.PROCESSING;
import static com.adl.et.telco.dte.adminauthmgt.util.resultenum.ResponseCodeEnum.EMPTY_RESPONSE;
import static com.adl.et.telco.dte.adminauthmgt.util.resultenum.ResponseCodeEnum.SUCCESSFUL;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserActivityLogServiceImpl implements UserActivityLogInterface {

    private final ResponseHandler handler;

    private final ActionLogRepository actionLogRepository;

    @Override
    public void logUserActivity(String activity, String activityId, String detailedRequest, String url, String user, Integer actionId, String type) {
        try {

            ActionLog actionLog = ActionLog.builder()
                    .activity(activity)
                    .activityId(activityId)
                    .url(url)
                    .status(PROCESSING)
                    .statusDescription("Request Processing")
                    .user(user)
                    .isUpdate(Boolean.FALSE)
                    .activityType(type)
                    .actionId(actionId)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            actionLogRepository.save(actionLog);

        } catch (Exception e) {
            log.error("Failed to log user activity: {}", e.getMessage(), e);
        }
    }

    @Override
    public void updateStatus(String activityId, String status, String statusDescription) {
        try {

            int count = actionLogRepository.updateStatus(activityId, status, statusDescription, LocalDateTime.now(),
                    Boolean.TRUE);

            if (count == 0){
                log.error("No ActionLog found for activityId: {}", activityId);
            }

        } catch (Exception e) {
            log.error("Failed to update status: {}", e.getMessage(), e);
        }
    }

    @Override
    public CommonNorthBoundResponse<List<ActionLog>> getActionLog(TableFilterRequest tableFilterRequest) {
        try {

            PageRequest pageRequest = PageRequest.of(tableFilterRequest.getOffset(), tableFilterRequest.getLimit());

            Page<ActionLog> actionLogList = actionLogRepository.findAll(
                    ActionLogSpecification.getSpecification(tableFilterRequest.getFilterValues()),
                    pageRequest
            );

            PageDetailDto pageDetailDto = new PageDetailDto();
            pageDetailDto.setPageNumber(tableFilterRequest.getOffset());
            pageDetailDto.setPageElementCount(tableFilterRequest.getLimit());
            pageDetailDto.setTotalRecords(actionLogList.getTotalElements());

            return handler.responseBuilderWithPageInformation(actionLogList.getContent(),
                    SUCCESSFUL.description(), SUCCESSFUL.code(), pageDetailDto);

        } catch (BaseException e) {
            throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                    e.getStackTrace());
        } catch (Exception e) {
            throw new BaseException(e.getMessage(), DisplayResultCodeEnum.GET_USER_ACTIVITY_LOG_FAILED.description(),
                    HttpStatus.INTERNAL_SERVER_ERROR, DisplayResultCodeEnum.GET_USER_ACTIVITY_LOG_FAILED.code(),
                    e.getStackTrace());
        }
    }


    @Override
    public CommonNorthBoundResponse<ActionLog> getActionLogById(String id) {
        try {

            Long idLong = Long.valueOf(id);

            Optional<ActionLog> singleActionLog = actionLogRepository.findById(idLong);
            if (singleActionLog.isPresent()) {
                return handler.responseBuilder(singleActionLog.get(), SUCCESSFUL.description(), SUCCESSFUL.code());
            } else {
                return handler.responseBuilder(new ActionLog(), EMPTY_RESPONSE.description()
                        , EMPTY_RESPONSE.code());
            }
        } catch (NumberFormatException e) {
            log.error("Invalid id format: {}", id);
            throw new BaseException(e.getMessage(), DisplayResultCodeEnum.GET_ACTIVITY_FAILED.description(),
                    HttpStatus.INTERNAL_SERVER_ERROR, DisplayResultCodeEnum.GET_ACTIVITY_FAILED.code(),
                    e.getStackTrace());
        }
        catch (Exception e) {
            throw new BaseException(e.getMessage(), DisplayResultCodeEnum.GET_ACTIVITY_FAILED.description(),
                    HttpStatus.INTERNAL_SERVER_ERROR, DisplayResultCodeEnum.GET_ACTIVITY_FAILED.code(),
                    e.getStackTrace());
        }
    }
}
