import {FC, useRef, useState, useEffect} from "react";
import ACTION_PERMISSION from "../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonSearchPanel from "../../../components/common-search-panel/CommonSearchPanel.tsx";
import {InputsProps} from "../../../components/common-search-panel/models/InputsProps.model.ts";
import DropdownValue from "../../../model/dropdownValue.ts";
import DynamicTable from "../../../components/dynamic-table/DynamicTable.tsx";
import {Button} from "antd";
import {formatDateTime, renderStatusTag, formatBytes} from "../../../helpers/helperFunctions.tsx";
import {formatValue} from "../../../helpers/stringValidators.ts";
import CommonTabBar, {CommonTabBarRef} from "../../../components/common-tab-bar/CommonTabBar.tsx";
import CommonSquareButtonPreDefined
    from "../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import {ButtonTypeEnum} from "../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import CommonViewMoreTab from "../../../components/common-view-more-tab/CommonViewMoreTab.tsx";
import initialLoadingImage from "../../../assets/images/Group 48778.png";
import BaseResponse from "../../../model/baseResponse.ts";
import {ConnectionHistoryResponseModel} from "../../../model/connection.history.model.ts";
import {
    getSessionHistory, getSessionHistoryDetails,
    terminateSession
} from "../../../services/sessionManagement.service.ts";
import {SessionDetailsResponseModel} from "../../../model/session.details.model.ts";
import dayjs from "dayjs";
import showNotification from "../../../services/notification.service.tsx";
import {FilterValues} from "../../other/models/message-logs.model.ts";
import {
    reportDownloadRequestSessionHistory
} from "../../other/service/logs.management.service.ts";
import {useAppSelector} from "../../../stores/mainStore.ts";
import CommonConfirmModal from "../../../components/common-confirm-modal/CommonConfirmModal.tsx";

type UsersProps = object;

