import { FC, useRef, useState, useEffect } from "react";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
import { InputsProps } from "../../../../components/common-search-panel/models/InputsProps.model.ts";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
import { Button, DatePicker, Drawer, Form, Input, Select } from "antd";
import {
    DrawerState, formatBytes,
    formatDateTime,
    renderStatusTag,
    toBytes,
    updateDrawerState, getRemainingDays, getRemainingQuota
} from "../../../../helpers/helperFunctions.tsx";
import { formatValue } from "../../../../helpers/stringValidators.ts";
import CommonTabBar, { CommonTabBarRef } from "../../../../components/common-tab-bar/CommonTabBar.tsx";
import CommonViewMoreTab from "../../../../components/common-view-more-tab/CommonViewMoreTab.tsx";
import initialLoadingImage from "../../../../assets/images/Group 48778.png";
import {
    createNewService, deleteService,
    getAllSubscribers,
    getServiceInfo, getServiceInfoDetails,
    updateService
} from "../../services/subscriber.management.service.ts";
import { SubscriberResponseModel } from "../../models/subscriber/subscribers.model.ts";
import DropdownValue from "../../../../model/dropdownValue.ts";
import { getPlansList, getPlansInfo } from "../../../product-catalog/services/product.catalog.service.ts";
import OperationActionsEnum from "../../../../model/operationsActionsEnum.model.ts";
import { ArrowDownOutlined, ArrowUpOutlined, CloseOutlined } from "@ant-design/icons";
import showNotification from "../../../../services/notification.service.tsx";
import { ServiceInfoModel } from "../../models/subscriber/service.info.model.ts";
import CommonSquareButtonPreDefined
    from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import { ButtonTypeEnum } from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import dayjs from "dayjs";
import CommonConfirmModal from "../../../../components/common-confirm-modal/CommonConfirmModal.tsx";
import BaseResponse from "../../../../model/baseResponse.ts";
import { ServiceDetailsResponseModel } from "../../models/subscriber/service.details.model.ts";

type UsersProps = object;

