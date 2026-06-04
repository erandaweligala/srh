import {FC, useEffect, useRef, useState} from "react";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
import {InputsProps} from "../../../../components/common-search-panel/models/InputsProps.model.ts";
import {Button, Col, DatePicker, Drawer, Form, Input, Row, Select, TimePicker} from "antd";
import CommonSquareButtonPreDefined
    from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import {ButtonTypeEnum} from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import {
    DrawerState,
    formatBytes, formatDateTime,
    renderStatusTag, toBytes,
    updateDrawerState
} from "../../../../helpers/helperFunctions.tsx";
import {formatValue} from "../../../../helpers/stringValidators.ts";
import OperationActionsEnum from "../../../../model/operationsActionsEnum.model.ts";
import SubscriberProfileTab from "../subscriber-profile-tab/SubscriberProfileTab.tsx";
import CommonTabBar, {CommonTabBarRef} from "../../../../components/common-tab-bar/CommonTabBar.tsx";
import dayjs from "dayjs";
import CommonViewMoreTab from "../../../../components/common-view-more-tab/CommonViewMoreTab.tsx";
import {
    createNewService,
    createNewSubscriber, deleteSubscriber, getAllSubscribers,
    getNotificationTemplateList, getServiceInfoDetails, updateService,
    updateSubscriber,
} from "../../services/subscriber.management.service.ts";
import {SubscriberResponseModel, SubscribersModel} from "../../models/subscriber/subscribers.model.ts";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
import showNotification from "../../../../services/notification.service.tsx";
import {SubscriberCreationModel} from "../../models/subscriber/subscriber.creation.model.ts";
import initialLoadingImage from '../../../../assets/images/Group 48778.png';
import CommonConfirmModal from "../../../../components/common-confirm-modal/CommonConfirmModal.tsx";
import {SubscriberUpdateModel} from "../../models/subscriber/subscriber.update.model.ts";
import { PlusOutlined, MinusOutlined, ArrowUpOutlined, ArrowDownOutlined, CloseOutlined } from '@ant-design/icons';
import BaseResponse from "../../../../model/baseResponse.ts";
import {SessionDetailsResponseModel} from "../../../../model/session.details.model.ts";
import {getConnectionHistoryDetails} from "../../../../services/sessionManagement.service.ts";
import {ServiceDetailsResponseModel} from "../../models/subscriber/service.details.model.ts";
import {getPlansList, getPlansInfo} from "../../../product-catalog/services/product.catalog.service.ts";
import DropdownValue from "../../../../model/dropdownValue.ts";
import {FilterValues} from "../../../other/models/message-logs.model.ts";
import {
    reportDownloadRequestCreateSubscribers
} from "../../../other/service/logs.management.service.ts";
import {useAppSelector} from "../../../../stores/mainStore.ts";

type UsersProps = object;

/** Only keys the update-subscriber API accepts; edit form is hydrated from table rows that include many extra fields. */
const SUBSCRIBER_UPDATE_API_KEYS = new Set<keyof SubscriberUpdateModel>([
    'userName',
    'password',
    'encryptionMethod',
    'status',
    'groupId',
    'bandwidth',
    'contactName',
    'contactEmail',
    'contactNumber',
    'billingAccountRef',
    'billing',
    'concurrency',
    'cycleDate',
    'timeout',
    'sessionTimeout',
    'idleTimeout',
    'customTimeout',
    'nasPortType',
    'vlanId',
    'circuitId',
    'remoteId',
    'macAddress',
    'ipAllocation',
    'ipPoolName',
    'ipv4',
    'ipv6',
    'subscription',
    'templateId',
]);

const sanitizeSubscriberUpdatePayload = (raw: Record<string, unknown>): SubscriberUpdateModel => {
    const out: Partial<SubscriberUpdateModel> = {};
    SUBSCRIBER_UPDATE_API_KEYS.forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(raw, key)) return;
        const value = raw[key];
        if (value !== undefined) {
            (out as Record<string, unknown>)[key] = value;
        }
    });
    return out as SubscriberUpdateModel;
};

const Subscribers: FC<UsersProps> = () => {
    const statusList = [
        { label: 'Active', value: "1" },
        { label: 'Barred', value: "2" },
        { label: 'Inactive', value: "3" }
    ];

    const statusListService = [
        { label: 'Active', value: 1 },
        { label: 'Barred', value: 2 },
        { label: 'Inactive', value: 3 }
    ];

    const statusListInCreate = [
        { label: 'Active', value: "1" },
        { label: 'Barred', value: "2" },
        { label: 'Inactive', value: "3" }
    ];

    const statusListInUpdate = [
        { label: 'Active', value: "1" },
        { label: 'Barred', value: "2" },
        { label: 'Inactive', value: "3" }
    ];

    const nasPortOptions = [
        { label: 'PPPoE', value: 'PPPoE' },
        { label: 'IPoE', value: 'IPoE' },
    ];

    const ipAllocationOptions = [
        { label: 'Dynamic', value: 'Dynamic' },
        { label: 'Static', value: 'Static' },
    ];

    const timeOptions = [
        { label: 'Session Timeout', value: 'Session Timeout' },
        { label: 'Custom Timeout', value: 'Custom Timeout' },
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

    const encryptionOptions = [
        { label: 'Plain Text', value: 0 },
        { label: 'MD5', value: 1 },
        { label: 'CSG Proprietary', value: 2 }
    ];

    const unitOptions: DropdownValue[] = [
        { label: 'Byte', value: 'B' },
        { label: 'KB', value: 'KB' },
        { label: 'MB', value: 'MB' },
        { label: 'GB', value: 'GB' },
        { label: 'TB', value: 'TB' }
    ];

    const STATUS_LABEL_TO_VALUE: Record<string, number> = {
        Active: 1,
        Suspended: 2,
        Inactive: 3,
    };

    const [drawerData, setDrawerData] = useState<DrawerState>({
        isDrawerOpen: false,
        operation: OperationActionsEnum.NONE,
        drawerData: null
    });

    const loggedInUserName = useAppSelector(state => state.auth.decodedToken?.preferred_username);
    const [activeTab, setActiveTab] = useState("search");
    const tabBarRef = useRef<CommonTabBarRef>(null);
    const [userName, setUserName] = useState<string>();

    const [tabDataMap, setTabDataMap] = useState<Record<string, any>>({});
    const [templateOptions, setTemplateOptions] = useState<DropdownValue[]>([]);

    const openViewMoreTab = (rowData: any, tabType: string = 'service') => {
        let tabKey = `${tabType}-view-${rowData.userName}`;
        let tabLabel = "";

        if (tabType === 'service') {
            tabKey = rowData?.serviceId ? `${tabType}-view-${rowData.userName}-${rowData.serviceId}` : tabKey;
            tabLabel = "Service ID: " + (rowData?.serviceId || 'N/A') + " Details";
        } else if (tabType === 'connection') {
            tabKey = rowData?.uniqueId ? `${tabType}-view-${rowData.userName}-${rowData.uniqueId}` : tabKey;
            tabLabel = "Connection History Details";
        }

        setTabDataMap(prev => ({
            ...prev,
            [tabKey]: { ...prev[tabKey], ...rowData, tabType }
        }));

        tabBarRef.current?.openTab({ key: tabKey, label: tabLabel });
        setActiveTab(tabKey);

        if (tabType === 'connection') {
            if (rowData?.uniqueId) {
                fetchConnectionHistoryDetails(rowData.uniqueId, tabKey);
            } else {
                setTabDataMap(prev => ({
                    ...prev,
                    [tabKey]: { ...prev[tabKey], connectionHistoryDetails: { data: [], pageDetails: null } }
                }));
            }
        }
        if (tabType === 'service') {
            if (rowData?.serviceId) {
                fetchServiceInfoDetails(rowData.serviceId, tabKey);
            } else {
                setTabDataMap(prev => ({
                    ...prev,
                    [tabKey]: { ...prev[tabKey], serviceInfoDetails: { data: [], pageDetails: null } }
                }));
            }
        }
    };

    const [drawerForm] = Form.useForm();

    const searchPanelInputs: InputsProps[] = [
        {
            type: "INPUT",
            valueName: "userName",
            label: "Username",
            required: false,
            mainInput: true,
            placeholder: "Enter Username",
            // values: userList
        },
        {
            type: "INPUT",
            valueName: "groupId",
            label: "Group ID",
            required: false,
            mainInput: true,
            // minLength: 150,
            placeholder: "Enter Group ID"
        },
        {
            type: "DROPDOWN",
            valueName: "status",
            label: "Subscriber Status",
            required: false,
            mainInput: true,
            placeholder: "Select status",
            values: statusList
        },
        {
            type: "DROPDOWN",
            valueName: "subscription",
            label: "Subscription",
            required: false,
            mainInput: false,
            placeholder: "Select Subscription",
            values: subscriptionOptions
        }
    ];

//------Contact Name, Contact Email, Contact Number hidden due to requirements change-----
    const columns = [
        { title: 'Username', dataIndex: 'userName', key: 'userName', render: formatValue },
        { title: 'Group ID', dataIndex: 'groupId', key: 'groupId', render: formatValue },
        { title: 'Subscriber Status', dataIndex: 'status', key: 'status', align: 'center', render: renderStatusTag },
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
        {
            title: "Action",
            key: "action",
            width: 140,
            fixed: "right",
            align: "center",
            render: (_: any, record: any) => (
                <div>
                    <ActionPermission action={ACTION_PERMISSION.VIEW_SUBSCRIBER_ACTION_INDIVIDUAL}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.VIEW}
                            onClick={() => openProfileTab(record.userName)}
                        />
                    </ActionPermission>
                    <ActionPermission action={ACTION_PERMISSION.DELETE_SUBSCRIBER_ACTION_INDIVIDUAL}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.DELETE}
                            onClick={() => handleDeleteClick(record)}
                        />
                    </ActionPermission>

                </div>
            )
        }

    ];

    const [contactEmails, setContactEmails] = useState([{ id: 1, value: '' }]);
    const [contactNumbers, setContactNumbers] = useState([{ id: 1, value: '' }]);
    const [billingAccounts, setBillingAccounts] = useState([{ id: 1, value: '' }]);
    const [macAddresses, setMacAddresses] = useState([{ id: 1, value: '' }]);

    const [tableDataApi, setTableDataApi] = useState<SubscriberResponseModel | null>(null);

    const [connectionHistoryDetails, setConnectionHistoryDetails] = useState<BaseResponse<SessionDetailsResponseModel> | null>(null);

    const [serviceInfoDetails, setServiceInfoDetails] = useState<BaseResponse<ServiceDetailsResponseModel> | null>(null);

    const openProfileTab = (userName: string) => {
        setUserName(userName);
        const selectedRow = tableDataApi?.users?.find(row => row.userName === userName);

        const tabKey = `profile-${userName}`;

        setTabDataMap(prev => ({
            ...prev,
            [tabKey]: selectedRow
        }));

        tabBarRef.current?.openTab({
            key: tabKey,
            label: "Subscriber Profile"
        });
        setActiveTab(tabKey);
    };

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
    }>({currentPage: 1, currentItemPerPage: 10});

    const [formValues, setFormValues] = useState<{
        userName: string | null;
        groupId: string | null;
        status: string | null;
        subscription: string | null;
    }>();

    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    const [deletingUser, setDeletingUser] = useState<SubscribersModel | null>(null);

    const getStatusLabel = (status: any) =>
        statusList.find(s => s.value === String(status))?.label ?? String(status);
    const getSubscriptionLabel = (value: any) =>
        subscriptionOptions.find(o => String(o.value) === String(value))?.label ?? String(value);
    const getBillingLabel = (value: any) =>
        billingOptions.find(o => String(o.value) === String(value))?.label ?? "N/A";

    useEffect(() => {
        if (formValues) {
            searchSubscribers();
        }
    }, [paginationDetails, formValues]);

    const searchSubscribers = async () => {

        const response = await getAllSubscribers({
            page: paginationDetails.currentPage,
            pageSize: paginationDetails.currentItemPerPage,
            userName: formValues?.userName || undefined,
            groupId: formValues?.groupId || undefined,
            status: formValues?.status != null ? Number(formValues.status) : undefined,
            subscription: formValues?.subscription != null
                ? Number(formValues.subscription)
                : undefined,
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
            setTableDataApi(mappedResponse);
        }
    }

    const onSearchFormSubmit = (formValues?: {
        userName: string | null;
        groupId: string | null;
        status: string | null;
        subscription: string | null;
    }) => {
        console.log("userName", formValues?.userName);
        console.log("groupId", formValues?.groupId);
        setFormValues(formValues);
        setPaginationDetails((currentPaginationDetails) => {
            return {...currentPaginationDetails, currentPage: 1}
        });
    }

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
    };

    const [planIdList, setPlanIdList] = useState<DropdownValue[]>([]);

    const openCreateUserDrawer = async (name?: string) => {
        let planIdOptions: { label: string; value: string }[] = [];

        if (name === "Add New Service") {
            try {
                const response = await getPlansInfo({
                    page: 1,
                    page_size: 1000,
                    status: 'Active'
                });
                const plans: any[] = response?.data?.plans ?? [];
                planIdOptions = plans
                    .map((b: any) => ({ label: b.planName ?? '', value: b.planId ?? '' }))
                    .filter(opt => opt.value);
            } catch (err) {
                console.error("Failed to fetch plans list:", err);
            }

            setPlanIdList(planIdOptions);
        }
        if (name === "Add New Subscriber Profile") {
            fetchNotificationTemplates();
        }

        updateDrawerState(setDrawerData, {
            isDrawerOpen: true,
            operation: OperationActionsEnum.NEW,
            drawerData: null,
            ...(name && { drawerTitle: name })
        });
    };

    const openEditUserDrawer = async (name: string, rowData?: any) => {
        if (name === "Edit Subscriber Profile") {
            const options = await fetchNotificationTemplates();

            const incomingName = String(rowData?.templateName ?? '').trim().toLowerCase();
            const mappedTemplateId = options.find(opt =>
                String(opt.label ?? '').trim().toLowerCase() === incomingName
            )?.value;

            // pass templateId in drawerData so the existing useEffect will populate the form correctly
            updateDrawerState(setDrawerData, {
                isDrawerOpen: true,
                operation: OperationActionsEnum.EDIT,
                drawerData: { ...(rowData || {}), templateId: mappedTemplateId ?? undefined },
                drawerTitle: name
            });
        } else {
            updateDrawerState(setDrawerData, {
                isDrawerOpen: true,
                operation: OperationActionsEnum.EDIT,
                drawerData: rowData,
                drawerTitle: name
            });
        }
    };

    const closeDrawer = () => {
        setDrawerData({
            isDrawerOpen: false,
            operation: OperationActionsEnum.NONE,
            drawerData: null
        })
        drawerForm.resetFields();
        setContactEmails([{ id: 1, value: '' }]);
        setContactNumbers([{ id: 1, value: '' }]);
        setBillingAccounts([{ id: 1, value: '' }]);
        setMacAddresses([{ id: 1, value: '' }]);
    }