const SessionHistory: FC<UsersProps> = () => {

    const [activeTab, setActiveTab] = useState("search");
    const tabBarRef = useRef<CommonTabBarRef>(null);

    const [isTerminateConfirmOpen, setIsTerminateConfirmOpen] = useState(false);
    const [terminatingRecord, setTerminatingRecord] = useState<any | null>(null);

    const connectionList: DropdownValue[] = [
        {label: 'Active', value: 'ACTIVE'},
        {label: 'Completed', value: 'COMPLETED'},
        {label: 'Terminated', value: 'TERMINATED'},
    ];

    const searchPanelInputs: InputsProps[] = [
        {
            type: "INPUT",
            valueName: "userName",
            label: "Username",
            required: false,
            mainInput: true,
            placeholder: "Select Username",
            maxLength: 50
        },
        {
            type: "INPUT",
            valueName: "sessionId",
            label: "Session ID",
            required: false,
            mainInput: true,
            placeholder: "Enter Parent Session ID",
            maxLength: 25
        },
        {
            type: "INPUT",
            valueName: "groupId",
            label: "Group ID",
            required: false,
            mainInput: false,
            placeholder: "Enter Group ID",
            maxLength: 50
        },
        {
            type: "DATEPICKER",
            valueName: "startTime",
            label: "Start Date",
            required: true,
            mainInput: false,
            placeholder: "Select Start Date"
        },
        {
            type: "DATEPICKER",
            valueName: "endTime",
            label: "End Date",
            required: true,
            mainInput: false,
            placeholder: "Select End Date"
        },
        {
            type: "DROPDOWN",
            valueName: "connectionStatus",
            label: "Connection Status",
            required: false,
            mainInput: false,
            placeholder: "Select Connection Status",
            values: connectionList
        }
    ];

    const columns = [
        { title: 'Username', dataIndex: 'userName', key: 'userName', render: (_: any, record: any) => formatValue(record.userName || record.username) },
        { title: 'Group ID', dataIndex: 'groupId', key: 'groupId', render: formatValue },
        { title: 'Session ID', dataIndex: 'sessionId', key: 'sessionId', render: formatValue },
        { title: 'Start Date', dataIndex: 'startTime', key: 'startTime', render: (value: any) => formatDateTime(value) ?? formatValue(value)  },
        { title: 'End Date', dataIndex: 'endTime', key: 'endTime', render: (value: any) => formatDateTime(value) ?? formatValue(value) },
        { title: 'Usage', dataIndex: 'usage', key: 'usage', render: (value: any) => formatBytes(value) ?? formatValue(value) },
        {
            title: 'Connection Status',
            dataIndex: 'connectionStatus',
            key: 'connectionStatus',
            render: renderStatusTag,
            fixed: "right",
            align: "center",
            width: 140
        },
        {
            title: "Action",
            key: "action",
            width: 180,
            fixed: "right",
            align: "center",
            render: (_: any, record: any) => {
                const isActive = String(record.connectionStatus || '').toLowerCase() === 'active';
                return (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <ActionPermission action={ACTION_PERMISSION.VIEW_SESSION}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.VIEW}
                            onClick={() => openViewMoreTab(record)}
                        />
                        </ActionPermission>
                        <ActionPermission action={ACTION_PERMISSION.TERMINATE_SESSION_ACTION}>
                            <Button
                                type="default"
                                size="small"
                                //onClick={() => handleTerminateSession(record)}
                                onClick={() => handleTerminateClick(record)}
                                style={{fontSize: 12, alignItems: "center"}}
                                disabled={!isActive}
                            >
                                Terminate Session
                            </Button>
                        </ActionPermission>

                    </div>
                );
            }
        }
    ];

    const [sessionHistoryData, setSessionHistoryData] = useState<BaseResponse<ConnectionHistoryResponseModel> | null>(null);
    const [sessionHistoryDetails, setSessionHistoryDetails] = useState<BaseResponse<SessionDetailsResponseModel> | null>(null);

    const [tabDataMap, setTabDataMap] = useState<Record<string, any>>({});

    const [formValues, setFormValues] = useState<{
        userName: string | null;
        sessionId: string | null;
        groupId: string | null;
        startTime: any;
        endTime: any;
        connectionStatus: string | null;
    }>();



    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
    }>({currentPage: 1, currentItemPerPage: 50});

    const loggedInUserName = useAppSelector(state => state.auth.decodedToken?.preferred_username);

    const columnsViewMore = [
        { title: 'Date and Time', dataIndex: 'dateTime', key: 'dateTime', render: formatValue },
        { title: 'Message ID', dataIndex: 'messageId', key: 'messageId', render: formatValue },
        { title: 'Message Type', dataIndex: 'messageType', key: 'messageType', render: formatValue },
        { title: 'Consumed Plan ID', dataIndex: 'serviceId', key: 'serviceId', render: formatValue },
        { title: 'Usage', dataIndex: 'usage', key: 'usage', render: (value: any) => (value === 0 || value === '0') ? '-' : (formatBytes(value) ?? formatValue(value)) },
        { title: 'Consumed Bucket ID', dataIndex: 'bucketId', key: 'bucketId', render: formatValue }
    ];

    useEffect(() => {
        if (formValues) {
            fetchSessionHistory();
        }
    }, [paginationDetails, formValues]);

    const fetchSessionHistory = async () => {
        const start = formValues?.startTime ? dayjs(formValues.startTime).format('YYYY-MM-DDTHH:mm:ss') : undefined;
        const end = formValues?.endTime ? dayjs(formValues.endTime).format('YYYY-MM-DDTHH:mm:ss') : undefined;

        const response = await getSessionHistory({
            page: paginationDetails.currentPage,
            pageSize: paginationDetails.currentItemPerPage,
            username: formValues?.userName ?? undefined,
            connectionStatus: formValues?.connectionStatus ?? undefined,
            ...(start ? { startTime: start } : {}),
            ...(end ? { endTime: end } : {}),
            sessionId: formValues?.sessionId ?? undefined,
            groupId: formValues?.groupId ?? undefined,
            sortBy: 'startTime',
            order: 'desc'
        });

        if (response) {
            setSessionHistoryData(response);
        }
    }

    const fetchSessionHistoryDetails = async (uniqueId: string, tabKey?: string) => {
        if (tabKey) {
            setTabDataMap(prev => ({
                ...prev,
                [tabKey]: { ...prev[tabKey], sessionHistoryDetails: null }
            }));
        } else {
            setSessionHistoryDetails(null);
        }

        try {
            const response = await getSessionHistoryDetails(uniqueId);
            if (tabKey) {
                setTabDataMap(prev => ({
                    ...prev,
                    [tabKey]: { ...prev[tabKey], sessionHistoryDetails: response ?? { data: [], pageDetails: null } }
                }));
            } else {
                setSessionHistoryDetails(response ?? null);
            }
        } catch (err) {
            if (tabKey) {
                setTabDataMap(prev => ({
                    ...prev,
                    [tabKey]: { ...prev[tabKey], sessionHistoryDetails: { data: [], pageDetails: null } }
                }));
            } else {
                setSessionHistoryDetails(null);
            }
        }
    };

    const onSearchFormSubmit = (formValues?: {
        userName: string | null;
        sessionId: string | null;
        groupId: string | null;
        startTime: any;
        endTime: any;
        connectionStatus: string | null;
    }) => {
        if (!formValues?.startTime || !formValues?.endTime) {
            showNotification("ERROR", "Please select both Start Date and End Date to continue");
            return;
        }

        setFormValues(formValues);
        setPaginationDetails((currentPaginationDetails) => {
            return {...currentPaginationDetails, currentPage: 1}
        });
    };

    /** Clear resets filters and results; must not reuse submit validation (onClear is called with no args). */
    const onSearchFormClear = () => {
        setFormValues(undefined);
        setSessionHistoryData(null);
        setPaginationDetails({ currentPage: 1, currentItemPerPage: 50 });
    };

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
    };

    const openViewMoreTab = (row: any) => {
        if (!row || !row.uniqueId) return;
        const uniqueId = row.uniqueId;
        const tabKey = `view-${uniqueId}`;

        setTabDataMap(prev => ({
            ...prev,
            [tabKey]: { ...prev[tabKey], ...row }
        }));

        if (uniqueId) {
            fetchSessionHistoryDetails(uniqueId, tabKey);
        } else {
            setTabDataMap(prev => ({
                ...prev,
                [tabKey]: { ...prev[tabKey], sessionHistoryDetails: { data: [], pageDetails: null } }
            }));
        }

        tabBarRef.current?.openTab({
            key: tabKey,
            label: "Session History Details"
        });
        setActiveTab(tabKey);
    };

    const handleExport = async () => {
        try {
            if (!formValues) {
                showNotification("ERROR", "No search criteria available for export");
                return;
            }

            const filteredData: FilterValues[] = Object.entries(formValues)
                .filter(([_key, value]) =>
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ).map(([columnName, value]) => ({
                    columnName,
                    value: value as string | number
                }));

            if (filteredData.length === 0) {
                showNotification("ERROR", "Please apply search filters before exporting");
                return;
            }

            const requestData = {
                createdBy: loggedInUserName ?? "",
                reportType: "SESSION_HISTORY",
                filterValues: filteredData
            };

            await reportDownloadRequestSessionHistory(requestData);

        } catch (err: any) {
            console.log("ERROR in exporting session history:", err);
            const errorMessage = err?.response?.data?.message || "Failed to export session history. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    }

    const handleTerminateClick = (record: any) => {
        setTerminatingRecord(record);
        setIsTerminateConfirmOpen(true);
    };

    const handleTerminateSession = async () => {
        if (!terminatingRecord) return;

        try {
            const user = terminatingRecord.userName || terminatingRecord.username;
            await terminateSession(
                user,
                terminatingRecord.sessionId
            );

            setSessionHistoryData((prevData) => {
                if (!prevData || !Array.isArray(prevData.data)) return prevData;

                const updatedData = prevData.data.map((session: any) => {
                    const isSameRow =
                        (terminatingRecord.uniqueId && session.uniqueId === terminatingRecord.uniqueId) ||
                        session.sessionId === terminatingRecord.sessionId;

                    if (!isSameRow) return session;

                    return {
                        ...session,
                        connectionStatus: "TERMINATION_REQUESTED",
                        endTime: session.endTime || new Date().toISOString()
                    };
                });

                return {
                    ...prevData,
                    data: updatedData
                };
            });

            showNotification("SUCCESS", "Session terminated successfully");
            cancelTerminateSession();

        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                "Failed to terminate session.";

            showNotification("ERROR", errorMessage);
            cancelTerminateSession();
        }
    };

    const cancelTerminateSession = () => {
        setIsTerminateConfirmOpen(false);
        setTerminatingRecord(null);
    };


    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_SESSION_ACTION}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Session History</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    ref={tabBarRef}
                    initialTabs={[{ key: "search", label: "Session History" }]}
                    initialActiveKey="search"
                    onTabClick={setActiveTab}
                />

                {activeTab === "search" && (
                    <div className="common-page-margin" style={{ marginTop: "0px" }}>
                        <CommonSearchPanel
                            inputs={searchPanelInputs}
                            title="Search Conditions"
                            isExpandBtnVisible={true}
                            onSubmit={onSearchFormSubmit}
                            onClear={onSearchFormClear}
                            initialValues={formValues}
                        />
                        <div className="common-button-bar">
                            <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                <ActionPermission action={ACTION_PERMISSION.EXPORT_SESSION_REPORT_ACTION}>
                                <Button
                                    type="default"
                                    size="small"
                                    style={{fontSize: 12}}
                                    onClick={() => {handleExport()}}
                                >
                                    Export
                                </Button>
                                </ActionPermission>
                            </div>
                        </div>

                        {formValues ? (
                            <DynamicTable
                                columns={columns}
                                data={Array.isArray(sessionHistoryData?.data) ? sessionHistoryData!.data : []}
                                rowKey="uniqueId"
                                pagination={{
                                    current: paginationDetails.currentPage,
                                    pageSize: paginationDetails.currentItemPerPage,
                                    total: Number(sessionHistoryData?.pageDetails?.totalRecords ?? sessionHistoryData?.data?.length ?? 0),
                                    onChange: onTableChange
                                }}
                                scroll={{ x: 1450 }}
                            />
                        ) : (
                            <div style={{
                                // position: "absolute",
                                position: "sticky",
                                top: 288,
                                left: 503,
                                width: 360,
                                height: 240,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <img
                                    src={initialLoadingImage}
                                    alt=""
                                    aria-hidden="true"
                                    style={{
                                        width: 360,
                                        height: 240,
                                        background: "transparent",
                                        opacity: 1,
                                    }}
                                />
                                <div style={{
                                    position: "absolute",
                                    bottom: "14px",
                                    textAlign: "center",
                                    color: "#c1c0c0",
                                    fontSize: "16px",
                                }}>
                                    Search Keywords to find results
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab.startsWith("view-") && (
                    <CommonViewMoreTab
                        drawerData={tabDataMap[activeTab]}
                        columns={columnsViewMore}
                        data={tabDataMap[activeTab]?.sessionHistoryDetails?.data ?? sessionHistoryDetails?.data ?? []}
                        showPagination={false}
                    />
                )}

                <CommonConfirmModal
                    isOpen={isTerminateConfirmOpen}
                    title="Are you sure you want to terminate this session?"
                    okText="Yes, Terminate"
                    cancelText="Cancel"
                    btnDanger={true}
                    onOk={handleTerminateSession}
                    onCancel={cancelTerminateSession}
                />

            </>
        </ActionPermission>
    )
}

export default SessionHistory;
