import {FC, useEffect, useMemo, useState} from "react";
import {Button, Tabs, Table} from "antd";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
import {formatValue} from "../../../../helpers/stringValidators.ts";
import {InputsProps} from "../../../../components/common-search-panel/models/InputsProps.model.ts";
import CommonSquareButtonPreDefined
    from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import {ButtonTypeEnum} from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import DropdownValue from "../../../../model/dropdownValue.ts";
import './SubscriberProfileTab.css'
import {
    formatBytes,
    formatDateTime,
    getRemainingDays, getRemainingQuota,
    renderStatusTag
} from "../../../../helpers/helperFunctions.tsx";
import {
    deleteService,
    getActionInfo,
    getServiceInfo, getServiceInfoDetails
} from "../../services/subscriber.management.service.ts";
import {ActionInfoResponseModel} from "../../models/subscriber/action.info.model.ts";
import dayjs from "dayjs";
import BaseResponse from "../../../../model/baseResponse.ts";
import {ConnectionHistoryResponseModel} from "../../../../model/connection.history.model.ts";
import {
    getConnectionHistory,
    terminateConnection
} from "../../../../services/sessionManagement.service.ts";
import {ServiceInfoModel, ServiceInfoResponseModel} from "../../models/subscriber/service.info.model.ts";
import CommonStatusTagPredefined from "../../../../components/common-status-tag/CommonStatusTagPredefined.tsx";
import showNotification from "../../../../services/notification.service.tsx";
import CommonConfirmModal from "../../../../components/common-confirm-modal/CommonConfirmModal.tsx";
import {ServiceDetailsResponseModel} from "../../models/subscriber/service.details.model.ts";
import {getPlansList} from "../../../product-catalog/services/product.catalog.service.ts";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";

type SubscriberProfileTabProps = {
    drawerData: any;
    openEditUserDrawer: (name: string, rowData?: any) => void;
    openCreateUserDrawer: (name: string) => void;
    openViewMoreTab: (rowData: any, TabType: string) => void;
};


const actionTypes: DropdownValue[] = [
    {label: 'Activate Service', value: 'Activate Service'},
    {label: 'Create User', value: 'Create User'},
    {label: 'Get User', value: 'Get User'},
    {label: 'Get All Users', value: 'Get All Users'},
    {label: 'Update User', value: 'Update User'},
    {label: 'Delete User', value: 'Delete User'},
    {label: 'Get Users By Group', value: 'Get Users By Group'},
    {label: 'Update Service', value: 'Update Service'},
    {label: 'Delete Service', value: 'Delete Service'},
];

const searchPanelInputs: InputsProps[] = [
    {
        type: "DATEPICKER",
        valueName: "startDate",
        label: "Start Date",
        required: false,
        mainInput: true,
        placeholder: "Select Start Date"
    },
    {
        type: "DATEPICKER",
        valueName: "endDate",
        label: "End Date",
        required: false,
        mainInput: true,
        placeholder: "Select End Date"
    },
    {
        type: "DROPDOWN",
        valueName: "actionType",
        label: "Action Type",
        required: false,
        mainInput: true,
        placeholder: "Select Action Type",
        values: actionTypes
    },
    {
        type: "INPUT",
        valueName: "groupId",
        label: "Group ID",
        required: false,
        mainInput: false,
        placeholder: "Enter Group ID"
    },
    {
        type: "INPUT",
        valueName: "requestId",
        label: "Request ID",
        required: false,
        mainInput: false,
        placeholder: "Enter Request ID"
    },
    {
        type: "INPUT",
        valueName: "resultCode",
        label: "Result Code",
        required: false,
        mainInput: false,
        placeholder: "Enter Result Code"
    }
];