//---Contact Name, Contact Email, Contact Number hidden due to requirements change--
    // const addContactEmail = () => {
    //     const newId = Math.max(...contactEmails.map(email => email.id)) + 1;
    //     setContactEmails([...contactEmails, { id: newId, value: '' }]);
    // };
    // const removeContactEmail = (idToRemove: number) => {
    //     if (contactEmails.length > 1) {
    //         drawerForm.setFieldsValue({ [`contactEmail_${idToRemove}`]: undefined });
    //         setContactEmails(prev => prev.filter(email => email.id !== idToRemove));
    //     }
    // };
    //
    // const addContactNumber = () => {
    //     const newId = Math.max(...contactNumbers.map(contact => contact.id)) + 1;
    //     setContactNumbers([...contactNumbers, { id: newId, value: '' }]);
    // };
    // const removeContactNumber = (idToRemove: number) => {
    //     if (contactNumbers.length > 1) {
    //         drawerForm.setFieldsValue({ [`contactNumber_${idToRemove}`]: undefined });
    //         setContactNumbers(prev => prev.filter(contact => contact.id !== idToRemove));
    //     }
    // };

    const addBillingAccount = () => {
        const newId = Math.max(...billingAccounts.map(billingRef => billingRef.id)) + 1;
        setBillingAccounts([...billingAccounts, { id: newId, value: '' }]);
    };
    const removeBillingAccount = (idToRemove: number) => {
        if (billingAccounts.length > 1) {
            drawerForm.setFieldsValue({ [`billingAccountRef_${idToRemove}`]: undefined });
            setBillingAccounts(prev => prev.filter(billingRef => billingRef.id !== idToRemove));
        }
    };

    const addMacAddress = () => {
        const newId = Math.max(...macAddresses.map(mac => mac.id)) + 1;
        setMacAddresses([...macAddresses, { id: newId, value: '' }]);
    };

    const removeMacAddress = (idToRemove: number) => {
        if (macAddresses.length > 1) {
            drawerForm.setFieldsValue({ [`macAddress_${idToRemove}`]: undefined });
            setMacAddresses(prev => prev.filter(mac => mac.id !== idToRemove));
        }
    };

    useEffect(() => {
        if (
            drawerData?.operation === OperationActionsEnum.EDIT &&
            (drawerData?.drawerTitle === "Edit Subscriber Profile" ||
                drawerData?.drawerTitle === "Edit Service")
        ) {
            if (drawerData.drawerData) {
                drawerForm.resetFields();

                const formValues: any = { ...drawerData.drawerData };

                // helper to normalize (array | comma-string) -> string[]
                const normalizeToArray = (value: any): string[] => {
                    if (Array.isArray(value)) {
                        return value.map((v: any) => String(v).trim()).filter(Boolean);
                    }
                    if (value == null) return [];
                    return String(value).split(',').map((s: string) => s.trim()).filter(Boolean);
                };

                // contactEmail
                {
                    const emailArray = normalizeToArray(formValues.contactEmail);
                    const emailObjects = emailArray.length
                        ? emailArray.map((item: string, idx: number) => ({ id: idx + 1, value: item }))
                        : [{ id: 1, value: '' }];

                    setContactEmails(emailObjects);
                    formValues.contactEmail = emailObjects[0]?.value || '';
                    emailObjects.slice(1).forEach((obj: any) => {
                        formValues[`contactEmail_${obj.id}`] = obj.value;
                    });
                }

                // contactNumber
                {
                    const numberArray = normalizeToArray(formValues.contactNumber);
                    const numberObjects = numberArray.length
                        ? numberArray.map((item: string, idx: number) => ({ id: idx + 1, value: item }))
                        : [{ id: 1, value: '' }];

                    setContactNumbers(numberObjects);
                    formValues.contactNumber = numberObjects[0]?.value || '';
                    numberObjects.slice(1).forEach((obj: any) => {
                        formValues[`contactNumber_${obj.id}`] = obj.value;
                    });
                }

                // billingAccountRef
                {
                    const billingArray = normalizeToArray(formValues.billingAccountRef);
                    const billingObjects = billingArray.length
                        ? billingArray.map((item: string, idx: number) => ({ id: idx + 1, value: item }))
                        : [{ id: 1, value: '' }];

                    setBillingAccounts(billingObjects);
                    formValues.billingAccountRef = billingObjects[0]?.value || '';
                    billingObjects.slice(1).forEach((obj: any) => {
                        formValues[`billingAccountRef_${obj.id}`] = obj.value;
                    });
                }

                // macAddress
                {
                    const macArray = normalizeToArray(formValues.macAddress);
                    const macObjects = macArray.length
                        ? macArray.map((item: string, idx: number) => ({ id: idx + 1, value: item }))
                        : [{ id: 1, value: '' }];

                    setMacAddresses(macObjects);
                    formValues.macAddress = macObjects[0]?.value || '';
                    macObjects.slice(1).forEach((obj: any) => {
                        formValues[`macAddress_${obj.id}`] = obj.value;
                    });
                }

                // date/time conversion
                const dateFields = ["serviceStartDate", "serviceEndDate", "expiryDate"];
                const timeFields = ["customTimeout"];

                dateFields.forEach(field => {
                    if (formValues[field] && typeof formValues[field] === 'string') {
                        formValues[field] = dayjs(formValues[field]);
                    }
                });

                timeFields.forEach(field => {
                    if (formValues[field] && typeof formValues[field] === 'string') {
                        formValues[field] = dayjs(formValues[field], "HH:mm:ss");
                    }
                });

                if (!formValues.timeout) {
                    if (formValues.sessionTimeout) {
                        formValues.timeout = 'Session Timeout';
                    } else if (formValues.customTimeout) {
                        formValues.timeout = 'Custom Timeout';
                    }
                }

                // normalize status ONLY for Edit Service
                if (drawerData.drawerTitle === "Edit Service") {
                    if (typeof formValues.status === 'string') {
                        formValues.status =
                            STATUS_LABEL_TO_VALUE[formValues.status] ?? formValues.status;
                    }
                }

                drawerForm.setFieldsValue(formValues);
            }
        }
        if (drawerData.isDrawerOpen && drawerData.operation === OperationActionsEnum.NEW) {
            drawerForm.setFieldsValue({ concurrency: '5', preferredLanguage: "English" });
        }
        if (!drawerData.isDrawerOpen) {
            drawerForm.resetFields();
        }
    }, [drawerData, drawerForm]);

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

    const connectionViewMoreColumns = [
        { title: 'Date and Time', dataIndex: 'dateTime', key: 'dateTime', render: (value: any) => formatDateTime(value) ?? formatValue(value) },
        { title: 'Message ID', dataIndex: 'messageId', key: 'messageId', render: formatValue },
        { title: 'Message Type', dataIndex: 'messageType', key: 'messageType', render: formatValue },
        { title: 'Consumed Plan ID', dataIndex: 'serviceId', key: 'serviceId', render: formatValue },
        { title: 'Usage', dataIndex: 'usage', key: 'usage', render: (value: any) => formatBytes(value) ?? formatValue(value) }
    ];

    const fetchNotificationTemplates = async (): Promise<DropdownValue[]> => {
        try {
            const response = await getNotificationTemplateList();
            const templates: any[] = response?.data ?? [];

            const options = (Array.isArray(templates) ? templates : []).map((t: any) => ({
                label: t.template_name ?? '',
                value: t.super_template_id ?? ''
            })).filter(opt => opt.value);

            setTemplateOptions(options);
            return options;
        } catch (err) {
            console.log(err)
            showNotification("ERROR", "Unable to fetch notification templates");
            setTemplateOptions([]);
            return [];
        }
    };

    const getTemplateLabel = (templateId: any) => {
        if (templateId === undefined || templateId === null || templateId === '') return undefined;
        const found = templateOptions.find(o => String(o.value) === String(templateId));
        return found?.label;
    };

    const createUpdateSubscriber = async (operation: OperationActionsEnum) => {
        drawerForm.validateFields().then(async () => {
            const formValues = drawerForm.getFieldsValue();

            // Validate Bandwidth is required when Group ID is entered
            if (formValues.groupId && formValues.groupId.trim() !== '' && (!formValues.bandwidth || formValues.bandwidth.trim() === '')) {
                showNotification("ERROR", 'Bandwidth is required when Group ID is entered');
                return;
            }

            if (formValues.customTimeout && formValues.customTimeout.$d) {
                formValues.customTimeout = formValues.customTimeout.format('HH:mm:ss');
            }

            const macAddressList = [];
            if (formValues.macAddress) macAddressList.push(formValues.macAddress);
            macAddresses.slice(1).forEach((mac) => {
                const macValue = formValues[`macAddress_${mac.id}`];
                if (macValue) macAddressList.push(macValue);
                delete formValues[`macAddress_${mac.id}`];
            });
            if (macAddressList.length > 0) {
                formValues.macAddress = macAddressList.join(',');
            }

            const contactEmailList = [];
            if (formValues.contactEmail) contactEmailList.push(formValues.contactEmail);
            contactEmails.slice(1).forEach((item) => {
                const contactValue = formValues[`contactEmail_${item.id}`];
                if (contactValue) contactEmailList.push(contactValue);
                delete formValues[`contactEmail_${item.id}`];
            });
            if (contactEmailList.length > 0) {
                formValues.contactEmail = contactEmailList.join(',');
            }

            const contactNumberList = [];
            if (formValues.contactNumber) contactNumberList.push(formValues.contactNumber);
            contactNumbers.slice(1).forEach((item) => {
                const contactValue = formValues[`contactNumber_${item.id}`];
                if (contactValue) contactNumberList.push(contactValue);
                delete formValues[`contactNumber_${item.id}`];
            });
            if (contactNumberList.length > 0) {
                formValues.contactNumber = contactNumberList.join(',');
            }

            const billingAccountList = [];
            if (formValues.billingAccountRef) billingAccountList.push(formValues.billingAccountRef);
            billingAccounts.slice(1).forEach((item) => {
                const billingValue = formValues[`billingAccountRef_${item.id}`];
                if (billingValue) billingAccountList.push(billingValue);
                delete formValues[`billingAccountRef_${item.id}`];
            });
            if (billingAccountList.length > 0) {
                formValues.billingAccountRef = billingAccountList.join(',');
            }

            if (operation === OperationActionsEnum.NEW) {
                try {
                    const reqBody: SubscriberCreationModel = {
                        ...formValues,
                        concurrency: formValues.concurrency !== undefined && formValues.concurrency !== '' ? Number(formValues.concurrency) : undefined,
                        status: formValues.status !== undefined && formValues.status !== '' ? Number(formValues.status) : undefined,
                        subscription: formValues.subscription !== undefined && formValues.subscription !== '' ? Number(formValues.subscription) : undefined,
                        billing: formValues.billing !== undefined && formValues.billing !== '' ? Number(formValues.billing) : undefined,
                        encryptionMethod: formValues.encryptionMethod !== undefined && formValues.encryptionMethod !== '' ? Number(formValues.encryptionMethod) : undefined,
                        cycleDate: formValues.cycleDate !== undefined && formValues.cycleDate !== '' ? Number(formValues.cycleDate) : undefined,
                    };

                    const response = await createNewSubscriber(reqBody);

                    if (response) {
                        showNotification("SUCCESS", 'Subscriber created successfully');
                        reloadPage();
                    }
                } catch (err: any) {
                    console.log("ERROR in creating subscriber:", err);
                    const errorMessage = err?.response?.data?.message || "Failed to create Subscriber. Please try again.";
                    showNotification("ERROR", errorMessage);
                }

            } else if (operation === OperationActionsEnum.EDIT) {

                const parseOptionalNumber = (v: any): number | undefined =>
                    v === undefined || v === '' || v === null ? undefined : (Number.isNaN(Number(v)) ? undefined : Number(v));

                const findOptionValue = (options: { label: string; value: any }[], input: any): number | undefined => {
                    if (input === undefined || input === null || input === '') return undefined;
                    if (!Number.isNaN(Number(input))) return Number(input);
                    const found = options.find(o => o.label === input || String(o.value) === String(input));
                    return found ? Number(found.value) : undefined;
                };

                // prepare reqBody for Edit Password vs Edit Subscriber Profile
                let reqBody: SubscriberUpdateModel;
                if (drawerData.drawerTitle === "Edit Password") {
                    const baseValues = {
                        ...(drawerData?.drawerData || {}),
                        ...(formValues || {})
                    };

                    const encryptionMethod =
                        formValues.encryptionMethod !== undefined && formValues.encryptionMethod !== ''
                            ? Number(formValues.encryptionMethod)
                            : undefined;

                    reqBody = sanitizeSubscriberUpdatePayload({
                        ...baseValues,
                        password: formValues.password,
                        concurrency: parseOptionalNumber(baseValues.concurrency),
                        status: findOptionValue(statusList, baseValues.status),
                        subscription: findOptionValue(subscriptionOptions, baseValues.subscription),
                        billing: findOptionValue(billingOptions, baseValues.billing),
                        cycleDate: parseOptionalNumber(baseValues.cycleDate),
                        encryptionMethod
                    } as Record<string, unknown>);
                } else {
                    reqBody = sanitizeSubscriberUpdatePayload({
                        ...formValues,
                        concurrency: parseOptionalNumber(formValues.concurrency),
                        status: findOptionValue(statusList, formValues.status),
                        subscription: findOptionValue(subscriptionOptions, formValues.subscription),
                        billing: findOptionValue(billingOptions, formValues.billing),
                        cycleDate: parseOptionalNumber(formValues.cycleDate),
                    } as Record<string, unknown>);
                }

                try {
                    const response = await updateSubscriber(reqBody);
                    if (response) {
                        const merged = {
                            ...(drawerData?.drawerData || {}),
                            ...reqBody
                        };

                        const normalizedUserName = merged.userName ?? (merged as any).user_name;
                        const profileKey = normalizedUserName ? `profile-${normalizedUserName}` : undefined;

                        const { password: _pw, ...mergedWithoutPw } = merged;

                        const resolvedTemplateName = getTemplateLabel(reqBody.templateId ?? merged.templateId);

                        const displayedUser = {
                            ...mergedWithoutPw,
                            userName: normalizedUserName,
                            status: getStatusLabel(reqBody.status ?? merged.status),
                            subscription: getSubscriptionLabel(reqBody.subscription ?? merged.subscription),
                            billing: getBillingLabel(reqBody.billing ?? merged.billing),
                            ...(resolvedTemplateName ? { templateName: resolvedTemplateName } : {})
                        };

                        if (profileKey) {
                            setTabDataMap(prev => ({
                                ...prev,
                                [profileKey]: { ...(prev[profileKey] || {}), ...displayedUser }
                            }));
                        }

                        setDrawerData(prev => ({
                            ...prev,
                            drawerData: { ...(prev.drawerData || {}), ...reqBody, ...(resolvedTemplateName ? { templateName: resolvedTemplateName } : {}) }
                        }));

                        setTableDataApi(prev => {
                            if (!prev || !Array.isArray(prev.users)) return prev;
                            return {
                                ...prev,
                                users: prev.users.map(u =>
                                    String(u.userName) === String(displayedUser.userName) ? { ...u, ...displayedUser } : u
                                )
                            };
                        });

                        showNotification("SUCCESS", drawerData.drawerTitle === "Edit Password" ? 'Subscriber password updated successfully' : 'Subscriber updated successfully');
                        closeDrawer();
                    }
                } catch (err: any) {
                    console.error('[ERROR] updateSubscriber failed:', err);
                    const errorMessage = err?.response?.data?.message || "Failed to update Subscriber. Please try again.";
                    showNotification("ERROR", errorMessage);
                }
            }

        })
    }

    const reloadPage = () => {
        closeDrawer();
        if (paginationDetails.currentPage === 1) {
            searchSubscribers();
        } else {
            setPaginationDetails(prev => ({ ...prev, currentPage: 1 }));
        }
    }

    const handleDeleteClick = (user: SubscribersModel) => {
        setDeletingUser(user);
        setIsConfirmOpen(true);
        setDrawerData(prev => ({
            ...prev,
            operation: OperationActionsEnum.DELETE
        }));
    };

    const deleteUserConfirmation = async () => {
        if (!deletingUser || !deletingUser.userName) {
            showNotification("ERROR", "Something went wrong! Please try again shortly");
            return;
        }

        try {
            const response = await deleteSubscriber(deletingUser.userName);

            if (response) {
                showNotification("SUCCESS", "Subscriber deleted successfully");
                reloadPage();
                cancelUserDeletion();
            } else {
                showNotification("ERROR", "Something went wrong! Please try again shortly");
            }
        } catch (err) {
            showNotification("ERROR", "Unable to delete subscriber. Please try again.");
            cancelUserDeletion();
        }
    };

    const cancelUserDeletion = () => {
        setIsConfirmOpen(false);
        setDeletingUser(null);
        setDrawerData(prev => ({ ...prev, operation: OperationActionsEnum.NONE }));
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
                reportType: "SUBSCRIBER_DETAILS",
                filterValues: filteredData
            };

            await reportDownloadRequestCreateSubscribers(requestData);

        } catch (err: any) {
            console.log("ERROR in exporting subscribers:", err);
            const errorMessage = err?.response?.data?.message || "Failed to export subscribers. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    }

    const fetchConnectionHistoryDetails = async (uniqueId: string, tabKey?: string) => {

        if (tabKey) {
            setTabDataMap(prev => ({
                ...prev,
                [tabKey]: { ...prev[tabKey], connectionHistoryDetails: null }
            }));
        } else {
            setConnectionHistoryDetails(null);
        }

        try {
            const response = await getConnectionHistoryDetails(uniqueId);

            if (tabKey) {
                setTabDataMap(prev => ({
                    ...prev,
                    [tabKey]: { ...prev[tabKey], connectionHistoryDetails: response ?? { data: [], pageDetails: null } }
                }));
            } else {
                setConnectionHistoryDetails(response ?? null);
            }
        } catch (err) {
            if (tabKey) {
                setTabDataMap(prev => ({
                    ...prev,
                    [tabKey]: { ...prev[tabKey], connectionHistoryDetails: { data: [], pageDetails: null } }
                }));
            } else {
                setConnectionHistoryDetails(null);
            }
        }
    };

    const fetchServiceInfoDetails = async (serviceId: string, tabKey?: string) => {

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
        }
    };

    const refreshServiceInfo = (detail?: any) => {
        const event = new CustomEvent("refreshServiceInfo", { detail });
        window.dispatchEvent(event);
    };

    const serviceDrawerSubmit = async () => {
        const formData = await drawerForm.validateFields();
        const requestId = crypto.randomUUID();

        try {
            const payload = {
                user_id:userName?userName:'',
                request_id: requestId,
                plan_id: formData.planId,
                service_start_date: formData.serviceStartDate.format('YYYY-MM-DDTHH:mm:ss'),
                service_end_date: formData.serviceEndDate
                    ? formData.serviceEndDate.format('YYYY-MM-DDTHH:mm:ss')
                    : undefined,
                status: Number(formData.status),
                is_group: false
            }

            const response = await createNewService(payload);

            if (response) {
                console.log(response.status);
                closeDrawer();
                refreshServiceInfo({ userName, createdService: response?.data });
            }
        } catch (err: any) {
            console.log("ERROR in adding service:", err);
            const errorMessage = err?.response?.data?.message || "Failed to add service. Please try again.";
            showNotification("ERROR", errorMessage);
        }

    }

    const serviceEditDrawerSubmit = async () => {
        const formData = await drawerForm.validateFields();
        console.log("formData.status", formData.status);
        try {
            // Omit service_start_date: field is read-only in edit; backend rejects past dates if we resend it.
            const payload = {
                quota: toBytes(formData.quota, formData.quotaUnit),
                balance_quota: toBytes(formData.balanceQuota, formData.balanceQuotaUnit),
                // service_end_date: formData.expiryDate.format('YYYY-MM-DDTHH:mm:ss'),
                service_end_date: formData.expiryDate
                    ? formData.expiryDate.format('YYYY-MM-DDTHH:mm:ss')
                    : undefined,
                status: Number(formData.status),
            }

            const requestId = crypto.randomUUID();
            const response = await updateService(payload, drawerData.drawerData.username, drawerData.drawerData.planId, requestId);

            if (response) {
                console.log(response.status);
                closeDrawer();
                refreshServiceInfo();
                showNotification("SUCCESS", 'Service updated successfully');
            }
        } catch (err: any) {
            console.log("ERROR in updating service:", err);
            const errorMessage = err?.response?.data?.message || "Failed to update service. Please try again.";
            showNotification("ERROR", errorMessage);
        }

    }

    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_SUBSCRIBER_INDIVIDUAL}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Subscriber Management - Individual</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    ref={tabBarRef}
                    initialTabs={[
                        { key: "search", label: "Search Subscribers" }
                    ]}
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
                            onClear={onSearchFormSubmit}
                            initialValues={formValues}
                        />

                        <div className="common-button-bar">
                            <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                <ActionPermission action={ACTION_PERMISSION.EXPORT_SUBSCRIBER_INDIVIDUAL}>
                                    <Button
                                        type="default"
                                        size="small"
                                        style={{fontSize: 12}}
                                        onClick={() => {handleExport()}}
                                    >
                                        Export
                                    </Button>
                                </ActionPermission>
                                {/* <ActionPermission action={ACTION_PERMISSION.CREATE_NEW_SUBSCRIBER_ACTION_INDIVIDUAL}>
                                    <Button
                                        type="primary"
                                        size="small"
                                        style={{fontSize: 12}}
                                        onClick={() => openCreateUserDrawer("Add New Subscriber Profile")}
                                    >
                                        Create New Subscriber
                                    </Button>
                                </ActionPermission> // NOTE: Buttons removed from UI for current scope.Code preserved to support future feature expansion if required.*/}
                                                      
                            </div>
                        </div>

                        {formValues ? (
                            <DynamicTable
                                columns={columns}
                                data={tableDataApi?.users || []}
                                rowKey="userId"
                                pagination={{
                                    current: paginationDetails.currentPage,
                                    pageSize: paginationDetails.currentItemPerPage,
                                    total: tableDataApi?.totalRecords ?? tableDataApi?.users?.length ?? 0,
                                    onChange: onTableChange
                                }}
                                // scroll={{ x: 1450 }}
                            />
                        ) : (
                            <div style={{
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

                {activeTab.startsWith("profile-") && (
                    <SubscriberProfileTab
                        drawerData={tabDataMap[activeTab]}
                        openEditUserDrawer={openEditUserDrawer}
                        openCreateUserDrawer={openCreateUserDrawer}
                        openViewMoreTab={openViewMoreTab}
                    />
                )}

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

                {activeTab.startsWith("connection-view-") && (
                    <CommonViewMoreTab
                        drawerData={tabDataMap[activeTab]}
                        columns={connectionViewMoreColumns}
                        data={
                            tabDataMap[activeTab]?.connectionHistoryDetails?.data
                            ?? connectionHistoryDetails?.data
                            ?? []
                        }
                        pageDetails={
                            tabDataMap[activeTab]?.connectionHistoryDetails?.pageDetails
                            ?? connectionHistoryDetails?.pageDetails
                            ?? undefined
                        }
                        showPagination={false}
                    />
                )}

                <Drawer
                    className="common-drawer"
                    width={drawerData.drawerTitle === "Add New Subscriber Profile" || drawerData.drawerTitle === "Edit Subscriber Profile" ? 1345 : 500}
                    title={
                        <span className="font-2xl-semi-bold">
                            {drawerData.operation === OperationActionsEnum.NEW && drawerData.drawerTitle}
                            {drawerData.operation === OperationActionsEnum.EDIT && drawerData.drawerTitle}
                        </span>
                    }
                    open={drawerData.isDrawerOpen}
                    onClose={closeDrawer}
                    destroyOnClose={true}
                    closeIcon={<CloseOutlined className="custom-close-icon"/>}
                >
                    <div className="drawer-body">
                        <div className="drawer-form-content">
                            <Form
                                form={drawerForm}
                                layout="horizontal"
                                labelCol={{ span: 7 }}
                                wrapperCol={{ span: 17 }}
                            >
                                {
                                    drawerData.operation !== OperationActionsEnum.VIEW &&
                                    <>
                                        {
                                            (drawerData.operation === OperationActionsEnum.NEW && drawerData.drawerTitle === "Add New Subscriber Profile"||
                                                (drawerData.operation === OperationActionsEnum.EDIT && drawerData.drawerTitle === "Edit Subscriber Profile")) && (
                                            <>
                                                {drawerData.operation === OperationActionsEnum.NEW && drawerData.drawerTitle === "Add New Subscriber Profile" && (
                                                    <>
                                                        <Row gutter={16}>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Username"
                                                                    name="userName"
                                                                    colon={false}
                                                                    rules={[{ required: true, message: 'Username is required' }]}
                                                                >
                                                                    <Input maxLength={50} placeholder="Enter Username"/>
                                                                </Form.Item>
                                                            </Col>

                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Password"
                                                                    name="password"
                                                                    colon={false}
                                                                    dependencies={['nasPortType']}
                                                                    rules={[
                                                                        ({ getFieldValue }) => ({
                                                                            required: getFieldValue('nasPortType') === 'PPPoE',
                                                                            message: 'Password is required',
                                                                        })
                                                                    ]}
                                                                >
                                                                    <Input maxLength={50} placeholder="Enter Password" />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label={<span>Encryption<br />Method</span>}
                                                                    name="encryptionMethod"
                                                                    colon={false}
                                                                    dependencies={['password']}
                                                                    rules={[
                                                                        ({ getFieldValue }) => ({
                                                                            required: !!getFieldValue('password'),
                                                                            message: 'Encryption Method is required',
                                                                        })
                                                                    ]}
                                                                >
                                                                    <Select
                                                                        placeholder="Encryption Method"
                                                                        options={encryptionOptions}
                                                                        allowClear
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>

                                                        <Row gutter={16}>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Status"
                                                                    name="status"
                                                                    colon={false}
                                                                    rules={[{ required: true, message: 'Status is required' }]}
                                                                >
                                                                    <Select
                                                                        placeholder="Select Status"
                                                                        options={statusListInCreate}
                                                                        allowClear
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Group ID"
                                                                    name="groupId"
                                                                    colon={false}
                                                                    rules={[
                                                                        {
                                                                            max: 20,
                                                                            message: 'Group ID cannot exceed 20 characters',
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Input maxLength={20} placeholder="Enter Group ID"/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Bandwidth"
                                                                    name="bandwidth"
                                                                    colon={false}
                                                                >
                                                                    <Input maxLength={50} placeholder="Enter Bandwidth"/>
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>

                                                        {/*<Row gutter={16}>*/}
                                                        {/*    <Col span={8}>*/}
                                                        {/*        <Form.Item*/}
                                                        {/*            label="Contact Name"*/}
                                                        {/*            name="contactName"*/}
                                                        {/*            colon={false}*/}
                                                        {/*            rules={[*/}
                                                        {/*                {*/}
                                                        {/*                    validator: (_, value) => {*/}
                                                        {/*                        if (!value || value.trim() === "") {*/}
                                                        {/*                            return Promise.resolve();*/}
                                                        {/*                        }*/}
                                                        {/*                        if (/[a-zA-Z]/.test(value)) {*/}
                                                        {/*                            return Promise.resolve();*/}
                                                        {/*                        }*/}
                                                        {/*                        return Promise.reject(new Error("Contact Name must contain letters"));*/}
                                                        {/*                    }*/}
                                                        {/*                }*/}
                                                        {/*            ]}*/}
                                                        {/*        >*/}
                                                        {/*            <Input */}
                                                        {/*                maxLength={50} */}
                                                        {/*                placeholder="Enter Contact Name"*/}
                                                        {/*            />*/}
                                                        {/*        </Form.Item>*/}
                                                        {/*    </Col>*/}
                                                        {/*    <Col span={8}>*/}
                                                        {/*        <Form.Item*/}
                                                        {/*            label="Contact Email"*/}
                                                        {/*            name="contactEmail"*/}
                                                        {/*            colon={false}*/}
                                                        {/*            rules={[*/}
                                                        {/*                { validator: validateEmail },*/}
                                                        {/*            ]}*/}
                                                        {/*        >*/}
                                                        {/*            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>*/}
                                                        {/*                <Input maxLength={50} placeholder="Enter Contact Email" value={drawerForm.getFieldValue('contactEmail')}/>*/}
                                                        {/*                <Button*/}
                                                        {/*                    icon={<PlusOutlined style={{ fontSize: '12px' }} />}*/}
                                                        {/*                    onClick={addContactEmail}*/}
                                                        {/*                    style={{*/}
                                                        {/*                        width: '24px',*/}
                                                        {/*                        height: '24px',*/}
                                                        {/*                        background: '#005B9E1A',*/}
                                                        {/*                        border: '1px solid #14579433',*/}
                                                        {/*                        opacity: 1*/}
                                                        {/*                    }}*/}
                                                        {/*                />*/}
                                                        {/*            </div>*/}
                                                        {/*        </Form.Item>*/}
                                                        {/*        {contactEmails.slice(1).map((item) => (*/}
                                                        {/*            <Form.Item*/}
                                                        {/*                key={`contactEmail-${item.id}`}*/}
                                                        {/*                label=" "*/}
                                                        {/*                name={`contactEmail_${item.id}`}*/}
                                                        {/*                colon={false}*/}
                                                        {/*                style={{ marginTop: -10 }}*/}
                                                        {/*                rules={[*/}
                                                        {/*                    { validator: validateEmail },*/}
                                                        {/*                ]}*/}
                                                        {/*            >*/}
                                                        {/*                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 0 }}>*/}
                                                        {/*                    <Input maxLength={50} placeholder="Enter Contact Email"*/}
                                                        {/*                           value={drawerForm.getFieldValue(`contactEmail_${item.id}`)}*/}
                                                        {/*                    />*/}
                                                        {/*                    <Button*/}
                                                        {/*                        icon={<MinusOutlined style={{ fontSize: '12px' }} />}*/}
                                                        {/*                        onClick={() => removeContactEmail(item.id)}*/}
                                                        {/*                        style={{*/}
                                                        {/*                            width: '24px',*/}
                                                        {/*                            height: '24px',*/}
                                                        {/*                            background: '#005B9E1A',*/}
                                                        {/*                            border: '1px solid #14579433',*/}
                                                        {/*                            opacity: 1*/}
                                                        {/*                        }}*/}
                                                        {/*                    />*/}
                                                        {/*                </div>*/}
                                                        {/*            </Form.Item>*/}
                                                        {/*        ))}*/}
                                                        {/*    </Col>*/}
                                                        {/*    <Col span={8}>*/}
                                                        {/*        <Form.Item*/}
                                                        {/*            label="Contact Number"*/}
                                                        {/*            name="contactNumber"*/}
                                                        {/*            colon={false}*/}
                                                        {/*        >*/}
                                                        {/*            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>*/}
                                                        {/*                <Input maxLength={24} placeholder="Enter Contact Number" value={drawerForm.getFieldValue('contactNumber')}/>*/}
                                                        {/*                <Button*/}
                                                        {/*                    icon={<PlusOutlined style={{ fontSize: '12px' }} />}*/}
                                                        {/*                    onClick={addContactNumber}*/}
                                                        {/*                    style={{*/}
                                                        {/*                        width: '24px',*/}
                                                        {/*                        height: '24px',*/}
                                                        {/*                        background: '#005B9E1A',*/}
                                                        {/*                        border: '1px solid #14579433',*/}
                                                        {/*                        opacity: 1*/}
                                                        {/*                    }}*/}
                                                        {/*                />*/}
                                                        {/*            </div>*/}
                                                        {/*        </Form.Item>*/}
                                                        {/*        {contactNumbers.slice(1).map((item) => (*/}
                                                        {/*            <Form.Item*/}
                                                        {/*                key={`contactNumber-${item.id}`}*/}
                                                        {/*                label=" "*/}
                                                        {/*                name={`contactNumber_${item.id}`}*/}
                                                        {/*                colon={false}*/}
                                                        {/*                style={{ marginTop: -10 }}*/}
                                                        {/*            >*/}
                                                        {/*                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 0 }}>*/}
                                                        {/*                    <Input maxLength={24} placeholder="Enter Contact Number"*/}
                                                        {/*                           value={drawerForm.getFieldValue(`contactNumber_${item.id}`)}*/}
                                                        {/*                    />*/}
                                                        {/*                    <Button*/}
                                                        {/*                        icon={<MinusOutlined style={{ fontSize: '12px' }} />}*/}
                                                        {/*                        onClick={() => removeContactNumber(item.id)}*/}
                                                        {/*                        style={{*/}
                                                        {/*                            width: '24px',*/}
                                                        {/*                            height: '24px',*/}
                                                        {/*                            background: '#005B9E1A',*/}
                                                        {/*                            border: '1px solid #14579433',*/}
                                                        {/*                            opacity: 1*/}
                                                        {/*                        }}*/}
                                                        {/*                    />*/}
                                                        {/*                </div>*/}
                                                        {/*            </Form.Item>*/}
                                                        {/*        ))}*/}
                                                        {/*    </Col>*/}
                                                        {/*</Row>*/}

                                                        <Row gutter={16}>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label={<span>Billing Account<br />Number</span>}
                                                                    name="billingAccountRef"
                                                                    colon={false}
                                                                    rules={[
                                                                        {
                                                                            max: 24,
                                                                            message: 'Billing account number cannot exceed 24 characters',
                                                                        },
                                                                    ]}
                                                                >
                                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                        <Input maxLength={24} placeholder="Enter Billing Account Number" value={drawerForm.getFieldValue('billingAccountRef')}/>
                                                                        <Button
                                                                            icon={<PlusOutlined style={{ fontSize: '12px' }} />}
                                                                            onClick={addBillingAccount}
                                                                            style={{
                                                                                width: '24px',
                                                                                height: '24px',
                                                                                background: '#005B9E1A',
                                                                                border: '1px solid #14579433',
                                                                                opacity: 1
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </Form.Item>
                                                                {billingAccounts.slice(1).map((item) => (
                                                                    <Form.Item
                                                                        key={`billingAccountRef-${item.id}`}
                                                                        label=" "
                                                                        name={`billingAccountRef_${item.id}`}
                                                                        colon={false}
                                                                        style={{ marginTop: -10 }}
                                                                        rules={[
                                                                            {
                                                                                max: 24,
                                                                                message: 'Billing account number cannot exceed 24 characters',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center',  marginTop: -10  }}>
                                                                            <Input maxLength={24} placeholder="Enter Billing Account Number"
                                                                                   value={drawerForm.getFieldValue(`billingAccountRef_${item.id}`)}
                                                                            />
                                                                            <Button
                                                                                icon={<MinusOutlined style={{ fontSize: '12px' }} />}
                                                                                onClick={() => removeBillingAccount(item.id)}
                                                                                style={{
                                                                                    width: '24px',
                                                                                    height: '24px',
                                                                                    background: '#005B9E1A',
                                                                                    border: '1px solid #14579433',
                                                                                    opacity: 1
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </Form.Item>
                                                                ))}
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Billing"
                                                                    name="billing"
                                                                    colon={false}
                                                                >
                                                                    <Select
                                                                        placeholder="Select Billing"
                                                                        options={billingOptions}
                                                                        allowClear
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Cycle Date"
                                                                    name="cycleDate"
                                                                    colon={false}
                                                                    dependencies={['billing']}
                                                                    rules={[
                                                                        ({ getFieldValue }) => ({
                                                                            required: getFieldValue('billing') === 3,
                                                                            message: 'Cycle Date is required',
                                                                        }),
                                                                        {
                                                                            validator: (_rule, value) => {
                                                                                if (!value) return Promise.resolve();
                                                                                const n = Number(value);
                                                                                if (!Number.isInteger(n) || n < 1 || n > 28) {
                                                                                    return Promise.reject(
                                                                                        new Error('Cycle Date must be an integer between 1 and 28')
                                                                                    );
                                                                                }
                                                                                return Promise.resolve();
                                                                            },
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Input maxLength={10} placeholder="Enter Cycle Date (1–28)" value={drawerForm.getFieldValue('cycleDate')}/>
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>

                                                        <Row gutter={16}>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Subscription"
                                                                    name="subscription"
                                                                    colon={false}
                                                                    rules={[{ required: true, message: 'Subscription is required' }]}
                                                                >
                                                                    <Select
                                                                        placeholder="Select Subscription"
                                                                        options={subscriptionOptions}
                                                                        allowClear
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                    </>
                                                )}

                                                {drawerData.operation === OperationActionsEnum.EDIT && drawerData.drawerTitle === "Edit Subscriber Profile" && (
                                                    <>
                                                        <Row gutter={16}>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Username"
                                                                    name="userName"
                                                                    colon={false}
                                                                    rules={[{ required: true, message: 'Username is required' }]}
                                                                >
                                                                    <Input maxLength={50} placeholder="Enter Username" disabled={true}/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Status"
                                                                    name="status"
                                                                    colon={false}
                                                                    rules={[{ required: true, message: 'Status is required' }]}
                                                                >
                                                                    <Select
                                                                        placeholder="Select Status"
                                                                        options={statusListInUpdate}
                                                                        allowClear
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Group ID"
                                                                    name="groupId"
                                                                    colon={false}
                                                                >
                                                                    <Input maxLength={20} placeholder="Enter Group ID"/>
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>

                                                        <Row gutter={16}>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Bandwidth"
                                                                    name="bandwidth"
                                                                    colon={false}
                                                                >
                                                                    <Input maxLength={50} placeholder="Enter Bandwidth"/>
                                                                </Form.Item>
                                                            </Col>
                                                            {/*<Col span={8}>*/}
                                                            {/*    <Form.Item*/}
                                                            {/*        label="Contact Name"*/}
                                                            {/*        name="contactName"*/}
                                                            {/*        colon={false}*/}
                                                            {/*        rules={[*/}
                                                            {/*            {*/}
                                                            {/*                validator: (_, value) => {*/}
                                                            {/*                    if (!value || value.trim() === "") {*/}
                                                            {/*                        return Promise.resolve();*/}
                                                            {/*                    }*/}
                                                            {/*                    if (/[a-zA-Z]/.test(value)) {*/}
                                                            {/*                        return Promise.resolve();*/}
                                                            {/*                    }*/}
                                                            {/*                    return Promise.reject(new Error("Contact Name must contain letters"));*/}
                                                            {/*                }*/}
                                                            {/*            }*/}
                                                            {/*        ]}*/}
                                                            {/*    >*/}
                                                            {/*        <Input maxLength={50} placeholder="Enter Contact Name"/>*/}
                                                            {/*    </Form.Item>*/}
                                                            {/*</Col>*/}
                                                            {/*<Col span={8}>*/}
                                                            {/*    <Form.Item label="Contact Email" colon={false}>*/}
                                                            {/*        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>*/}
                                                            {/*            <Form.Item*/}
                                                            {/*                name="contactEmail"*/}
                                                            {/*                rules={[*/}
                                                            {/*                    { validator: validateEmail },*/}
                                                            {/*                ]}*/}
                                                            {/*                noStyle*/}
                                                            {/*                style={{ flex: 1 }}*/}
                                                            {/*            >*/}
                                                            {/*                <Input*/}
                                                            {/*                    maxLength={50}*/}
                                                            {/*                    placeholder="Enter Contact Email"*/}
                                                            {/*                    style={{ width: '100%' }}*/}
                                                            {/*                />*/}
                                                            {/*            </Form.Item>*/}

                                                            {/*            <Button*/}
                                                            {/*                onClick={addContactEmail}*/}
                                                            {/*                icon={<PlusOutlined style={{ fontSize: 12, color: '#145794' }} />}*/}
                                                            {/*                style={{*/}
                                                            {/*                    marginLeft: 8,*/}
                                                            {/*                    width: 24,*/}
                                                            {/*                    height: 24,*/}
                                                            {/*                    background: '#005B9E1A',*/}
                                                            {/*                    border: '1px solid #14579433',*/}
                                                            {/*                    opacity: 1*/}
                                                            {/*                }}*/}
                                                            {/*            />*/}
                                                            {/*        </div>*/}
                                                            {/*    </Form.Item>*/}
                                                            {/*    {contactEmails.slice(1).map((item) => (*/}
                                                            {/*        <Form.Item*/}
                                                            {/*            key={`contactEmail-${item.id}`}*/}
                                                            {/*            label=" "*/}
                                                            {/*            name={`contactEmail_${item.id}`}*/}
                                                            {/*            colon={false}*/}
                                                            {/*            style={{ marginTop: -10 }}*/}
                                                            {/*            rules={[*/}
                                                            {/*                { validator: validateEmail },*/}
                                                            {/*            ]}*/}
                                                            {/*        >*/}
                                                            {/*            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>*/}
                                                            {/*                <Form.Item name={`contactEmail_${item.id}`} noStyle style={{ flex: 1 }}>*/}
                                                            {/*                    <Input*/}
                                                            {/*                        maxLength={50}*/}
                                                            {/*                        placeholder="Enter Contact Email"*/}
                                                            {/*                        style={{ width: '100%' }}*/}
                                                            {/*                    />*/}
                                                            {/*                </Form.Item>*/}
                                                            {/*                <Button*/}
                                                            {/*                    onClick={() => removeContactEmail(item.id)}*/}
                                                            {/*                    icon={<MinusOutlined style={{ fontSize: 12, color: '#145794' }} />}*/}
                                                            {/*                    style={{*/}
                                                            {/*                        marginLeft: 8,*/}
                                                            {/*                        width: 24,*/}
                                                            {/*                        height: 24,*/}
                                                            {/*                        background: '#005B9E1A',*/}
                                                            {/*                        border: '1px solid #14579433',*/}
                                                            {/*                        opacity: 1*/}
                                                            {/*                    }}*/}
                                                            {/*                />*/}
                                                            {/*            </div>*/}
                                                            {/*        </Form.Item>*/}
                                                            {/*    ))}*/}
                                                            {/*</Col>*/}

                                                            <Col span={8}>
                                                                <Form.Item label={<span>Billing Account<br />Number</span>} colon={false}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                                        <Form.Item
                                                                            name="billingAccountRef"
                                                                            noStyle
                                                                            style={{ flex: 1 }}
                                                                            rules={[
                                                                                {
                                                                                    max: 24,
                                                                                    message: 'Billing account number cannot exceed 24 characters',
                                                                                },
                                                                            ]}
                                                                        >
                                                                            <Input
                                                                                maxLength={24}
                                                                                placeholder="Enter Billing Account Number"
                                                                                style={{ width: '100%' }}
                                                                            />
                                                                        </Form.Item>

                                                                        <Button
                                                                            onClick={addBillingAccount}
                                                                            icon={<PlusOutlined style={{ fontSize: 12, color: '#145794' }} />}
                                                                            style={{
                                                                                marginLeft: 8,
                                                                                width: 24,
                                                                                height: 24,
                                                                                background: '#005B9E1A',
                                                                                border: '1px solid #14579433',
                                                                                opacity: 1
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </Form.Item>
                                                                {billingAccounts.slice(1).map((item) => (
                                                                    <Form.Item
                                                                        key={`billingAccountRef-${item.id}`}
                                                                        label=" "
                                                                        name={`billingAccountRef_${item.id}`}
                                                                        colon={false}
                                                                        style={{ marginTop: -10 }}
                                                                        rules={[
                                                                            {
                                                                                max: 24,
                                                                                message: 'Billing account number cannot exceed 24 characters',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                                            <Form.Item name={`billingAccountRef_${item.id}`} noStyle style={{ flex: 1 }}>
                                                                                <Input
                                                                                    maxLength={24}
                                                                                    placeholder="Enter Billing Account Number"
                                                                                    style={{ width: '100%' }}
                                                                                />
                                                                            </Form.Item>
                                                                            <Button
                                                                                onClick={() => removeBillingAccount(item.id)}
                                                                                icon={<MinusOutlined style={{ fontSize: 12, color: '#145794' }} />}
                                                                                style={{
                                                                                    marginLeft: 8,
                                                                                    width: 24,
                                                                                    height: 24,
                                                                                    background: '#005B9E1A',
                                                                                    border: '1px solid #14579433',
                                                                                    opacity: 1
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </Form.Item>
                                                                ))}
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Billing"
                                                                    name="billing"
                                                                    colon={false}
                                                                >
                                                                    <Select
                                                                        placeholder="Select Billing"
                                                                        options={billingOptions}
                                                                        allowClear
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>

                                                        {/*<Row gutter={16}>*/}
                                                            {/*<Col span={8}>*/}
                                                            {/*    <Form.Item label={<span>Contact<br />Number</span>} colon={false}>*/}
                                                            {/*        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>*/}
                                                            {/*            <Form.Item name="contactNumber" noStyle style={{ flex: 1 }}>*/}
                                                            {/*                <Input*/}
                                                            {/*                    maxLength={24}*/}
                                                            {/*                    placeholder="Enter Contact Number"*/}
                                                            {/*                    style={{ width: '100%' }}*/}
                                                            {/*                />*/}
                                                            {/*            </Form.Item>*/}

                                                            {/*            <Button*/}
                                                            {/*                onClick={addContactNumber}*/}
                                                            {/*                icon={<PlusOutlined style={{ fontSize: 12, color: '#145794' }} />}*/}
                                                            {/*                style={{*/}
                                                            {/*                    marginLeft: 8,*/}
                                                            {/*                    width: 24,*/}
                                                            {/*                    height: 24,*/}
                                                            {/*                    background: '#005B9E1A',*/}
                                                            {/*                    border: '1px solid #14579433',*/}
                                                            {/*                    opacity: 1*/}
                                                            {/*                }}*/}
                                                            {/*            />*/}
                                                            {/*        </div>*/}
                                                            {/*    </Form.Item>*/}
                                                            {/*    {contactNumbers.slice(1).map((item) => (*/}
                                                            {/*        <Form.Item*/}
                                                            {/*            key={`contactNumber-${item.id}`}*/}
                                                            {/*            label=" "*/}
                                                            {/*            name={`contactNumber_${item.id}`}*/}
                                                            {/*            colon={false}*/}
                                                            {/*            style={{ marginTop: -10 }}*/}
                                                            {/*        >*/}
                                                            {/*            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>*/}
                                                            {/*                <Form.Item name={`contactNumber_${item.id}`} noStyle style={{ flex: 1 }}>*/}
                                                            {/*                    <Input*/}
                                                            {/*                        maxLength={24}*/}
                                                            {/*                        placeholder="Enter Contact Number"*/}
                                                            {/*                        style={{ width: '100%' }}*/}
                                                            {/*                    />*/}
                                                            {/*                </Form.Item>*/}
                                                            {/*                <Button*/}
                                                            {/*                    onClick={() => removeContactNumber(item.id)}*/}
                                                            {/*                    icon={<MinusOutlined style={{ fontSize: 12, color: '#145794' }} />}*/}
                                                            {/*                    style={{*/}
                                                            {/*                        marginLeft: 8,*/}
                                                            {/*                        width: 24,*/}
                                                            {/*                        height: 24,*/}
                                                            {/*                        background: '#005B9E1A',*/}
                                                            {/*                        border: '1px solid #14579433',*/}
                                                            {/*                        opacity: 1*/}
                                                            {/*                    }}*/}
                                                            {/*                />*/}
                                                            {/*            </div>*/}
                                                            {/*        </Form.Item>*/}
                                                            {/*    ))}*/}
                                                            {/*</Col>*/}
                                                        {/*</Row>*/}

                                                        <Row gutter={16}>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Cycle Date"
                                                                    name="cycleDate"
                                                                    colon={false}
                                                                    dependencies={['billing']}
                                                                    rules={[
                                                                        ({ getFieldValue }) => ({
                                                                            required: getFieldValue('billing') === 3,
                                                                            message: 'Cycle Date is required',
                                                                        }),
                                                                        {
                                                                            validator: (_rule, value) => {
                                                                                if (!value) return Promise.resolve();
                                                                                const n = Number(value);
                                                                                if (!Number.isInteger(n) || n < 1 || n > 28) {
                                                                                    return Promise.reject(
                                                                                        new Error('Cycle Date must be an integer between 1 and 28')
                                                                                    );
                                                                                }
                                                                                return Promise.resolve();
                                                                            },
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Input maxLength={10} placeholder="Enter Cycle Date (1–28)" value={drawerForm.getFieldValue('cycleDate')}/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Subscription"
                                                                    name="subscription"
                                                                    colon={false}
                                                                    rules={[{ required: true, message: 'Subscription is required' }]}
                                                                >
                                                                    <Select
                                                                        placeholder="Select Subscription"
                                                                        options={subscriptionOptions}
                                                                        allowClear
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                    </>
                                                )}

                                                {/* Divider between sections */}
                                                <div style={{ borderTop: "1px solid #f0f0f0", margin: "0 0 25px 0" }} />

                                                <Row gutter={16}>
                                                    <Col span={8}>
                                                        <Form.Item
                                                            label="Concurrency"
                                                            name="concurrency"
                                                            colon={false}
                                                            rules={[{ required: true, message: 'Concurrency is required' }]}

                                                        >
                                                            <Input maxLength={50} placeholder="Enter Concurrency"/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Form.Item noStyle dependencies={['timeout', 'sessionTimeout', 'customTimeout']}>
                                                        {({ getFieldValue, setFieldsValue }) => {
                                                            const timeout = getFieldValue('timeout');
                                                            const sessionVal = getFieldValue('sessionTimeout');
                                                            const customVal = getFieldValue('customTimeout');

                                                            if (!timeout && (sessionVal || customVal)) {
                                                                setTimeout(() => {
                                                                    setFieldsValue({ timeout: sessionVal ? 'Session Timeout' : 'Custom Timeout' });
                                                                }, 0);
                                                            }

                                                            return (
                                                                <Col span={8}>
                                                                    <Form.Item
                                                                        label="Timeout"
                                                                        name="timeout"
                                                                        colon={false}
                                                                    >
                                                                        <Select
                                                                            placeholder="Select Timeout"
                                                                            options={timeOptions}
                                                                            allowClear
                                                                        />
                                                                    </Form.Item>
                                                                </Col>
                                                            );
                                                        }}
                                                    </Form.Item>

                                                    <Col span={8}>
                                                        <Form.Item
                                                            label="Idle Timeout"
                                                            name="idleTimeout"
                                                            colon={false}
                                                            rules={[
                                                                {
                                                                    pattern: /^\d+$/,
                                                                    message: 'Idle Timeout must be an integer',
                                                                },
                                                                {
                                                                    max: 12,
                                                                    message: 'Idle Timeout cannot exceed 12 digits',
                                                                },
                                                            ]}
                                                        >
                                                            <Input maxLength={12} placeholder="Enter Idle Timeout"/>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Row gutter={16}>
                                                    <Col span={8}>
                                                        <Form.Item noStyle dependencies={['timeout']}>
                                                            {({ getFieldValue }) =>
                                                                getFieldValue('timeout') === 'Session Timeout' ? (
                                                                    <Form.Item
                                                                        label="Session Timeout"
                                                                        name="sessionTimeout"
                                                                        colon={false}
                                                                        rules={[
                                                                            {
                                                                                pattern: /^\d+$/,
                                                                                message: 'Session Timeout must be an integer',
                                                                            },
                                                                            {
                                                                                max: 12,
                                                                                message: 'Session Timeout cannot exceed 12 digits',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <Input maxLength={12} placeholder="Enter Session Timeout" />
                                                                    </Form.Item>
                                                                ) : null
                                                            }
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Row gutter={16}>
                                                    <Col span={8}>
                                                        <Form.Item noStyle dependencies={['timeout']}>
                                                            {({ getFieldValue }) =>
                                                                getFieldValue('timeout') === 'Custom Timeout' ? (
                                                                    <Form.Item
                                                                        label="Custom Timeout"
                                                                        name="customTimeout"
                                                                        colon={false}
                                                                    >
                                                                        <TimePicker
                                                                            style={{ width: "100%" }}
                                                                            placeholder="Select Custom Timeout"
                                                                            format="HH:mm:ss"
                                                                            allowClear
                                                                        />
                                                                    </Form.Item>
                                                                ) : null
                                                            }
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                {/* Divider between sections */}
                                                <div style={{ borderTop: "1px solid #f0f0f0", margin: "0 0 25px 0" }} />

                                                <Row gutter={16}>
                                                    <Col span={8}>
                                                        <Form.Item
                                                            label="NAS Port Type"
                                                            name="nasPortType"
                                                            colon={false}
                                                            rules={[{ required: true, message: 'NAS Port Type is required' }]}
                                                        >
                                                            <Select
                                                                placeholder="Select NAS Port Type"
                                                                options={nasPortOptions}
                                                                allowClear
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Form.Item
                                                            label="VLAN ID"
                                                            name="vlanId"
                                                            colon={false}
                                                            rules={[
                                                                {
                                                                    pattern: /^\d+$/,
                                                                    message: 'VLAN ID must be an integer',
                                                                },
                                                                {
                                                                    max: 12,
                                                                    message: 'VLAN ID cannot exceed 12 digits',
                                                                },
                                                            ]}
                                                        >
                                                            <Input maxLength={12} placeholder="Enter VLAN ID"/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Form.Item
                                                            label="Circuit ID"
                                                            name="circuitId"
                                                            colon={false}
                                                            rules={[
                                                                {
                                                                    max: 24,
                                                                    message: 'Circuit ID cannot exceed 24 characters',
                                                                },
                                                            ]}
                                                        >
                                                            <Input maxLength={24} placeholder="Enter Circuit ID"/>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Row gutter={16}>
                                                    <Col span={8}>
                                                        <Form.Item
                                                            label="Remote ID"
                                                            name="remoteId"
                                                            colon={false}
                                                            rules={[
                                                                {
                                                                    max: 24,
                                                                    message: 'Remote ID cannot exceed 24 digits',
                                                                },
                                                            ]}
                                                        >
                                                            <Input maxLength={24} placeholder="Enter Remote ID"/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Form.Item label="MAC Address" colon={false}>
                                                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                                <Form.Item
                                                                    name="macAddress"
                                                                    noStyle
                                                                    style={{ flex: 1 }}
                                                                    dependencies={['nasPortType']}
                                                                    rules={[
                                                                        ({ getFieldValue }) => ({
                                                                            required: getFieldValue('nasPortType') === 'IPoE',
                                                                            message: 'MAC Address is required',
                                                                        }),
                                                                        {
                                                                            validator: (_, value) => {
                                                                                if (!value) return Promise.resolve();

                                                                                const macWithSeparator = /^([0-9A-Fa-f]{2})([:-])(?:[0-9A-Fa-f]{2}\2){4}[0-9A-Fa-f]{2}$/;
                                                                                const macPlain = /^[0-9A-Fa-f]{12}$/;
                                                                                const macDot = /^([0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}$/;

                                                                                return macWithSeparator.test(value) || macPlain.test(value) || macDot.test(value)
                                                                                    ? Promise.resolve()
                                                                                    : Promise.reject(new Error('Invalid MAC address format'));
                                                                            },
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Input
                                                                        maxLength={50}
                                                                        placeholder="Enter MAC Address"
                                                                        style={{ width: '100%' }}
                                                                    />
                                                                </Form.Item>

                                                                <Button
                                                                    onClick={addMacAddress}
                                                                    icon={<PlusOutlined style={{ fontSize: 12, color: '#145794' }} />}
                                                                    style={{
                                                                        marginLeft: 8,
                                                                        width: 24,
                                                                        height: 24,
                                                                        background: '#005B9E1A',
                                                                        border: '1px solid #14579433',
                                                                        opacity: 1
                                                                    }}
                                                                />
                                                            </div>
                                                        </Form.Item>
                                                        {macAddresses.slice(1).map((mac) => (
                                                            <Form.Item
                                                                key={`macAddress-${mac.id}`}
                                                                label=" "
                                                                name={`macAddress_${mac.id}`}
                                                                colon={false}
                                                                rules={[
                                                                    {
                                                                        validator: (_, value) => {
                                                                            if (!value) return Promise.resolve();

                                                                            const macWithSeparator = /^([0-9A-Fa-f]{2})([:-])(?:[0-9A-Fa-f]{2}\2){4}[0-9A-Fa-f]{2}$/;
                                                                            const macPlain = /^[0-9A-Fa-f]{12}$/;
                                                                            const macDot = /^([0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}$/;

                                                                            return macWithSeparator.test(value) || macPlain.test(value) || macDot.test(value)
                                                                                ? Promise.resolve()
                                                                                : Promise.reject(new Error('Invalid MAC address format'));
                                                                        },
                                                                    },
                                                                ]}
                                                                style={{ marginTop: -10 }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                                    <Form.Item name={`macAddress_${mac.id}`} noStyle style={{ flex: 1 }}>
                                                                        <Input
                                                                            maxLength={50}
                                                                            placeholder="Enter MAC Address"
                                                                            style={{ width: '100%' }}
                                                                        />
                                                                    </Form.Item>
                                                                    <Button
                                                                        onClick={() => removeMacAddress(mac.id)}
                                                                        icon={<MinusOutlined style={{ fontSize: 12, color: '#145794' }} />}
                                                                        style={{
                                                                            marginLeft: 8,
                                                                            width: 24,
                                                                            height: 24,
                                                                            background: '#005B9E1A',
                                                                            border: '1px solid #14579433',
                                                                            opacity: 1
                                                                        }}
                                                                    />
                                                                </div>
                                                            </Form.Item>
                                                        ))}
                                                    </Col>

                                                    <Col span={8}>
                                                        <Form.Item
                                                            label="IP Allocation"
                                                            name="ipAllocation"
                                                            colon={false}
                                                            dependencies={['nasPortType']}
                                                            rules={[
                                                                ({ getFieldValue }) => ({
                                                                    required: getFieldValue('nasPortType') === 'IPoE',
                                                                    message: 'IP Allocation is required',
                                                                })
                                                            ]}
                                                        >
                                                            <Select
                                                                placeholder="Select IP Allocation"
                                                                options={ipAllocationOptions}
                                                                allowClear
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Row gutter={16}>
                                                    <Col span={8}>
                                                        <Form.Item noStyle dependencies={['ipAllocation']}>
                                                            {({ getFieldValue }) =>
                                                                getFieldValue('ipAllocation') === 'Dynamic' ? (
                                                                    <Form.Item
                                                                        label="IP Pool Name"
                                                                        name="ipPoolName"
                                                                        colon={false}
                                                                        rules={[{ required: true, message: 'IP Pool Name is required' }]}
                                                                    >
                                                                        <Input maxLength={50} placeholder="Enter Pool Name"/>
                                                                    </Form.Item>
                                                                ) : null
                                                            }
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Row gutter={16}>
                                                    <Col span={8}>
                                                        <Form.Item noStyle dependencies={['ipAllocation']}>
                                                            {({ getFieldValue }) =>
                                                                getFieldValue('ipAllocation') === 'Static' ? (
                                                                    <Form.Item
                                                                        label="IPV 4"
                                                                        name="ipv4"
                                                                        colon={false}
                                                                        rules={[
                                                                            { required: true, message: 'IPV 4 is required' },
                                                                            {
                                                                                max: 15,
                                                                                message: 'IPV 4 cannot exceed 15 characters',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <Input maxLength={15} placeholder="Enter IPV 4"/>
                                                                    </Form.Item>
                                                                ) : null
                                                            }
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Form.Item noStyle dependencies={['ipAllocation']}>
                                                            {({ getFieldValue }) =>
                                                                getFieldValue('ipAllocation') === 'Static' ? (
                                                                    <Form.Item
                                                                        label="IPV 6"
                                                                        name="ipv6"
                                                                        colon={false}
                                                                        rules={[
                                                                            { required: true, message: 'IPV 6 is required' },
                                                                            {
                                                                                max: 40,
                                                                                message: 'IPV 6 cannot exceed 40 characters',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <Input maxLength={40} placeholder="Enter IPV 6"/>
                                                                    </Form.Item>
                                                                ) : null
                                                            }
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                {/* Divider between sections */}
                                                <div style={{ borderTop: "1px solid #f0f0f0", margin: "0 0 25px 0" }} />

                                                <Row gutter={16}>
                                                    <Col span={8}>
                                                        <Form.Item
                                                            label={<span>Notification<br />Template</span>}
                                                            name="templateId"
                                                            colon={false}
                                                        >
                                                            <Select
                                                                placeholder="Select Notification Template"
                                                                options={templateOptions}
                                                                allowClear
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </>
                                        )}
                                    </>
                                }

                                {
                                    drawerData.operation === OperationActionsEnum.EDIT && drawerData.drawerTitle === "Edit Password" &&
                                    <>
                                        <Form.Item
                                            label="New Password"
                                            name="password"
                                            colon={false}
                                        >
                                            <Input.Password maxLength={50} placeholder="Enter New Password"/>
                                        </Form.Item>

                                        <Form.Item
                                            label="Re-enter Password"
                                            name="reEnterPassword"
                                            colon={false}
                                            rules={[
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (!value || getFieldValue('password') === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(new Error('Passwords do not match'));
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input.Password maxLength={50} placeholder="Re-enter Password"/>
                                        </Form.Item>

                                        <Form.Item
                                            label="Encryption Method"
                                            name="encryptionMethod"
                                            colon={false}
                                        >
                                            <Select
                                                placeholder="Encryption Method"
                                                options={encryptionOptions}
                                                allowClear
                                            />
                                        </Form.Item>
                                    </>
                                }

                                {
                                    drawerData.operation === OperationActionsEnum.NEW && drawerData.drawerTitle === "Add New Service" &&
                                    <>
                                        <Form.Item
                                            label="Plan"
                                            name="planId"
                                            colon={false}
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
                                            colon={false}
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
                                            dependencies={['serviceStartDate']}
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
                                            colon={false}
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
                                    drawerData.operation === OperationActionsEnum.EDIT && drawerData.drawerTitle === "Edit Service" &&
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
                                                options={statusListService}
                                            />
                                        </Form.Item>

                                    </>
                                }
                            </Form>
                        </div>
                        <div className="drawer-btn-section">
                            {
                                (drawerData.operation === OperationActionsEnum.NEW && drawerData.drawerTitle === "Add New Subscriber Profile") &&
                                <Button type="primary" onClick={() => createUpdateSubscriber(OperationActionsEnum.NEW)}>
                                    Add
                                </Button>
                            }
                            {
                                (drawerData.operation === OperationActionsEnum.EDIT && drawerData.drawerTitle === "Edit Subscriber Profile") &&
                                <Button type="primary" onClick={() => createUpdateSubscriber(OperationActionsEnum.EDIT)}>
                                    Update
                                </Button>
                            }
                            {
                                (drawerData.operation === OperationActionsEnum.EDIT && drawerData.drawerTitle === "Edit Password") &&
                                <Button type="primary" onClick={() => createUpdateSubscriber(OperationActionsEnum.EDIT)}>
                                    Update
                                </Button>
                            }

                            {
                                (drawerData.operation === OperationActionsEnum.NEW && drawerData.drawerTitle === "Add New Service") &&
                                <Button type="primary" onClick={() => {serviceDrawerSubmit()}}>
                                    Add
                                </Button>
                            }
                            {
                                (drawerData.operation === OperationActionsEnum.EDIT && drawerData.drawerTitle === "Edit Service") &&
                                <Button type="primary" onClick={() => {serviceEditDrawerSubmit()}}>
                                    Update
                                </Button>
                            }
                        </div>
                    </div>
                </Drawer>

                {
                    drawerData.operation === OperationActionsEnum.DELETE &&
                    <>
                        <CommonConfirmModal
                            isOpen={isConfirmOpen}
                            title="Are you sure you want to delete this record?"
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            btnDanger={true}
                            onOk={deleteUserConfirmation}
                            onCancel={cancelUserDeletion}
                        />
                    </>
                }

            </>
        </ActionPermission>
    )
}

export default Subscribers;