const SubscribersGroup: FC<UsersProps> = () => {

    const statusList = [
        { label: 'Active', value: "1" },
        { label: 'Barred', value: "2" },
        { label: 'Inactive', value: "3" }
    ];

    const billingOptions = [
        { label: 'Daily', value: 1 },
        { label: 'Monthly', value: 2 },
        { label: 'Billing Cycle', value: 3 }
    ];

    const subscriptionOptions = [
        { label: 'Prepaid', value: "0" },
        { label: 'Postpaid', value: "1" },
        { label: 'Hybrid', value: "2" }
    ];

    const unitOptions: DropdownValue[] = [
        { label: 'Byte', value: 'B' },
        { label: 'KB', value: 'KB' },
        { label: 'MB', value: 'MB' },
        { label: 'GB', value: 'GB' },
        { label: 'TB', value: 'TB' }
    ];

    const [activeTab, setActiveTab] = useState("search");
    const tabBarRef = useRef<CommonTabBarRef>(null);

    const searchPanelInputs: InputsProps[] = [
        {
            type: "INPUT",
            valueName: "groupId",
            label: "Group ID",
            required: false,
            mainInput: true,
            placeholder: "Enter Group ID"
        }
    ];

    //-----Contact Name, Contact Email, Contact Number hidden due to requirements change-----
    const columns = [
        { title: 'Username', dataIndex: 'userName', key: 'userName', render: formatValue },
        { title: 'Group ID', dataIndex: 'groupId', key: 'groupId', render: formatValue },
        { title: 'Subscriber Status', dataIndex: 'status', align: 'center', key: 'status', render: renderStatusTag },
        // { title: 'Contact Name', dataIndex: 'contactName', key: 'contactName', render: formatValue },
        // {
        //     title: 'Contact Email',
        //     dataIndex: 'contactEmail',
        //     key: 'contactEmail',
        //     render: (value: any) => {
        //         if (Array.isArray(value)) {
        //             return value.join(', ');
        //         }
        //         return formatValue(value);
        //     }
        // },
        // {
        //     title: 'Contact Number',
        //     dataIndex: 'contactNumber',
        //     key: 'contactNumber',
        //     render: (value: any) => {
        //         if (Array.isArray(value)) {
        //             return value.join(', ');
        //         }
        //         return formatValue(value);
        //     }
        // },
        {
            title: 'Billing Account Number',
            dataIndex: 'billingAccountRef',
            key: 'billingAccountRef',
            render: (value: any) => {
                if (Array.isArray(value)) {
                    return value.join(', ');
                }
                return formatValue(value);
            }
        },
    ];

    const [groupMembersData, setGroupMembersData] = useState<SubscriberResponseModel | null>(null);

    const [tabDataMap, setTabDataMap] = useState<Record<string, any>>({});
    const [serviceInfoDetails, setServiceInfoDetails] = useState<BaseResponse<ServiceDetailsResponseModel> | null>(null);

    const [formValues, setFormValues] = useState<{
        groupId: string | null;
    }>();

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
    }>({ currentPage: 1, currentItemPerPage: 50 });

    const [serviceInfoPagination, setServiceInfoPagination] = useState({
        currentPage: 1,
        pageSize: 10
    });


    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingGroupService, setDeletingGroupService] = useState<ServiceInfoModel | null>(null);

    const [drawerForm] = Form.useForm();

    const [drawerData, setDrawerData] = useState<DrawerState>({
        isDrawerOpen: false,
        operation: OperationActionsEnum.NONE,
        drawerData: null
    });
    const [planIdList, setPlanIdList] = useState<DropdownValue[]>([]);
    const [planMap, setPlanMap] = useState<Record<string, string>>({});

    const getStatusLabel = (status: any) =>
        statusList.find(s => s.value === String(status))?.label ?? String(status);
    const getSubscriptionLabel = (value: any) =>
        subscriptionOptions.find(o => String(o.value) === String(value))?.label ?? String(value);
    const getBillingLabel = (value: any) =>
        billingOptions.find(o => String(o.value) === String(value))?.label ?? "N/A";


    type MaybeDate = string | Date | null | undefined;
    const columnsServiceInfo = [
        { title: 'Service ID', dataIndex: 'serviceId', key: 'serviceId', render: formatValue },
        { title: 'Username', dataIndex: 'username', key: 'username', render: formatValue },
        {
            title: 'Status', dataIndex: 'status', key: 'status', align: 'center',
            render: (value: any) => (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {renderStatusTag(value)}
                </div>
            )
        },
        { title: 'Plan ID', dataIndex: 'planId', key: 'planId', render: formatValue },
        {
            title: 'Plan Name',
            dataIndex: 'planId',
            key: 'planName',
            render: (planId: string) =>
                planMap[planId] ?? 'N/A'
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
                    <ActionPermission action={ACTION_PERMISSION.VIEW_SUBSCRIBER_ACTION_GROUP}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.VIEW}
                            onClick={() => openViewMoreTab(row, 'service')}
                        />
                        </ActionPermission>
                    {/* <ActionPermission action={ACTION_PERMISSION.DELETE_SUBSCRIBER_ACTION_GROUP}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.DELETE}
                            onClick={() => handleDeleteClick(row)}
                        />
                        </ActionPermission> // NOTE: Buttons removed from UI for current scope.Code preserved to support future feature expansion if required. */}
                    {/* <ActionPermission action={ACTION_PERMISSION.UPDATE_SUBSCRIBER_ACTION_GROUP}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.EDIT}
                            onClick={() => openEditUserDrawer("Edit Group Service", row)}
                        />
                    </ActionPermission>  // NOTE: Buttons removed from UI for current scope.Code preserved to support future feature expansion if required.*/}
                </div>
            )
        }
    ];

    const serviceViewMoreColumns = [
        { title: 'Bucket ID', dataIndex: 'bucketId', key: 'bucketId', render: formatValue },
        {
            title: 'Initial Quota',
            dataIndex: 'initialQuota',
            key: 'initialQuota',
            render: (value: any) => {
                const formatted = formatBytes(value);
                return formatted === 'N/A' ? formatValue(value) : formatted;
            }
        },
        {
            title: 'Used Quota',
            dataIndex: 'usedQuota',
            key: 'usedQuota',
            render: (value: any) => {
                const formatted = formatBytes(value);
                return formatted === 'N/A' ? formatValue(value) : formatted;
            }
        },
        {
            title: 'Remaining Quota',
            dataIndex: 'remainingQuota',
            key: 'remainingQuota',
            render: (value: any) => {
                const formatted = formatBytes(value);
                return formatted === 'N/A' ? formatValue(value) : formatted;
            }
        },
        { title: 'Priority', dataIndex: 'priority', key: 'priority', render: formatValue },
        { title: 'Bucket Expiry Date', dataIndex: 'expiration', key: 'expiration', render: (value: any) => formatDateTime(value) ?? formatValue(value) },
        {
            title: 'Speed',
            dataIndex: 'speed',
            key: 'speed',
            align: 'center',
            render: (value: any) => {
                if (!value || typeof value !== 'object') return formatValue(value);
                const uplink = value.uplinkSpeed ?? '-';
                const downlink = value.downlinkSpeed ?? '-';

                const groupStyle: React.CSSProperties = {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    width: 80,
                    justifyContent: 'flex-end'
                };

                return (
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <div style={groupStyle}>
                            <span>{uplink}</span>
                            <ArrowUpOutlined style={{ color: '#28a745' }} />
                        </div>

                        <div style={groupStyle}>
                            <span>{downlink}</span>
                            <ArrowDownOutlined style={{ color: '#1890ff' }} />
                        </div>
                    </div>
                );
            }
        }
    ];

    useEffect(() => {
        if (formValues) {
            fetchGroupMembers();
        }
    }, [paginationDetails, formValues]);

    const fetchGroupMembers = async () => {

        const response = await getAllSubscribers({
            page: paginationDetails.currentPage,
            pageSize: paginationDetails.currentItemPerPage,
            groupId: formValues?.groupId ?? undefined,
            sortBy: 'createdTimestamp',
            order: 'desc',
        });

        if (response) {
            const mappedResponse: SubscriberResponseModel = {
                ...response,
                users: (response.users || []).map(u => ({
                    ...u,
                    status: getStatusLabel(u.status),
                    subscription: getSubscriptionLabel(u.subscription),
                    billing: getBillingLabel(u.billing)
                }))
            };
            setGroupMembersData(mappedResponse);
        }
    }

    const onSearchFormSubmit = (formValues?: {
        groupId: string | null;
    }) => {
        setFormValues(formValues);
        setPaginationDetails((currentPaginationDetails) => {
            return { ...currentPaginationDetails, currentPage: 1 }
        });
    }

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
    };

    const fetchPlans = async () => {
        const response = await getPlansInfo({
            page: 1,
            page_size: 1000,
            status: 'Active'
        });
        const plans: any[] = response?.data?.plans ?? [];

        const map: Record<string, string> = {};
        const options: DropdownValue[] = [];

        plans.forEach(p => {
            if (p?.planId) {
                map[p.planId] = p.planName ?? p.planId;
                options.push({
                    label: p.planName ?? p.planId,
                    value: p.planId
                });
            }
        });

        setPlanMap(map);        // for table
        setPlanIdList(options); // for drawer select
    };


    const openCreateUserDrawer = async (name?: string) => {
        if (Object.keys(planMap).length === 0) {
            await fetchPlans();
        }

        updateDrawerState(setDrawerData, {
            isDrawerOpen: true,
            operation: OperationActionsEnum.NEW,
            drawerData: null,
            ...(name && { drawerTitle: name })
        });
    }

    useEffect(() => {
        if (
            drawerData.isDrawerOpen &&
            drawerData.operation === OperationActionsEnum.EDIT &&
            drawerData.drawerData
        ) {
            const row = drawerData.drawerData;

            drawerForm.setFieldsValue({
                status: statusList.find(s => s.label === row.status)?.value,

                serviceStartDate: row.serviceStartDate
                    ? dayjs(row.serviceStartDate)
                    : null,

                expiryDate: row.expiryDate
                    ? dayjs(row.expiryDate)
                    : null,
            });
        }
    }, [drawerData.isDrawerOpen, drawerData.operation, drawerData.drawerData]);

    const openEditUserDrawer = (name: string, rowData?: any) => {
        updateDrawerState(setDrawerData, {
            isDrawerOpen: true,
            operation: OperationActionsEnum.EDIT,
            drawerData: rowData,
            drawerTitle: name
        });
    }

    const closeDrawer = () => {
        setDrawerData({
            isDrawerOpen: false,
            operation: OperationActionsEnum.NONE,
            drawerData: null
        })
        drawerForm.resetFields();
    }

    const openViewMoreTab = (rowData: any, tabType: string = 'service') => {
        let tabKey = `${tabType}-view-${rowData.userName}`;
        let tabLabel = "";

        if (tabType === 'service') {
            tabKey = rowData?.serviceId ? `${tabType}-view-${rowData.userName}-${rowData.serviceId}` : tabKey;
            tabLabel = "Service ID: " + (rowData?.serviceId || 'N/A') + " Details";
        }

        setTabDataMap(prev => ({
            ...prev,
            [tabKey]: { ...prev[tabKey], ...rowData, tabType }
        }));

        tabBarRef.current?.openTab({ key: tabKey, label: tabLabel });
        setActiveTab(tabKey);

        if (tabType === 'service') {
            if (rowData?.serviceId) {
                fetchGroupServiceInfoDetails(rowData.serviceId, tabKey);
            } else {
                setTabDataMap(prev => ({
                    ...prev,
                    [tabKey]: { ...prev[tabKey], serviceInfoDetails: { data: [], pageDetails: null } }
                }));
            }
        }
    };

    const fetchServiceInfoForTab = async (
        tabKey: string,
        page = 1,
        pageSize = 50,
        groupIdParam?: string | null
    ) => {
        setTabDataMap(prev => ({
            ...prev,
            [tabKey]: { ...prev[tabKey], serviceInfoData: null }
        }));

        try {
            const groupId =
                groupIdParam
                ?? tabDataMap[tabKey]?.groupId
                ?? formValues?.groupId;

            if (!groupId) {
                showNotification("ERROR", "Group ID is required to view service info");
                return;
            }

            const response = await getServiceInfo({
                page,
                pageSize,
                username: String(groupId),
            });

            setTabDataMap(prev => ({
                ...prev,
                [tabKey]: { ...prev[tabKey], serviceInfoData: response ?? { data: [], pageDetails: null } }
            }));
        } catch (err) {
            setTabDataMap(prev => ({
                ...prev,
                [tabKey]: { ...prev[tabKey], serviceInfoData: { data: [], pageDetails: null } }
            }));
            console.error("Failed to fetch service info:", err);
        }
    };

    const fetchGroupServiceInfoDetails = async (serviceId: string, tabKey?: string) => {

        if (tabKey) {
            setTabDataMap(prev => ({
                ...prev,
                [tabKey]: { ...prev[tabKey], serviceInfoDetails: null }
            }));
        } else {
            setServiceInfoDetails(null);
        }

        try {
            const response = await getServiceInfoDetails(serviceId);

            if (tabKey) {
                setTabDataMap(prev => ({
                    ...prev,
                    [tabKey]: { ...prev[tabKey], serviceInfoDetails: response ?? { data: [], pageDetails: null } }
                }));
            } else {
                setServiceInfoDetails(response ?? null);
            }
        } catch (err) {
            if (tabKey) {
                setTabDataMap(prev => ({
                    ...prev,
                    [tabKey]: { ...prev[tabKey], serviceInfoDetails: { data: [], pageDetails: null } }
                }));
            } else {
                setServiceInfoDetails(null);
            }
            console.error("Failed to fetch service details:", err);
        }
    };

    const handleServiceInfoPageChange = (page: number, pageSize?: number) => {
        fetchServiceInfoForTab(activeTab, page, pageSize ?? 50);
    };


    const openServiceInfoTab = async () => {
        const tabKey = "view-service-info";

        const groupId = formValues?.groupId ?? null;

        // plan names are available for table
        if (Object.keys(planMap).length === 0) {
            await fetchPlans();
        }

        setTabDataMap(prev => ({
            ...prev,
            [tabKey]: {
                ...prev[tabKey],
                groupId
            }
        }));

        tabBarRef.current?.openTab({
            key: tabKey,
            label: "Service Info"
        });

        setActiveTab(tabKey);

        fetchServiceInfoForTab(
            tabKey,
            1,
            paginationDetails.currentItemPerPage ?? 50,
            groupId
        );

    };

    const createGroupServiceSubmit = async () => {
        try {
            const formData = await drawerForm.validateFields();

            const requestId = crypto.randomUUID();

            const payload = {
                user_id: String(formValues?.groupId ?? ''),
                request_id: requestId,
                plan_id: formData.planId,
                service_start_date: formData.serviceStartDate.format('YYYY-MM-DDTHH:mm:ss'),
                service_end_date: formData.serviceEndDate
                    ? formData.serviceEndDate.format('YYYY-MM-DDTHH:mm:ss')
                    : undefined,
                status: Number(formData.status),
                is_group: true
            }

            await createNewService(payload);

            reloadPage("view-service-info");
        } catch (err: any) {
            if (err.errorFields) {
                return;
            }
            console.log("ERROR in adding service:", err);
            const errorMessage = err?.response?.data?.message || "Failed to add service. Please try again.";
            showNotification("ERROR", errorMessage);
        }

    }

    const editGroupServiceSubmit = async () => {
        try {
            const formData = await drawerForm.validateFields();
            // Omit service_start_date: read-only in edit; avoid duplicate "must be today or future" validation from API.
            const payload = {
                quota: toBytes(formData.quota, formData.quotaUnit),
                balance_quota: toBytes(formData.balanceQuota, formData.balanceQuotaUnit),
                service_end_date: formData.expiryDate
                    ? formData.expiryDate.format('YYYY-MM-DDTHH:mm:ss')
                    : undefined,
                status: formData.status ? Number(formData.status) : undefined
            }

            const requestId = crypto.randomUUID();
            const response = await updateService(payload, drawerData.drawerData.username, drawerData.drawerData.planId, requestId);

            if (response) {
                console.log(response.status);
                reloadPage();
                showNotification("SUCCESS", 'Service updated successfully');
            }
        } catch (err: any) {
            console.log("ERROR in updating service:", err);
            const errorMessage = err?.response?.data?.message || "Failed to update service. Please try again.";
            showNotification("ERROR", errorMessage);
        }

    }

    const handleDeleteClick = async (service: ServiceInfoModel) => {
        setDeletingGroupService(service);
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

    const deleteGroupServiceConfirmation = async () => {
        if (!deletingGroupService?.username || !deletingGroupService?.planId) {
            showNotification("ERROR", "Something went wrong! Please try again shortly");
            return;
        }

        try {
            const requestId = crypto.randomUUID();
            const response = await deleteService(
                deletingGroupService.username,
                deletingGroupService.planId,
                requestId
            );

            if (response) {
                showNotification("SUCCESS", "Group service deactivated successfully");
                // refreshServiceInfo();
                fetchServiceInfoForTab(activeTab, 1, serviceInfoPagination.pageSize);
                cancelGroupServiceDeletion();
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Unable to delete group service. Please try again.";
            showNotification("ERROR", errorMessage);
            console.log("deleteUserConfirmation error:", err);
            cancelGroupServiceDeletion();
        }
    };

    const cancelGroupServiceDeletion = () => {
        setIsConfirmOpen(false);
        setDeletingGroupService(null);
    };


    const reloadPage = (tabKey?: string) => {
        closeDrawer();

        // use provided tabKey or prefer active view tab; fallback to known service info tab
        const keyToUse = tabKey ?? (activeTab && activeTab.startsWith("view-") ? activeTab : "view-service-info");

        setTabDataMap(prev => ({
            ...prev,
            [keyToUse]: {
                ...prev[keyToUse],
                groupId: formValues?.groupId ?? null
            }
        }));

        // reset to first page and fetch
        setServiceInfoPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchServiceInfoForTab(
            keyToUse,
            1,
            serviceInfoPagination.pageSize,
            formValues?.groupId
        );

    };

    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_SUBSCRIBER_INDIVIDUAL}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Subscriber Management - Group</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    ref={tabBarRef}
                    initialTabs={[{ key: "search", label: "Group Members" }]}
                    initialActiveKey="search"
                    onTabClick={setActiveTab}
                />

                {activeTab === "search" && (
                    <div className="common-page-margin" style={{ marginTop: "0px" }}>
                        <CommonSearchPanel
                            inputs={searchPanelInputs}
                            title="Search Conditions"
                            isExpandBtnVisible={false}
                            onSubmit={onSearchFormSubmit}
                            onClear={onSearchFormSubmit}
                        />

                        <div className="common-button-bar">
                            <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                <ActionPermission action={ACTION_PERMISSION.VIEW_SERVICE_INFO_SUBSCRIBER_GROUP}>
                                    <Button
                                        type="primary"
                                        size="small"
                                        style={{ fontSize: 12 }}
                                        onClick={() => {
                                            if (!(formValues?.groupId && String(formValues.groupId).trim())) return;
                                            openServiceInfoTab();
                                        }}
                                        disabled={!(formValues?.groupId && String(formValues.groupId).trim())}
                                    >
                                        View Service Info
                                    </Button>
                                </ActionPermission>
                            </div>
                        </div>

                        {formValues ? (
                            <DynamicTable
                                columns={columns}
                                data={groupMembersData?.users || []}
                                rowKey="userId"
                                pagination={{
                                    current: paginationDetails.currentPage,
                                    pageSize: paginationDetails.currentItemPerPage,
                                    total: groupMembersData?.totalRecords ?? groupMembersData?.users?.length ?? 0,
                                    onChange: onTableChange
                                }}
                            // scroll={{ x: 1450 }}
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
                    <div>
                        <div
                            className="common-page-margin"
                            style={{
                                borderLeft: "1px solid #e0e0e0",
                                borderRight: "1px solid #e0e0e0",
                                borderBottom: "1px solid #e0e0e0",
                                paddingTop: 0,
                                paddingBottom: 8,
                                paddingLeft: 16,
                                paddingRight: 16,
                                marginTop: 0,
                                borderTop: "1px solid #e0e0e0",
                            }}>
                            <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                {/* <ActionPermission action={ACTION_PERMISSION.CREATE_NEW_SUBSCRIBER_ACTION_GROUP}>

                                <Button
                                    type="primary"
                                    size="small"
                                    style={{ fontSize: 12 }}
                                    onClick={() => openCreateUserDrawer("Add New Group Service")}
                                >
                                    Add New Group Service
                                </Button>
                                </ActionPermission>  // NOTE: Buttons removed from UI for current scope.Code preserved to support future feature expansion if required.*/}
                            </div>
                        </div>

                        <CommonViewMoreTab
                            drawerData={tabDataMap[activeTab]}
                            columns={columnsServiceInfo}
                            data={Array.isArray(tabDataMap[activeTab]?.serviceInfoData?.data) ? tabDataMap[activeTab].serviceInfoData.data : []}
                            pageDetails={tabDataMap[activeTab]?.serviceInfoData?.pageDetails ?? null}
                            onPageChange={(page, pageSize) => {
                                setServiceInfoPagination({ currentPage: page, pageSize: pageSize ?? serviceInfoPagination.pageSize });
                                handleServiceInfoPageChange(page, pageSize);
                            }}
                            showPagination={true}
                            scroll={{ x: 2500 }}
                            pageSize={serviceInfoPagination.pageSize}
                        />

                    </div>

                )}

                <Drawer
                    className="common-drawer"
                    width={500}
                    title={
                        <span className="font-2xl-semi-bold">
                            {drawerData.operation === OperationActionsEnum.NEW && drawerData.drawerTitle}
                            {drawerData.operation === OperationActionsEnum.EDIT && drawerData.drawerTitle}
                        </span>
                    }
                    open={drawerData.isDrawerOpen}
                    onClose={closeDrawer}
                    destroyOnClose={true}
                    closeIcon={<CloseOutlined className="custom-close-icon" />}
                >
                    <div className="drawer-body">
                        <div className="drawer-form-content">
                            <Form
                                form={drawerForm}
                                layout="horizontal"
                                labelCol={{ span: 7 }}
                                wrapperCol={{ span: 17 }}
                                colon={false}
                            >
                                {
                                    drawerData.operation === OperationActionsEnum.NEW && drawerData.drawerTitle === "Add New Group Service" &&
                                    <>
                                        <Form.Item
                                            label="Plan"
                                            name="planId"
                                            rules={[{ required: true, message: 'Plan is required' }]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                optionFilterProp="children"
                                                className="w-100"
                                                placeholder="Select Plan"
                                            >
                                                {
                                                    planIdList &&
                                                    planIdList.length > 0 &&
                                                    planIdList?.map((item: DropdownValue) => (
                                                        <Select.Option
                                                            value={item.value}
                                                            key={item.value}
                                                        >
                                                            {item.label}
                                                        </Select.Option>
                                                    ))}
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            label="Service Start Date"
                                            name="serviceStartDate"
                                            rules={[{ required: true, message: 'Service Start Date is required' }]}
                                        >
                                            <DatePicker
                                                style={{ width: "100%" }}
                                                format="YYYY-MM-DD"
                                                placeholder="Select Service Start Date"
                                                allowClear
                                                disabledDate={(current) => {
                                                    return current && current < dayjs().startOf('day');
                                                }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Service End Date"
                                            name="serviceEndDate"
                                            colon={false}
                                        >
                                            <DatePicker
                                                style={{ width: "100%" }}
                                                format="YYYY-MM-DD"
                                                placeholder="Select Service End Date"
                                                allowClear
                                                disabledDate={(current) => {
                                                    return current && current < dayjs().startOf('day');
                                                }}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Status"
                                            name="status"
                                            rules={[{ required: true, message: 'Status is required' }]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                className="w-100"
                                                placeholder="Select status"
                                            >
                                                <Select.Option value={1}>Active</Select.Option>
                                                <Select.Option value={2}>Barred</Select.Option>
                                                <Select.Option value={3}>Inactive</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </>
                                }

                                {
                                    drawerData.operation === OperationActionsEnum.EDIT && drawerData.drawerTitle === "Edit Group Service" &&
                                    <>
                                        <Form.Item label="Quota" colon={false}>
                                            <Input.Group compact>
                                                <Form.Item
                                                    name="quota"
                                                    noStyle
                                                    rules={[
                                                        {
                                                            validator: (_, value) => {
                                                                if (value == null || String(value).trim() === '') return Promise.resolve();
                                                                const num = Number(String(value).replace(/,/g, '').trim());
                                                                return (!Number.isNaN(num) && num > 0)
                                                                    ? Promise.resolve()
                                                                    : Promise.reject(new Error('Quota must be a number greater than 0'));
                                                            }
                                                        }
                                                    ]}
                                                >
                                                    <Input
                                                        style={{ width: 'calc(100% - 120px)' }}
                                                        maxLength={10}
                                                        placeholder="Enter Quota"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    name="quotaUnit"
                                                    noStyle
                                                    rules={[{ required: true, message: 'Unit is required' }]}
                                                    initialValue="B"
                                                >
                                                    <Select style={{ width: 120 }} options={unitOptions} />
                                                </Form.Item>
                                            </Input.Group>
                                        </Form.Item>

                                        <Form.Item label="Balance Quota" colon={false}>
                                            <Input.Group compact>
                                                <Form.Item
                                                    name="balanceQuota"
                                                    noStyle
                                                    rules={[
                                                        {
                                                            validator: (_, value) => {
                                                                if (value == null || String(value).trim() === '') return Promise.resolve();
                                                                const num = Number(String(value).replace(/,/g, '').trim());
                                                                return (!Number.isNaN(num) && num > 0)
                                                                    ? Promise.resolve()
                                                                    : Promise.reject(new Error('Balance Quota must be a number greater than 0'));
                                                            }
                                                        }
                                                    ]}
                                                >
                                                    <Input
                                                        style={{ width: 'calc(100% - 120px)' }}
                                                        maxLength={10}
                                                        placeholder="Enter Balance Quota"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    name="balanceQuotaUnit"
                                                    noStyle
                                                    rules={[{ required: true, message: 'Unit is required' }]}
                                                    initialValue="B"
                                                >
                                                    <Select style={{ width: 120 }} options={unitOptions} />
                                                </Form.Item>
                                            </Input.Group>
                                        </Form.Item>


                                        <Form.Item
                                            label="Service Start Date"
                                            name="serviceStartDate"
                                            colon={false}
                                        >
                                            <DatePicker
                                                style={{ width: "100%" }}
                                                format="YYYY-MM-DD"
                                                placeholder="Select Service Start Date"
                                                allowClear
                                                disabled={true}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Service End Date"
                                            name="expiryDate"
                                            colon={false}
                                        >
                                            <DatePicker
                                                style={{ width: "100%" }}
                                                format="YYYY-MM-DD"
                                                placeholder="Select Service End Date"
                                                allowClear
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Status"
                                            name="status"
                                            colon={false}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                placeholder="Select status"
                                                options={statusList}
                                            />
                                        </Form.Item>

                                    </>
                                }
                            </Form>
                        </div>
                        <div className="drawer-btn-section">
                            {
                                drawerData.operation === OperationActionsEnum.NEW &&
                                <Button type="primary" onClick={() => createGroupServiceSubmit()}>
                                    Add
                                </Button>
                            }
                            {
                                drawerData.operation === OperationActionsEnum.EDIT &&
                                <Button type="primary" onClick={() => editGroupServiceSubmit()}>
                                    Update
                                </Button>
                            }
                        </div>
                    </div>
                </Drawer>

                {
                    isConfirmOpen &&
                    <CommonConfirmModal
                        isOpen={isConfirmOpen}
                        title={
                            <>
                                <div>
                                    Are you sure you want to deactivate the{" "}
                                    <strong>
                                        Service ID: {deletingGroupService?.serviceId} - Plan Name: {planMap[deletingGroupService?.planId || ''] ?? 'N/A'}
                                    </strong>?
                                </div>

                                <div style={{ marginTop: 12 }}>
                                    <div style={{ marginBottom: 8, fontWeight: 500 }}>
                                        Following remaining values are available:
                                    </div>
                                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                                        <li>
                                            Remaining Days for expiry - <strong>{getRemainingDays(deletingGroupService)}</strong>
                                        </li>
                                        <li>
                                            Remaining Quota - <strong>{getRemainingQuota(deletingGroupService, serviceInfoDetails?.data)}</strong>
                                        </li>
                                    </ul>
                                </div>
                            </>
                        }
                        okText="Yes, Deactivate"
                        cancelText="Cancel"
                        btnDanger
                        onOk={deleteGroupServiceConfirmation}
                        onCancel={cancelGroupServiceDeletion}
                    />
                }

                {activeTab.startsWith("service-view-") && (
                    <div>
                        <CommonViewMoreTab
                            drawerData={tabDataMap[activeTab]}
                            columns={serviceViewMoreColumns}
                            data={
                                tabDataMap[activeTab]?.serviceInfoDetails?.data
                                ?? serviceInfoDetails?.data
                                ?? []
                            }
                            pageDetails={
                                tabDataMap[activeTab]?.serviceInfoDetails?.pageDetails
                                ?? serviceInfoDetails?.pageDetails
                                ?? undefined
                            }
                            showPagination={false}
                        />
                    </div>
                )}

            </>
        </ActionPermission>
    )
}

export default SubscribersGroup;