const SubscriberProfileTab: FC<SubscriberProfileTabProps> = ({ drawerData, openEditUserDrawer, openCreateUserDrawer, openViewMoreTab }) => {
    const [actionData, setActionData] = useState<ActionInfoResponseModel | null>(null);
    const [serviceInfoData, setServiceInfoData] = useState<BaseResponse<ServiceInfoResponseModel> | null>(null);
    const [connectionHistoryData, setConnectionHistoryData] = useState<BaseResponse<ConnectionHistoryResponseModel> | null>(null);

    const [activeTabKey, setActiveTabKey] = useState("1");

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
    }>({currentPage: 1, currentItemPerPage: 10});

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<ServiceInfoModel | null>(null);
    const [serviceInfoDetails, setServiceInfoDetails] = useState<BaseResponse<ServiceDetailsResponseModel> | null>(null);

    const [isTerminateConfirmOpen, setIsTerminateConfirmOpen] = useState(false);
    const [terminatingSession, setTerminatingSession] = useState<any | null>(null);

    type SearchFormValues = {
        startDate: string | Date | null;
        endDate: string | Date | null;
        actionType: string | null;
        groupId?: string | null;
        resultCode?: string | null;
        requestId?: string | null;
    };
    const initialSearchFormValues: SearchFormValues = {
        startDate: null,
        endDate: null,
        actionType: null,
        groupId: null,
        resultCode: null,
        requestId: null,
    };
    const [formValues, setFormValues] = useState<SearchFormValues>(initialSearchFormValues);

    type Plan = {
        planId: string;
        planName: string;
    };

    const [plans, setPlans] = useState<Plan[]>([]);
    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await getPlansList();
            setPlans(response?.data ?? []);
        } catch (e) {
            console.error("Failed to fetch plans", e);
        }
    };
    const planNameMap = useMemo(() => {
        return plans.reduce<Record<string, string>>((acc, plan) => {
            acc[plan.planId] = plan.planName;
            return acc;
        }, {});
    }, [plans]);


    type MaybeDate = string | Date | null | undefined;
    const columnsServiceInfo = [
        { title: 'Service ID', dataIndex: 'serviceId', key: 'serviceId', render: formatValue },
        { title: 'Username', dataIndex: 'username', key: 'username', render: formatValue },
        { title: 'Status', dataIndex: 'status', key: 'status', align: 'center',
            render: (value: any) => (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {renderStatusTag(value)}
                </div>
            )
        },
        { title: 'Plan ID', dataIndex: 'planId', key: 'planId', render: formatValue },
        {
            title: 'Plan Name',
            key: 'planName',
            render: (_: any, row: ServiceInfoModel) =>
                planNameMap[row.planId] ?? 'N/A'
        },
        { title: 'Plan Type', dataIndex: 'planType', key: 'planType', render: formatValue },
        { title: 'Recurring', dataIndex: 'recurringFlag', key: 'recurringFlag', render: formatValue },
        { title: 'Next Cycle Start Date', dataIndex: 'nextCycleStartDate', key: 'nextCycleStartDate', render: (value: MaybeDate) => formatDateTime(value) ?? formatValue(value) },
        { title: 'Expiry Date', dataIndex: 'expiryDate', key: 'expiryDate', render: (value: MaybeDate) => formatDateTime(value) ?? formatValue(value) },
        { title: 'Service Start Date', dataIndex: 'serviceStartDate', key: 'serviceStartDate', render: (value: MaybeDate) => formatDateTime(value) ?? formatValue(value) },
        { title: 'Cycle Date', dataIndex: 'cycleDate', key: 'cycleDate', render: formatValue },
        { title: 'Current Cycle Start Date', dataIndex: 'currentCycleStartDate', key: 'currentCycleStartDate', render: (value: MaybeDate) => formatDateTime(value) ?? formatValue(value) },
        { title: 'Current Cycle End Date', dataIndex: 'currentCycleEndDate', key: 'currentCycleEndDate', render: (value: MaybeDate) => formatDateTime(value) ?? formatValue(value) },
        { title: 'Is Group', dataIndex: 'isGroup', key: 'isGroup', render: formatValue },
        {
            title: "Action",
            key: "action",
            width: 160,
            fixed: "right",
            align: "center",
            render: (_: any, row: ServiceInfoModel) => (
                <div>
                    <ActionPermission action={ACTION_PERMISSION.VIEW_BUCKET_ACTION}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.VIEW}
                            onClick={() => openViewMoreTab(row, 'service')}
                        />
                    </ActionPermission>
                    {/* <ActionPermission action={ACTION_PERMISSION.DELETE_SERVICE_ACTION}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.DELETE}
                            onClick={() => handleDeleteClick(row)}
                        />
                    </ActionPermission> //NOTE: Button removed from UI for current scope.Code preserved to support future feature expansion if required. */}
                    {/* <ActionPermission action={ACTION_PERMISSION.UPDATE_SERVICE_ACTION}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.EDIT}
                            onClick={() => openEditUserDrawer("Edit Service", row)}
                        />
                    </ActionPermission>//NOTE: Button removed from UI for current scope.Code preserved to support future feature expansion if required. */}
                </div>
            )
        }
    ];

    const columnsConnectionHistory = [
        { title: 'Session ID', dataIndex: 'sessionId', key: 'sessionId', render: formatValue },
        { title: 'Group ID', dataIndex: 'groupId', key: 'groupId', render: formatValue },
        { title: 'Start Time', dataIndex: 'startTime', key: 'startTime',
            render: (value: any) => formatDateTime(value) ?? formatValue(value)
        },
        { title: 'End Time', dataIndex: 'endTime', key: 'endTime',
            render: (value: any) => formatDateTime(value) ?? formatValue(value)
        },
        { title: 'Connection Status', dataIndex: 'connectionStatus', key: 'connectionStatus', render: renderStatusTag },
        { title: 'Usage', dataIndex: 'usage', key: 'usage', render: (value: any) => formatBytes(value) ?? formatValue(value) },
        {
            title: "Action",
            key: "action",
            width: 210,
            fixed: "right",
            align: "center",
            render: (_: any, row: any) => {
                const isActive = String(row.connectionStatus || '').toLowerCase() === 'active';
                return (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <ActionPermission action={ACTION_PERMISSION.VIEW_CONNECTION_ACTION}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.VIEW}
                            onClick={() => openViewMoreTab(row, 'connection')}
                        />
                        </ActionPermission>
                        <ActionPermission action={ACTION_PERMISSION.TERMINATE_SESSION}>
                            <Button
                                type="default"
                                size="small"
                                onClick={() => {
                                    setTerminatingSession(row);
                                    setIsTerminateConfirmOpen(true);
                                }}
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

    const formatArrayValue = (value: any) => {
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        return value || "N/A";
    };

    const safeValue = (v: any): string => {
        if (v == null) return "N/A"; // handles null and undefined
        const s = String(v).trim().toLowerCase();
        if (s === "" || s === "null" || s === "undefined") return "N/A";
        return String(v);
    };

    const encryptionMap: Record<number, string> = {
        0: 'Plain Text',
        1: 'MD5',
        2: 'CSG Proprietary'
    };

    const getEncryptionLabel = (v: any): string => {
        if (v == null || v === '') return 'N/A';
        const n = Number(v);
        return Number.isNaN(n) ? 'N/A' : (encryptionMap[n] ?? 'N/A');
    };

    const descriptionData = [
        {
            key: 'desc-1',
            field1: "Username", value1: drawerData?.userName || "N/A",
            field2: "NAS Port Type", value2: drawerData?.nasPortType || "N/A",
            field3: "Created Date", value3: drawerData?.createdTimestamp ? dayjs(drawerData.createdTimestamp).format("YYYY-MM-DD HH:mm:ss") : "N/A"
        },
        {
            key: 'desc-2',
            field1: "Group ID", value1: drawerData?.groupId || "N/A",
            field2: "VLAN ID", value2: drawerData?.vlanId || "N/A",
            field3: "Last Updated Date", value3: drawerData?.lastUpdatedTimestamp ? dayjs(drawerData.lastUpdatedTimestamp).format("YYYY-MM-DD HH:mm:ss") : "N/A"
        },
        {
            key: 'desc-3',
            field1: "Status", value1: renderStatusTag(drawerData?.status, 'custom-status-tab') || "N/A",
            field2: "Circuit ID", value2: drawerData?.circuitId || "N/A",
            field3: "Cycle Date", value3: safeValue(drawerData?.cycleDate) || "N/A"
        },
        {
            key: 'desc-4',
            // field1: "Contact Name", value1: drawerData?.contactName || "N/A",
            field1: "Billing Account Number", value1: formatArrayValue(drawerData?.billingAccountRef) || "N/A",
            field2: "Remote ID", value2: drawerData?.remoteId || "N/A",
            field3: "Session Timeout", value3: drawerData?.sessionTimeout || "N/A"
        },
        {
            key: 'desc-5',
            // field1: "Contact Email", value1: drawerData?.contactEmail || "N/A",
            field1: "Billing", value1: drawerData?.billing || "N/A",
            field2: "Mac Address", value2: formatArrayValue(drawerData?.macAddress),
            field3: "Idle Timeout", value3: drawerData?.idleTimeout || "N/A"
        },
        {
            key: 'desc-6',
            // field1: "Contact Number", value1: formatArrayValue(drawerData?.contactNumber),
            field1: "Concurrency", value1: drawerData?.concurrency || "N/A",
            field2: "IP Allocation", value2: drawerData?.ipAllocation || "N/A",
            field3: "Custom Timeout", value3: drawerData?.customTimeout || "N/A"
        },
        {
            key: 'desc-7',
            field1: "Subscription", value1: drawerData?.subscription || "N/A",
            field2: "IP Pool Name", value2: drawerData?.ipPoolName || "N/A",
            field3: "", value3: ""
        },
        {
            key: 'desc-8',
            field1: "Encryption Method", value1: getEncryptionLabel(drawerData?.encryptionMethod),
            field2: "IPv4", value2: drawerData?.ipv4 || "N/A",
            field3: "", value3: ""
        },
        {
            key: 'desc-9',
            field1: "Notification Template", value1: drawerData?.templateName || "N/A",
            field2: "IPv6", value2: drawerData?.ipv6 || "N/A",
            field3: "", value3: ""
        }
    ];

    const columns = [
        { title: 'Field', dataIndex: 'field1', key: 'field1', width: '14%',
            onCell: () => ({ style: { backgroundColor: '#f5f5f5' } }),
            render: (text: any) => <span style={{ fontWeight: 500 }}>{text}</span>
        },
        { title: 'Value', dataIndex: 'value1', key: 'value1', width: '19.3%' },
        { title: 'Field', dataIndex: 'field2', key: 'field2', width: '14%',
            onCell: () => ({ style: { backgroundColor: '#f5f5f5' } }),
            render: (text: any) => <span style={{ fontWeight: 500 }}>{text}</span>
        },
        { title: 'Value', dataIndex: 'value2', key: 'value2', width: '19.3%' },
        { title: 'Field', dataIndex: 'field3', key: 'field3', width: '14%',
            onCell: () => ({ style: { backgroundColor: '#f5f5f5' } }),
            render: (text: any) => <span style={{ fontWeight: 500 }}>{text}</span>
        },
        { title: 'Value', dataIndex: 'value3', key: 'value3', width: '19.3%' }
    ];

    useEffect(() => {
        if (activeTabKey === "4") {
            fetchConnectionHistory();
        } else if (activeTabKey === "3") {
            fetchServiceInfo();
        } else if (activeTabKey === "2") {
            fetchActionInfo();
        }
    }, [activeTabKey, paginationDetails, drawerData?.userName, drawerData?.uniqueId]);


    const fetchActionInfo = async () => {
        const start = formValues?.startDate ? dayjs(formValues.startDate).format('YYYY-MM-DDTHH:mm:ss') : undefined;
        const end = formValues?.endDate ? dayjs(formValues.endDate).format('YYYY-MM-DDTHH:mm:ss') : undefined;

        const response = await getActionInfo(
            {
                page: paginationDetails.currentPage,
                page_size: paginationDetails.currentItemPerPage,
                ...(start ? { start_time: start } : {}),
                ...(end ? { end_time: end } : {}),
                user_name: drawerData?.userName ?? undefined,
                action: formValues?.actionType ?? undefined,
                request_id: formValues?.requestId ?? undefined,
                group_id: formValues?.groupId ?? undefined,
                result_code: formValues?.resultCode ?? undefined,
                success: true,
            }
        );

        if (response) {
            setActionData(response);
        }
    }

    useEffect(() => {
        const handleRefresh = () => {
            fetchServiceInfo();
        };

        window.addEventListener("refreshServiceInfo", handleRefresh);

        return () => {
            window.removeEventListener("refreshServiceInfo", handleRefresh);
        };
    }, []);

    const fetchServiceInfo = async () => {
        try {
            const response = await getServiceInfo({
                page: paginationDetails.currentPage,
                pageSize: paginationDetails.currentItemPerPage,
                username: drawerData?.userName ?? undefined,
                serviceId: drawerData?.serviceId ?? undefined,
                planId: drawerData?.planId ?? undefined,
                planType: drawerData?.planType ?? undefined,
                isGroup: drawerData?.isGroup ?? undefined,
                recurringFlag: drawerData?.recurringFlag ?? undefined,
            });

            if (response) {
                setServiceInfoData(response);
            }

        } catch (err: any) {
            console.error("fetchServiceInfo error:", err);
        }
    }

    const fetchConnectionHistory = async () => {

        const formatDate = (date: any) => {
            if (!date) return undefined;
            return typeof date === 'string' ? date : date.toISOString();
        };

        try {
            const start = drawerData?.startTime ? formatDate(drawerData.startTime) : dayjs().subtract(7, 'day').format('YYYY-MM-DDTHH:mm:ss');
            const end = drawerData?.endTime ? formatDate(drawerData.endTime) : dayjs().format('YYYY-MM-DDTHH:mm:ss');

            const response = await getConnectionHistory({
                page: paginationDetails.currentPage,
                pageSize: paginationDetails.currentItemPerPage,
                username: drawerData?.userName ?? undefined,
                connectionStatus: drawerData?.connectionStatus ?? undefined,
                startTime: start,
                endTime: end,
                sessionId: drawerData?.sessionId ?? undefined,
                uniqueId: drawerData?.uniqueId ?? undefined
            });

            if (response) {
                setConnectionHistoryData(response);
            }
        } catch (err) {
            console.error("fetchConnectionHistory error:", err);
        }
    }

    const onSearchFormSubmit = (values?: SearchFormValues) => {
        setFormValues(values ?? initialSearchFormValues);
        setPaginationDetails((current) => ({ ...current, currentPage: 1 }));
    };

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
    };

    const columnsActionInfo = [
        { title: 'Action Type', dataIndex: 'action', key: 'action', render: formatValue },
        { title: 'Group ID', dataIndex: 'groupId', key: 'groupId', render: formatValue },
        { title: 'Request ID', dataIndex: 'requestId', key: 'requestId', render: formatValue },
        { title: 'Date and Time', dataIndex: 'dateTime', key: 'dateTime',
            render: (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm:ss")
        },
        {
            title: 'Result Code',
            dataIndex: 'resultCode',
            key: 'resultCode',
            render: (value: string | number | null | undefined) => {
                const text = String(value ?? '').trim();
                if (!text) return formatValue(value);
                const normalized = text.toUpperCase();
                if (normalized === 'SUCCESS') {
                    return <CommonStatusTagPredefined type="success" labelName={text} />;
                }
                return formatValue(value);
            }
        },
        {
            title: 'HTTP Status',
            dataIndex: 'httpStatus',
            key: 'httpStatus',
            render: (value: number | string) => {
                const code = typeof value === 'string' ? parseInt(value, 10) : value;
                const isOk = code === 200 || code === 201;
                const color = isOk ? '#52c41a' : '#ff4d4f';

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CommonStatusTagPredefined type="custom" labelName={String(value)} backgroundColor={color} />
                    </div>
                );
            }
        },
        { title: 'Description', dataIndex: 'description', key: 'description', render: formatValue }
    ];

    const tabItems = [
        {
            key: "1",
            label: "Subscriber Info",
            children: (
                <div className="bordered-container" style={{ marginTop: "10px" }}>
                    <Table
                        className="common-basic-table custom-bordered-table"
                        columns={columns}
                        dataSource={descriptionData}
                        pagination={false}
                        showHeader={false}
                        rowKey="key"
                        tableLayout="fixed"
                    />
                </div>
            )
        },
        {
            //ToDo: need to add permission
            key: "2",
            label: "Action Info",
            children: (
                <div style={{ marginTop: "-1px" }}>
                    <CommonSearchPanel
                        inputs={searchPanelInputs}
                        title="Search Conditions"
                        isExpandBtnVisible={true}
                        onSubmit={onSearchFormSubmit}
                        onClear={() => onSearchFormSubmit(initialSearchFormValues)}
                    />
                    <DynamicTable
                        columns={columnsActionInfo}
                        data={actionData?.logs || []}
                        pagination={{
                            current: paginationDetails.currentPage,
                            pageSize: paginationDetails.currentItemPerPage,
                            total: Number(
                                (actionData as any)?.totalRecords ??
                                actionData?.logs?.length ??
                                0
                            ),
                            onChange: onTableChange
                        }}
                    />
                </div>
            )
        },
        {
            key: "3",
            label: "Service Info",
            children: (
                <div>
                    <DynamicTable
                        columns={columnsServiceInfo}
                        data={Array.isArray(serviceInfoData?.data) ? serviceInfoData.data : []}
                        pagination={{
                            current: paginationDetails.currentPage,
                            pageSize: paginationDetails.currentItemPerPage,
                            total: Number(serviceInfoData?.pageDetails?.totalRecords ?? serviceInfoData?.data?.length ?? 0),
                            onChange: onTableChange
                        }}
                        scroll={{ x: 2500 }}
                    />
                </div>
            )
        },
        {
            key: "4",
            label: "Connection History",
            children: (
                <div>
                    <DynamicTable
                        columns={columnsConnectionHistory}
                        data={Array.isArray(connectionHistoryData?.data) ? connectionHistoryData.data : []}
                        pagination={{
                            current: paginationDetails.currentPage,
                            pageSize: paginationDetails.currentItemPerPage,
                            total: Number(connectionHistoryData?.pageDetails?.totalRecords ?? connectionHistoryData?.data?.length ?? 0),
                            onChange: onTableChange
                        }}
                    />
                </div>
            )
        }
    ];

    const handleDeleteClick = async (service: ServiceInfoModel) => {
        setDeletingUser(service);
        setIsConfirmOpen(true);

        if (service?.serviceId) {
            try {
                const response = await getServiceInfoDetails(service.serviceId);
                const details: BaseResponse<ServiceDetailsResponseModel> = response ?? {
                    status: '0',
                    success: false,
                    message: '',
                    data: [],
                    pageDetails: undefined
                };
                setServiceInfoDetails(details);
            } catch (err) {
                console.error("Failed to fetch group service details:", err);
                setServiceInfoDetails({
                    status: '0',
                    success: false,
                    message: '',
                    data: [],
                    pageDetails: undefined
                });
            }
        } else {
            setServiceInfoDetails({
                status: '0',
                success: false,
                message: '',
                data: [],
                pageDetails: undefined
            });
        }

        setIsConfirmOpen(true);
    };

    const deleteUserConfirmation = async () => {
        if (!deletingUser?.username || !deletingUser?.planId) {
            showNotification("ERROR", "Something went wrong! Please try again shortly");
            return;
        }

        try {
            const requestId = crypto.randomUUID();
            const response = await deleteService(
                deletingUser.username,
                deletingUser.planId,
                requestId
            );

            if (response) {
                showNotification("SUCCESS", "Service deactivated successfully");

                setServiceInfoData(null);
                setPaginationDetails({ currentPage: 1, currentItemPerPage: paginationDetails.currentItemPerPage });

                await fetchServiceInfo();

                cancelUserDeletion();
            } else {
                showNotification("ERROR", "Something went wrong! Please try again shortly");
            }
        } catch (err) {
            showNotification("ERROR", "Unable to deactivate service. Please try again.");
            console.log("deleteUserConfirmation error:", err);
            cancelUserDeletion();
        }
    };

    const cancelUserDeletion = () => {
        setIsConfirmOpen(false);
        setDeletingUser(null);
    };

    const confirmTerminateSession = async () => {
        if (!terminatingSession) return;

        try {
            await terminateConnection(
                drawerData?.userName,
                terminatingSession.sessionId
            );

            showNotification("SUCCESS", "Session terminated successfully");

            await fetchConnectionHistory();

        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Failed to terminate session.";

            showNotification("ERROR", errorMessage);
        } finally {
            cancelTerminateSession();
        }
    };

    const cancelTerminateSession = () => {
        setIsTerminateConfirmOpen(false);
        setTerminatingSession(null);
    };


    return (
        <div className="common-page-margin" style={{ marginTop: "0px" }}>
            <Tabs
                className="bordered-tab-header"
                activeKey={activeTabKey}
                onChange={setActiveTabKey}
                items={tabItems}
                tabBarExtraContent={
                    <div style={{ display: "flex", gap: "8px", marginRight: 12 }}>
                        {activeTabKey === "1" && (
                            <>
                            {/* <ActionPermission action={ACTION_PERMISSION.UPDATE_SUBSCRIBER_ACTION_INDIVIDUAL}>
                                <Button
                                    type="default"
                                    size="small"
                                    onClick={() => openEditUserDrawer("Edit Subscriber Profile", drawerData)}
                                >
                                    Edit
                                </Button>
                            </ActionPermission>  // NOTE: Buttons removed from UI for current scope.Code preserved to support future feature expansion if required.*/}
                                <ActionPermission action={ACTION_PERMISSION.EDIT_PASSWORD_SUBSCRIBER_ACTION_INDIVIDUAL}>
                                    <Button
                                        type="default"
                                        size="small"
                                        onClick={() => openEditUserDrawer("Edit Password", drawerData)}
                                    >
                                        Edit Password
                                    </Button>
                                </ActionPermission>

                            </>
                        )}

                        {/* {activeTabKey === "3" && (
                            // <ActionPermission action={ACTION_PERMISSION.ADD_SERVICE_ACTION}>
                            //     <Button
                            //         type="primary"
                            //         size="small"
                            //         style={{fontSize: 12}}
                            //         onClick={() => {
                            //             openCreateUserDrawer("Add New Service");
                            //         }}
                            //     >
                            //         Add New Service
                            //     </Button>
                            // </ActionPermission>
                        )} // NOTE: Buttons removed from UI for current scope.Code preserved to support future feature expansion if required. */}
                    </div>
                }
                tabBarStyle={{ marginBottom: 0 }}
            />

            {isConfirmOpen && deletingUser && (
                <CommonConfirmModal
                    isOpen={isConfirmOpen}
                    title={
                        <>
                            <div style={{ paddingRight: 32, wordBreak: "break-word" }}>
                                Are you sure you want to deactivate the{" "}
                                <strong>
                                    Service ID: {deletingUser?.serviceId}, Plan Name: {planNameMap[deletingUser?.planId ?? ''] ?? 'N/A'}
                                </strong>

                            </div>

                            <div style={{ marginTop: 12 }}>
                                <div style={{ marginBottom: 8, fontWeight: 500 }}>
                                    Following remaining values are available:
                                </div>
                                <ul style={{ paddingLeft: 20, margin: 0 }}>
                                    <li>
                                        Remaining Days for expiry - <strong>{getRemainingDays(deletingUser)}</strong>
                                    </li>
                                    <li>
                                        Remaining Quota - <strong>{getRemainingQuota(deletingUser, serviceInfoDetails?.data)}</strong>
                                    </li>
                                </ul>
                            </div>
                        </>
                    }
                    okText="Yes, Deactivate"
                    cancelText="Cancel"
                    btnDanger
                    onOk={deleteUserConfirmation}
                    onCancel={cancelUserDeletion}
                />
            )}

            {isTerminateConfirmOpen && terminatingSession && (
                <CommonConfirmModal
                    isOpen={isTerminateConfirmOpen}
                    title="Are you sure you want to terminate this session?"
                    okText="Yes, Terminate"
                    cancelText="Cancel"
                    btnDanger
                    onOk={confirmTerminateSession}
                    onCancel={cancelTerminateSession}
                />
            )}

        </div>


    );
};

export default SubscriberProfileTab;
