import { FC, useEffect, useRef, useState } from "react";
import ACTION_PERMISSION from "../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonSearchPanel from "../../../components/common-search-panel/CommonSearchPanel.tsx";
import { InputsProps } from "../../../components/common-search-panel/models/InputsProps.model.ts";
import DropdownValue from "../../../model/dropdownValue.ts";
import DynamicTable from "../../../components/dynamic-table/DynamicTable.tsx";
import { Button, Card, Col, Drawer, Form, Input, InputNumber, Row, Select, Table } from "antd";
import CommonSquareButtonPreDefined
    from "../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import { ButtonTypeEnum } from "../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import {
    debounce,
    DrawerState,
    formatBytes,
    toBytes,
    renderStatusTag,
    updateDrawerState, bytesToValueUnit,
    formatDateTime
} from "../../../helpers/helperFunctions.tsx";
import { formatValue } from "../../../helpers/stringValidators.ts";
import OperationActionsEnum from "../../../model/operationsActionsEnum.model.ts";
import { CloseOutlined, EyeOutlined } from "@ant-design/icons";
import CommonTabBar, { CommonTabBarRef } from "../../../components/common-tab-bar/CommonTabBar.tsx";
import QosProfileDrawer from "./qos-profile-drawer/QosProfileDrawer.tsx"
import {
    approvePlan,
    createNewPlan, deleteBucket, deletePlan, editNewPlan, getBucketDetails,
    getBucketsList,
    getPlansInfo,
    getPlansList,
    getProductDetails, getQosDetails, rejectPlan, submitRequestApproval, getApprovalConfigs, getApprovalHistory
} from "../services/product.catalog.service.ts";
import { ApprovalConfigModel } from "../models/approvalConfigs.model.ts";

import { PlansResponseModel } from "../models/plans.model.ts";
import BaseResponse from "../../../model/baseResponse.ts";
import { ProductDetailsResponseModel } from "../models/product.details.model.ts";
import showNotification from "../../../services/notification.service.tsx";
import { DEBOUNCE_TIME_IN_MS } from "../../../constants/validationConditions.ts";
import { PlanCreationModel } from "../models/plan.creation.model.ts";
import { PlanUpdateModel } from "../models/plan.update.model.ts";
import CommonConfirmModal from "../../../components/common-confirm-modal/CommonConfirmModal.tsx";
import { PlansQueryModel } from "../models/planRequest.model.ts";
import BucketDetailsDrawer from "./bucket-details-drawer/BucketDetailsDrawer.tsx";
import { FilterValues } from "../../other/models/message-logs.model.ts";
import {
    reportDownloadRequestProducts
} from "../../other/service/logs.management.service.ts";
import { useAppSelector } from "../../../stores/mainStore.ts";
import ApprovalDrawer from "./approval-drawer/ApprovalDrawer.tsx";
import { useLocation } from "react-router-dom";

type UsersProps = object;

const ProductCatalog: FC<UsersProps> = () => {
    const loggedInUserName = useAppSelector(state => state.auth.decodedToken?.preferred_username);

    const statusList: DropdownValue[] = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Draft', value: 'Draft' }
    ];

    const typeOptions: DropdownValue[] = [
        { label: 'Add ons', value: 'Add ons' },
        { label: 'FUP', value: 'FUP' },
        { label: 'Base Plan', value: 'Base Plan' },
        { label: 'Time based', value: 'Time based' }
    ];

    const connectionTypeOptions: DropdownValue[] = [
        { label: 'Prepaid', value: 'Prepaid' },
        { label: 'Postpaid', value: 'Postpaid' }
    ];

    const recurringOptions: DropdownValue[] = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    const recurringModeOptions: DropdownValue[] = [
        { label: 'Daily', value: 'Daily' },
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Monthly', value: 'Monthly' },
        { label: 'Bill Cycle', value: 'Bill Cycle' }
    ];

    const validityPeriodOptions: DropdownValue[] = [
        { label: 'Minutes', value: 'Minutes' },
        { label: 'Hours', value: 'Hours' },
        { label: 'Days', value: 'Days' },
        { label: 'Months', value: 'Months' },

    ];

    const quotaProratedOptions: DropdownValue[] = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    const unitOptions: DropdownValue[] = [
        { label: 'Byte', value: 'B' },
        { label: 'KB', value: 'KB' },
        { label: 'MB', value: 'MB' },
        { label: 'GB', value: 'GB' },
        { label: 'TB', value: 'TB' }
    ];

    const carryForwardOptions: DropdownValue[] = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    const [activeTab, setActiveTab] = useState("search");
    const [tabDataMap, setTabDataMap] = useState<Record<string, any>>({});
    const [searchForm, setSearchForm] = useState<any>({});

    const [drawerData, setDrawerData] = useState<DrawerState>({
        isDrawerOpen: false,
        operation: OperationActionsEnum.NONE,
        drawerData: null
    });

    const [qosDrawerOpen, setQosDrawerOpen] = useState(false)
    const [bucketDetailsDrawerOpen, setBucketDetailsDrawerOpen] = useState(false);

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
    }>({ currentPage: 1, currentItemPerPage: 50 });

    const [formValues, setFormValues] = useState<Partial<PlansQueryModel>>({
        planId: undefined,
        planName: undefined,
        planType: undefined,
        status: undefined,
        recurringFlag: undefined,
        recurringPeriod: undefined,
        connectionType: undefined,
        quotaProrationFlag: undefined
    });

    const [plansData, setPlansData] = useState<BaseResponse<PlansResponseModel> | null>(null);
    const [productDetails, setProductDetails] = useState<BaseResponse<ProductDetailsResponseModel> | null>(null);
    const [bucketOptions, setBucketOptions] = useState<DropdownValue[]>([]);
    const [planIdList, setPlanIdList] = useState<DropdownValue[]>([]);
    const [planNameList, setPlanNameList] = useState<DropdownValue[]>([]);

    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    const [deletingPlan, setDeletingPlan] = useState<PlansResponseModel | null>(null);

    const [comment, setComment] = useState("");
    const [createdPlanId, setCreatedPlanId] = useState<string | null>(null);
    const [showRequestApprovalButton, setShowRequestApprovalButton] = useState(false);
    const [approvalDrawerOpen, setApprovalDrawerOpen] = useState(false);
    const [approvalConfigs, setApprovalConfigs] = useState<ApprovalConfigModel[]>([]);


    const [drawerForm] = Form.useForm();

    const location = useLocation();

    useEffect(() => {
        const row = location.state?.openRow;
        if (!row) return;

        const id = row?.planInternalId;
        if (!id) return;

        const tabKey = `view-${id}`;

        setTabDataMap(prev => ({
            ...prev,
            [tabKey]: { ...prev[tabKey], ...row }
        }));

        fetchProductDetails(id, tabKey);

        tabBarRef.current?.openTab({
            key: tabKey,
            label: `Plan ID: ${row?.planId ?? "N/A"}`
        });

        setActiveTab(tabKey);
    }, [location.state]);


    useEffect(() => {
        if (drawerData.operation !== OperationActionsEnum.VIEW && drawerData.isDrawerOpen) {
            const drawerBuckets = drawerData.drawerData?.buckets;

            const existingBucketsFromDrawerData =
                Array.isArray(drawerBuckets) && drawerBuckets.length > 0;

            const values = drawerForm.getFieldsValue(true);
            const existingBucketsFromForm =
                Array.isArray(values?.buckets) && values?.buckets?.length > 0;

            if (!existingBucketsFromDrawerData && !existingBucketsFromForm) {
                drawerForm.setFieldsValue({
                    ...values,
                    buckets: [
                        {
                            bucket: undefined,
                            quota: undefined,
                            quotaUnit: 'B',
                            carryForward: undefined,
                            maxCarryForward: undefined,
                            maxCarryForwardUnit: 'B',
                            totalCarryForward: undefined,
                            totalCarryForwardUnit: 'B',
                            consumptionLimit: undefined,
                            consumptionLimitUnit: 'B',
                            consumptionLimitWindow: undefined,
                            consumptionLimitWindowUnit: 'Days',
                            validity: undefined,
                            validityUnit: 'Days'
                        }
                    ]
                });
            }

            fetchBuckets();
        }
    }, [drawerData.operation, drawerData.isDrawerOpen, drawerData.drawerData, drawerForm]);


    const searchPanelInputs: InputsProps[] = [
        {
            type: "DROPDOWN",
            valueName: "planId",
            label: "Plan ID",
            required: false,
            mainInput: true,
            placeholder: "Select Plan ID",
            values: planIdList
        },
        {
            type: "INPUT",
            valueName: "planName",
            label: "Plan Name",
            required: false,
            mainInput: true,
            placeholder: "Enter Plan Name",
            maxLength: 100
        },
        {
            type: "DROPDOWN",
            valueName: "planType",
            label: "Plan Type",
            required: false,
            mainInput: true,
            placeholder: "Select Plan Type",
            values: typeOptions
        },
        {
            type: "DROPDOWN",
            valueName: "status",
            label: "Status",
            required: false,
            mainInput: true,
            placeholder: "Select Status",
            values: statusList
        },
        {
            type: "DROPDOWN",
            valueName: "recurringFlag",
            label: "Recurring",
            required: false,
            mainInput: false,
            placeholder: "Select Recurring",
            values: recurringOptions
        },
        {
            type: "DROPDOWN",
            valueName: "recurringPeriod",
            label: "Recurring Mode",
            required: false,
            mainInput: false,
            placeholder: "Select Recurring Mode",
            values: recurringModeOptions
        },
        {
            type: "DROPDOWN",
            valueName: "connectionType",
            label: "Connection Type",
            required: false,
            mainInput: false,
            placeholder: "Select Connection Type",
            values: connectionTypeOptions
        },
        {
            type: "DROPDOWN",
            valueName: "quotaProrationFlag",
            label: "Quota Prorated",
            required: false,
            mainInput: false,
            placeholder: "Select Quota Prorated",
            values: quotaProratedOptions
        },
    ];

    const columns = [
        { title: 'Plan ID', dataIndex: 'planId', key: 'planId', render: formatValue },
        { title: 'Plan Name', dataIndex: 'planName', key: 'planName', render: formatValue },
        { title: 'Status', dataIndex: 'status', key: 'status', width: 300, align: 'center', render: renderStatusTag },
        { title: 'Created Date', dataIndex: 'createdAt', key: 'createdAt', render: (v: any) => formatDateTime(v) ?? formatValue(v) },
        { title: 'Last Updated Date', dataIndex: 'updatedAt', key: 'updatedAt', render: (v: any) => formatDateTime(v) ?? formatValue(v) },
        {
            title: "Action",
            key: "action",
            align: "center",
            width: 140,
            render: (_: any, record: any) => (
                <div>
                    <ActionPermission action={ACTION_PERMISSION.VIEW_PLAN}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.VIEW}
                            onClick={() => openViewMoreTab(record)}
                        />
                    </ActionPermission>
                    <ActionPermission action={ACTION_PERMISSION.UPDATE_PLAN}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.EDIT}
                            onClick={() => openEditDrawer(record, "Edit New Plan")}
                        />
                    </ActionPermission>
                    <ActionPermission action={ACTION_PERMISSION.DELETE_PRODUCT_CATALOG}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.DELETE}
                            onClick={() => handleDeleteClick(record)}
                        />
                    </ActionPermission>
                </div>
            )
        }
    ];

    type BucketInfo = {
        quota: string;
        maxCarryForwardUnit: string;
        qosProfile: string;
        priority: string;
        expiryRule: string;
        validity: string;
        maxRollover: string;
    };

    type ProductRow = {
        key: number;
        planId: string;
        planName: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        recurring: string;
        chargingCycle: string;
        buckets: BucketInfo[];
        [key: string]: string | number | BucketInfo[];
    };

    const [selectedBucket, setSelectedBucket] = useState(null);

    const openQosDrawer = (bucketData = null) => {
        setSelectedBucket(bucketData);
        setQosDrawerOpen(true);
    };

    const closeQosDrawer = () => {
        setQosDrawerOpen(false);
    };
    const closeBucketDrawer = () => {
        setBucketDetailsDrawerOpen(false);
    };

    const openCreateDrawer = () => {
        drawerForm.resetFields();
        updateDrawerState(setDrawerData, {
            isDrawerOpen: true,
            operation: OperationActionsEnum.NEW,
            drawerData: null
        });
    }

    const buildInitialFormValues = (
        row: Partial<ProductRow & { buckets?: any[] }>
    ): Record<string, any> => {
        const formValues: Record<string, any> = { ...row };

        formValues.planId ??= "";

        const buckets =
            row?.buckets ??
            ((row as any)?.bucketList ?? []);

        formValues.buckets = Array.isArray(buckets) ? buckets : [];

        if (typeof (row as any)?.recurringFlag === "boolean") {
            formValues.recurring = (row as any).recurringFlag ? "Yes" : "No";
        }

        formValues.recurringMode = (row as any)?.recurringPeriod ?? undefined;

        if (typeof (row as any)?.quotaProrationFlag === "boolean") {
            formValues.quotaProrated = (row as any).quotaProrationFlag ? "Yes" : "No";
        }

        return formValues;
    };

    const resolvePlanId = (row: any): string | undefined =>
        row?.planInternalId;

    const mapBucketsFromApi = (bucketList?: any[]) => {
        if (!Array.isArray(bucketList)) return [];

        const toNumberIfExists = (v?: string | number) => {
            if (v == null || v === '') return undefined;
            const n = Number(v);
            return Number.isFinite(n) ? n : undefined;
        };

        return bucketList.map((b) => {
            const initial = bytesToValueUnit(b.initialQuota);
            const maxCf = bytesToValueUnit(b.maxCarryForward);
            const totalCf = bytesToValueUnit(b.totalCarryForward);
            const consumption = bytesToValueUnit(b.consumptionLimit);

            const quotaString =
                initial.value ?? (b.initialQuota != null ? String(b.initialQuota) : '');

            const carryForwardValue: string | undefined =
                typeof b.carryForward === 'boolean' ? (b.carryForward ? 'Yes' : 'No') : undefined;

            return {
                bucket: b.bucketId ?? undefined,
                planToBucketId: b.planToBucketId ?? b.id ?? undefined,
                quota: quotaString,
                initialQuota: quotaString,
                quotaUnit: initial.unit ?? 'B',
                carryForward: carryForwardValue,
                isUnlimited: typeof b.isUnlimited === 'boolean' ? (b.isUnlimited ? 'Yes' : 'No') : undefined,
                maxCarryForward: toNumberIfExists(maxCf.value),
                maxCarryForwardUnit: maxCf.unit ?? 'B',
                totalCarryForward: toNumberIfExists(totalCf.value),
                totalCarryForwardUnit: totalCf.unit ?? 'B',
                consumptionLimit: toNumberIfExists(consumption.value),
                consumptionLimitUnit: consumption.unit ?? 'B',
                consumptionLimitWindow: b.consumptionLimitWindow != null
                    ? String(b.consumptionLimitWindow)
                    : '',
                consumptionLimitWindowUnit: 'Days',
                validity: b.carryForwardValidity != null
                    ? String(b.carryForwardValidity)
                    : '',
                validityUnit: 'Days'
            };
        });
    };

    const mapProductDetailsToForm = (data: any, fallbackId: string) => {

        const recurringValue: string | undefined =
            typeof data.recurringFlag === 'boolean' ? (data.recurringFlag ? 'Yes' : 'No') : undefined;

        const quotaProratedValue: string | undefined =
            typeof data.quotaProrationFlag === 'boolean' ? (data.quotaProrationFlag ? 'Yes' : 'No') : undefined;

        return {
            planName: data.planName ?? '',
            planType: data.planType ?? undefined,
            connectionType: data.connectionType ?? undefined,
            status: data.status ?? undefined,
            recurring: recurringValue,
            recurringMode: data.recurringPeriod ?? undefined,
            quotaProrated: quotaProratedValue,
            validityPeriod: data.validityPeriod ?? undefined,
            validityType: data.validityType ?? 'Minutes',
            planInternalId: data.planInternalId ?? fallbackId,
            buckets: mapBucketsFromApi(data.bucketList)
        };
    };

    const openEditDrawer = async (
        row: Partial<ProductRow & { buckets?: any[] }>,
        title?: string
    ) => {
        const formValues = buildInitialFormValues(row);

        updateDrawerState(setDrawerData, {
            isDrawerOpen: true,
            operation: OperationActionsEnum.EDIT,
            drawerData: formValues,
            drawerTitle: title ?? "Edit"
        });

        drawerForm.setFieldsValue(formValues);

        const id = resolvePlanId(row);
        if (!id) return;

        try {
            const response = await getProductDetails(id);
            if (!response?.data) return;

            const mapped = mapProductDetailsToForm(response.data, id);

            updateDrawerState(setDrawerData, { drawerData: mapped });

            setTimeout(() => {
                drawerForm.setFieldsValue(mapped);
            }, 0);

        } catch (err) {
            showNotification("ERROR", "Unable to fetch plan details");
            console.error("fetchProductDetails error:", err);
        }
    };

    const closeDrawer = () => {
        setDrawerData({
            isDrawerOpen: false,
            operation: OperationActionsEnum.NONE,
            drawerData: null
        })
        drawerForm.resetFields();
        setCreatedPlanId(null);
        setShowRequestApprovalButton(false);
    }

    const columnsViewMore = [
        {
            title: 'Field',
            dataIndex: 'field',
            key: 'field',
            width: 187,
            onCell: () => ({
                style: {
                    width: 187,
                    backgroundColor: '#fafafa',
                    fontWeight: '500',
                }
            })
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value'
        }
    ];

    const currentProduct = (
        tabDataMap[activeTab]?.productDetails?.data ??
        productDetails?.data ??
        tabDataMap[activeTab] ??
        null
    );

    let recurringValue: string;
    if (currentProduct?.recurringFlag === true) {
        recurringValue = "Yes";
    } else if (currentProduct?.recurringFlag === false) {
        recurringValue = "No";
    } else {
        recurringValue = "N/A";
    }

    let quotaProratedValue: string;
    if (currentProduct?.quotaProrationFlag === true) {
        quotaProratedValue = "Yes";
    } else if (currentProduct?.quotaProrationFlag === false) {
        quotaProratedValue = "No";
    } else {
        quotaProratedValue = "N/A";
    }
    const descriptionData = [
        { field: "Plan ID", value: currentProduct?.planId ?? "N/A" },
        { field: "Plan Name", value: currentProduct?.planName ?? "N/A" },
        { field: "Plan Type", value: currentProduct?.planType ?? "N/A" },
        { field: "Connection Type", value: currentProduct?.connectionType ?? "N/A" },
        { field: "Status", value: currentProduct?.status ?? "N/A" },
        { field: "Recurring", value: recurringValue },
        ...(recurringValue === "Yes"
            ? [{ field: "Recurring Mode", value: currentProduct?.recurringPeriod ?? "N/A" }]
            : []),
        { field: "Quota Prorated", value: quotaProratedValue },
        ...(recurringValue === "No"
            ? [{
                field: "Validity Period",
                value: (currentProduct?.validityPeriod !== undefined && currentProduct?.validityPeriod !== null)
                    ? `${currentProduct.validityPeriod} ${currentProduct.validityType ?? ''}`
                    : "N/A"
            }]
            : []),
        { field: "Created Date", value: formatDateTime(currentProduct?.createdAt) ?? currentProduct?.createdAt ?? "N/A" },
        { field: "Last Updated Date", value: formatDateTime(currentProduct?.updatedAt) ?? currentProduct?.updatedAt ?? "N/A" },
    ];
    const buckets = currentProduct?.bucketList ?? tabDataMap[activeTab]?.buckets ?? [];

    const tabBarRef = useRef<CommonTabBarRef>(null)

    const bucketFields = [
        { name: "bucketId", label: "Bucket ID" },
        { name: "isUnlimited", label: "Is Unlimited" },
        { name: "initialQuota", label: "Quota" },
        { name: "carryForward", label: "Carry Forward" },
        { name: "maxCarryForward", label: "Max Carry Forward" },
        { name: "totalCarryForward", label: "Total Carry Forward" },
        { name: "carryForwardValidity", label: "Validity" },
        { name: "consumptionLimit", label: "Consumption Limit" },
        { name: "consumptionLimitWindow", label: "Consumption Limit Window" },
        { name: "createdAt", label: "Created Date" },
        { name: "updatedAt", label: "Last Updated Date" },
    ];

    const openViewMoreTab = (row: any) => {
        console.log("Opening view more tab for row:", row);
        const id = row?.planInternalId;
        if (!id) return;

        const tabKey = `view-${id}`;

        setTabDataMap(prev => ({
            ...prev,
            [tabKey]: { ...prev[tabKey], ...row }
        }));

        fetchProductDetails(id, tabKey);

        tabBarRef.current?.openTab({
            key: tabKey,
            label: `Plan ID: ${row?.planId ?? "N/A"}`
        });
        setActiveTab(tabKey);
    };

    useEffect(() => {
        searchPlans();
        fetchPlanIds()
    }, [paginationDetails, formValues]);

    const searchPlans = async () => {
        const query: PlansQueryModel = {
            page: paginationDetails.currentPage,
            page_size: paginationDetails.currentItemPerPage,
            planId: formValues?.planId ?? undefined,
            planName: formValues?.planName ?? undefined,
            planType: formValues?.planType ?? undefined,
            status: formValues?.status ?? undefined,
            recurringFlag: formValues?.recurringFlag,
            recurringPeriod: formValues?.recurringPeriod ?? undefined,
            connectionType: formValues?.connectionType ?? undefined,
            quotaProrationFlag: formValues?.quotaProrationFlag
        };

        try {
            const response = await getPlansInfo(query);
            if (response) {
                setPlansData(response);
            }
        } catch (err: any) {
            console.error("searchPlans error:", err);
            const errorMessage = err?.response?.data?.message || "Failed to retrieve Plans. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    };

    const normalizeFlag = (v: any): boolean | undefined => {
        if (v === 'Yes' || v === true) return true;
        if (v === 'No' || v === false) return false;
        return undefined;
    };

    const onSearchFormSubmit = (values?: Partial<PlansQueryModel> | Record<string, any>) => {
        const normalized: Partial<PlansQueryModel> = {
            ...values,
            recurringFlag: normalizeFlag(values?.recurringFlag),
            quotaProrationFlag: normalizeFlag(values?.quotaProrationFlag)
        };
        setFormValues(normalized);
        setSearchForm(values || {});
        setPaginationDetails((current) => ({ ...current, currentPage: 1 }));
    };

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
    };

    const fetchBuckets = async (): Promise<void> => {
        try {
            const response = await getBucketsList();
            const buckets: any[] = response?.data ?? [];

            const options = (Array.isArray(buckets) ? buckets : []).map((b: any) => ({
                label: b.bucketName ?? '',
                value: b.bucketId ?? ''
            })).filter(opt => opt.value);

            setBucketOptions(options);
        } catch (err) {
            console.log(err)
            showNotification("ERROR", "Unable to fetch buckets");
        }
    };

    const fetchProductDetails = async (planInternalId: string, tabKey?: string) => {
        if (tabKey) {
            setTabDataMap(prev => ({
                ...prev,
                [tabKey]: { ...prev[tabKey], productDetails: null }
            }));
        } else {
            setProductDetails(null);
        }

        try {
            const response = await getProductDetails(planInternalId);

            if (tabKey) {
                setTabDataMap(prev => ({
                    ...prev,
                    [tabKey]: {
                        ...prev[tabKey],
                        productDetails: response ?? { message: "", data: null }
                    }
                }));
            } else {
                setProductDetails(response ?? null);
            }
        } catch (err) {
            if (tabKey) {
                setTabDataMap(prev => ({
                    ...prev,
                    [tabKey]: { ...prev[tabKey], productDetails: { message: "", data: null } }
                }));
            } else {
                setProductDetails(null);
            }
        }
    };

    const createPlan = async () => {
        try {
            await drawerForm.validateFields();

            const values = drawerForm.getFieldsValue(true);

            // Prevent duplicate plan name (case-insensitive, trimmed)
            const normalizedPlanName = (values.planName ?? '').trim().toLowerCase();
            const planNameExists = (planNameList || []).some(
                (opt) => (opt.label ?? '').trim().toLowerCase() === normalizedPlanName
            );
            if (planNameExists) {
                showNotification("ERROR", "Plan name already exists. Please use a different name.");
                return;
            }

            if (!values?.buckets || !Array.isArray(values.buckets) || values.buckets.length === 0) {
                showNotification("ERROR", "At least one bucket is required");
                return;
            }

            // Check for duplicate buckets
            const bucketValues = values.buckets.map((b: any) => b?.bucket).filter((b: any) => b);
            const duplicateBuckets = bucketValues.filter((value: string, index: number) => bucketValues.indexOf(value) !== index);
            if (duplicateBuckets.length > 0) {
                showNotification("ERROR", "Duplicate buckets are not allowed. Please select different buckets for each bucket entry.");
                return;
            }

            const plan: PlanCreationModel['plan'] = {
                planId: values.planId ?? '',
                planName: values.planName ?? '',
                planType: values.planType ?? '',
                recurringFlag: values.recurring === 'Yes' || values.recurring === true,
                recurringPeriod: values.recurringMode ?? undefined,
                status: values.status ?? '',
                connectionType: values.connectionType ?? '',
                quotaProrationFlag: values.quotaProrated === 'Yes' || values.quotaProrated === true,
                validityPeriod: values.validityPeriod ? Number(values.validityPeriod) : 0,
                validityType: values.validityType ?? 'Minutes'
            };

            const bucketList: PlanCreationModel['bucketList'] = values.buckets.map((b: any) => ({
                bucketId: b.bucket ?? b.bucketId ?? undefined,
                bucketName: bucketOptions.find(opt => opt.value === b.bucket)?.label ?? undefined,
                initialQuota: b.quota ? toBytes(b.quota, b.quotaUnit) : undefined,
                carryForward: (b.carryForward === 'Yes' || b.carryForward === true),
                maxCarryForward: b.maxCarryForward ? toBytes(b.maxCarryForward, b.maxCarryForwardUnit) : undefined,
                totalCarryForward: b.totalCarryForward ? toBytes(b.totalCarryForward, b.totalCarryForwardUnit) : undefined,
                consumptionLimit: b.consumptionLimit ? toBytes(b.consumptionLimit, b.consumptionLimitUnit) : undefined,
                consumptionLimitWindow: b.consumptionLimitWindow ? b.consumptionLimitWindow : undefined,
                carryForwardValidity: b.validity ? Number(b.validity) : undefined,
                isUnlimited: b.isUnlimited === 'Yes' || b.isUnlimited === true
            }));

            const reqBody: PlanCreationModel = {
                plan,
                bucketList
            };

            const response = await createNewPlan(reqBody);

            if (response) {
                showNotification("SUCCESS", 'Plan created successfully');
                debouncedSearchPlans(); // refresh table in background without closing the drawer
                const newPlanId = response?.data?.planId ?? null;
                setCreatedPlanId(newPlanId);
                setShowRequestApprovalButton(true);
            }
        } catch (err: any) {
            console.log("ERROR in creating new plan:", err);
            const errorMessage = err?.response?.data?.message || "Failed to create Plan. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    }

    const debouncedSearchPlans = debounce(searchPlans, DEBOUNCE_TIME_IN_MS);

    const reloadPage = () => {
        closeDrawer();
        debouncedSearchPlans();
    }

    const fetchPlanIds = async (): Promise<void> => {
        try {
            const response = await getPlansList();
            const plans: any[] = response?.data ?? [];

            const planIdOptions = (Array.isArray(plans) ? plans : []).map((b: any) => ({
                label: b.planId ?? '',
                value: b.planId ?? ''
            })).filter(opt => opt.value);
            setPlanIdList(planIdOptions);

            const planNameOptions = (Array.isArray(plans) ? plans : []).map((b: any) => ({
                label: b.planName ?? '',
                value: b.planName ?? ''
            })).filter(opt => opt.value);
            setPlanNameList(planNameOptions);

        } catch (err) {
            showNotification("ERROR", "Unable to fetch plans");
            console.log("fetchPlanIds error:", err);
        }
    };

    const getPayloadFromForm = (values: any): PlanUpdateModel => {
        const plan: PlanUpdateModel['plan'] = {
            planName: values.planName ?? '',
            status: values.status ?? '',
            quotaProrationFlag: values.quotaProrated === 'Yes' || values.quotaProrated === true,
            validityPeriod: values.validityPeriod ? Number(values.validityPeriod) : 0,
            validityType: values.validityType ?? 'Minutes'
        };

        const bucketList: PlanUpdateModel['bucketList'] = values.buckets.map((b: any) => ({
            bucketId: b.bucket ?? b.bucketId ?? undefined,
            bucketName: bucketOptions.find(opt => opt.value === b.bucket)?.label ?? undefined,
            initialQuota: b.quota ? toBytes(b.quota, b.quotaUnit) : undefined,
            carryForward: (b.carryForward === 'Yes' || b.carryForward === true),
            maxCarryForward: b.maxCarryForward ? toBytes(b.maxCarryForward, b.maxCarryForwardUnit) : undefined,
            totalCarryForward: b.totalCarryForward ? toBytes(b.totalCarryForward, b.totalCarryForwardUnit) : undefined,
            carryForwardValidity: b.validity ? Number(b.validity) : undefined,
            consumptionLimit: b.consumptionLimit ? toBytes(b.consumptionLimit, b.consumptionLimitUnit) : undefined,
            consumptionLimitWindow: b.consumptionLimitWindow ? b.consumptionLimitWindow : undefined,
            isUnlimited: b.isUnlimited === 'Yes' || b.isUnlimited === true
        }));

        return { plan, bucketList };
    };

    const updatePlan = async () => {
        try {
            await drawerForm.validateFields();
            const values = drawerForm.getFieldsValue(true);

            const id = drawerData.drawerData?.planInternalId ?? values.planInternalId;
            if (!id) {
                showNotification("ERROR", "Plan id is missing");
                return;
            }

            if (!values?.buckets || !Array.isArray(values.buckets) || values.buckets.length === 0) {
                showNotification("ERROR", "At least one bucket is required");
                return;
            }

            // Check for duplicate buckets
            const bucketValues = values.buckets.map((b: any) => b?.bucket).filter((b: any) => b);
            const duplicateBuckets = bucketValues.filter((value: string, index: number) => bucketValues.indexOf(value) !== index);
            if (duplicateBuckets.length > 0) {
                showNotification("ERROR", "Duplicate buckets are not allowed. Please select different buckets for each bucket entry.");
                return;
            }

            const currentPayload = getPayloadFromForm(values);
            const initialPayload = getPayloadFromForm(drawerData.drawerData);

            // Simple deep comparison for PlanUpdateModel
            const isNoChange = JSON.stringify(currentPayload) === JSON.stringify(initialPayload);

            if (isNoChange) {
                closeDrawer();
                return;
            }

            const response = await editNewPlan(id, currentPayload);

            if (response) {
                showNotification("SUCCESS", 'Plan updated successfully');
                reloadPage();
            }
        } catch (err: any) {
            console.log("ERROR in updating plan:", err);
            const errorMessage = err?.response?.data?.message || "Failed to update Plan. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    };

    const handleDeleteClick = (plan: PlansResponseModel) => {
        setDeletingPlan(plan);
        setIsConfirmOpen(true);
        setDrawerData(prev => ({
            ...prev,
            operation: OperationActionsEnum.DELETE
        }));
    };

    const deleteUserConfirmation = async () => {
        if (!deletingPlan) {
            showNotification("ERROR", "Something went wrong! Please try again shortly");
            return;
        }
        const idToDelete = (deletingPlan as any).planId;
        if (!idToDelete) {
            showNotification("ERROR", "Plan id is missing");
            return;
        }
        try {
            const response = await deletePlan(idToDelete);

            if (response) {
                showNotification("SUCCESS", "Plan deleted successfully");
                reloadPage();
                cancelUserDeletion();
            } else {
                showNotification("ERROR", "Something went wrong! Please try again shortly");
            }
        } catch (err) {
            showNotification("ERROR", "Unable to delete plan. Please try again.");
            cancelUserDeletion();
            console.log("Error in deleting plan:", err);
        }
    };

    const cancelUserDeletion = () => {
        setIsConfirmOpen(false);
        setDeletingPlan(null);
        setDrawerData(prev => ({ ...prev, operation: OperationActionsEnum.NONE }));
    };

    const handleBucketDelete = async (fieldName: number | string, removeFn: (name: any) => void, fieldsLength: number) => {
        if (fieldsLength <= 1) return; // keep existing guard

        const buckets = drawerForm.getFieldValue('buckets') || [];
        const bucketEntry = buckets[fieldName as number];
        const id = bucketEntry?.planToBucketId ?? bucketEntry?.planToBucketId; // planToBucketId expected from backend
        console.log("Deleting bucket with id:", id);
        if (id) {
            try {
                await deleteBucket(String(id));
                showNotification("SUCCESS", "Bucket deleted successfully");
            } catch (err) {
                showNotification("ERROR", "Unable to delete bucket. Please try again.");
                console.error("deleteBucket error:", err);
                return;
            }
        }
        removeFn(fieldName);
    };

    const openBucketDetailsTab = async (bucket: any) => {
        if (!bucket) return;

        const rawId = bucket.bucketId;
        if (rawId == null) return;
        const id = rawId;
        const tabKey = `bucket-${rawId}`;

        setTabDataMap(prev => ({
            ...prev,
            [tabKey]: { ...prev[tabKey], bucketDetails: { data: null, loading: true } }
        }));
        tabBarRef.current?.openTab({ key: tabKey, label: `Bucket ID: ${id}` });
        setActiveTab(tabKey);
        try {
            const response = await getBucketDetails(id);
            setTabDataMap(prev => ({
                ...prev,
                [tabKey]: { ...prev[tabKey], bucketDetails: response ?? { message: "", data: null } }
            }));
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Failed to fetch bucket details. Please try again.";
            showNotification("ERROR", errorMessage);
            setTabDataMap(prev => ({
                ...prev,
                [tabKey]: { ...prev[tabKey], bucketDetails: { message: "", data: null, error: true } }
            }));
            console.error("getBucketDetails error:", err);
        }
    };

    const columnsBucketDetails = [
        { title: 'Field', dataIndex: 'field1', key: 'field1', width: '14%', onCell: () => ({ style: { backgroundColor: '#f5f5f5', fontWeight: '500' } }) },
        { title: 'Value', dataIndex: 'value1', key: 'value1', width: '19.3%' },
        { title: 'Field', dataIndex: 'field2', key: 'field2', width: '14%', onCell: () => ({ style: { backgroundColor: '#f5f5f5', fontWeight: '500' } }) },
        { title: 'Value', dataIndex: 'value2', key: 'value2', width: '19.3%' },
        { title: 'Field', dataIndex: 'field3', key: 'field3', width: '14%', onCell: () => ({ style: { backgroundColor: '#f5f5f5', fontWeight: '500' } }) },
        { title: 'Value', dataIndex: 'value3', key: 'value3', width: '19.3%' }
    ];

    const columnsApprovalHistory = [
        { title: 'Level', dataIndex: 'approvalLevel', key: 'approvalLevel', render: formatValue },
        { title: 'Approver Name', dataIndex: 'approverName', key: 'approverName', render: formatValue },
        { title: 'Approver ID', dataIndex: 'approverId', key: 'approverId', render: formatValue },
        { title: 'Role', dataIndex: 'approverRole', key: 'approverRole', render: formatValue },
        { title: 'Action', dataIndex: 'action', key: 'action', render: formatValue },
        { title: 'Comments', dataIndex: 'comments', key: 'comments', render: formatValue },
        { title: 'Action Date', dataIndex: 'actionDate', key: 'actionDate', render: (val: string) => formatDateTime(val) },
    ];

    const bucketPayload = tabDataMap[activeTab]?.bucketDetails;
    const bucketData = bucketPayload?.data ?? null;

    const dataBucketDetails = [
        {
            field1: "Bucket ID", value1: bucketData?.bucketId ?? "N/A",
            field2: "Bucket Name", value2: bucketData?.bucketName ?? "N/A",
            field3: "Bucket Type", value3: bucketData?.bucketType ?? "N/A"
        },
        {
            field1: "QoS ID",
            value1: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{bucketData?.qosId ?? 'N/A'}</span>
                    <EyeOutlined
                        style={{ cursor: 'pointer', color: '#1890ff', fontSize: '14px' }}
                        onClick={() => openQosDetailsTab(bucketData?.qosId)}
                    />
                </div>
            ),
            field2: "Priority", value2: bucketData?.priority ?? "N/A",
            field3: "Time Window", value3: bucketData?.timeWindow ?? "N/A"
        }
    ];

    const openQosDetailsTab = async (qosId: any) => {
        if (qosId == null) return;
        const id = Number(qosId);
        if (!Number.isFinite(id)) return;

        const tabKey = `qos-${id}`;

        setTabDataMap(prev => ({
            ...prev,
            [tabKey]: { ...prev[tabKey], qosDetails: { data: null, loading: true } }
        }));
        tabBarRef.current?.openTab({ key: tabKey, label: `QoS ID: ${id}` });
        setActiveTab(tabKey);

        try {
            const response = await getQosDetails(id);
            setTabDataMap(prev => ({
                ...prev,
                [tabKey]: { ...prev[tabKey], qosDetails: response ?? { message: "", data: null } }
            }));
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Failed to fetch QoS details. Please try again.";
            showNotification("ERROR", errorMessage);
            setTabDataMap(prev => ({
                ...prev,
                [tabKey]: { ...prev[tabKey], qosDetails: { message: "", data: null, error: true } }
            }));
            console.error("getQosDetails error:", err);
        }
    };

    const qosPayload = tabDataMap[activeTab]?.qosDetails;
    const qosData = qosPayload?.data ?? null;

    const dataQosDetails = [
        {
            field1: "QoS ID", value1: qosData?.id ?? "N/A",
            field2: "BNG Code", value2: qosData?.bngCode ?? "N/A",
            field3: "QoS Profile Name", value3: qosData?.qosProfileName ?? "N/A"
        },
        {
            field1: "Uplink", value1: qosData?.upLink ?? "N/A",
            field2: "Downlink", value2: qosData?.downLink ?? "N/A",
            field3: "Is Default", value3: typeof qosData?.isDefault === 'boolean' ? (qosData.isDefault ? 'True' : 'False') : 'N/A'
        }
    ];

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
                reportType: "PRODUCT_DETAILS",
                filterValues: filteredData
            };

            const res = await reportDownloadRequestProducts(requestData);
            console.log('res', res)
        } catch (err: any) {
            console.log("ERROR in exporting plans:", err);
            const errorMessage = err?.response?.data?.message || "Failed to export plans. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    }

    const handleReject = async () => {
        const planId = currentProduct?.planId;
        const internalId = currentProduct?.planInternalId;
        
        // Validate comment is not empty
        if (!comment || comment.trim() === "") {
            showNotification("ERROR", "Comment is mandatory");
            return;
        }
        
        if (!planId || !internalId) {
            showNotification("ERROR", "Plan ID or internal ID is missing");
            return;
        }

        try {
             await rejectPlan(String(planId), comment ?? "");
            showNotification("SUCCESS", "Plan rejected successfully");
            setComment("");

            const viewTabKey = `view-${internalId}`;
            if (activeTab === viewTabKey) {
                await fetchProductDetails(String(internalId), viewTabKey);
            } else {
                await fetchProductDetails(String(internalId));
            }

            debouncedSearchPlans();
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Unable to reject plan. Please try again.";
            showNotification("ERROR", errorMessage);
            console.error("rejectPlan error:", err);
        }
    };

    const handleApproval = async () => {
        const planId = currentProduct?.planId;
        const internalId = currentProduct?.planInternalId;
        
        // Validate comment is not empty
        if (!comment || comment.trim() === "") {
            showNotification("ERROR", "Comment is mandatory");
            return;
        }
        
        if (!planId || !internalId) {
            showNotification("ERROR", "Plan ID or internal ID is missing");
            return;
        }

        try {
            await approvePlan(String(planId), comment ?? "");
            showNotification("SUCCESS", "Plan approved successfully");
            setComment("");

            const viewTabKey = `view-${internalId}`;
            if (activeTab === viewTabKey) {
                await fetchProductDetails(String(internalId), viewTabKey);
            } else {
                await fetchProductDetails(String(internalId));
            }

            debouncedSearchPlans();
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Unable to approve plan. Please try again.";
            showNotification("ERROR", errorMessage);
            console.error("approvePlan error:", err);
        }
    };

    const handlePlanApprovalHistory = async () => {
        const id = currentProduct?.planId;
         if (!id) {
            showNotification("ERROR", "Plan id is missing");
            return;
        }

        const tabKey = `history-${id}`;
        setTabDataMap(prev => ({
            ...prev,
            [tabKey]: { ...prev[tabKey], approvalHistory: { data: null, loading: true } }
        }));

        tabBarRef.current?.openTab({
            key: tabKey,
            label: `History: ${id}`
        });
        setActiveTab(tabKey);

        try {
            const response = await getApprovalHistory(String(id));
            if (response?.success) {
                setTabDataMap(prev => ({
                    ...prev,
                    [tabKey]: { ...prev[tabKey], approvalHistory: { data: response.data || [], loading: false } }
                }));
            }
        } catch (err) {
            setTabDataMap(prev => ({
                ...prev,
                [tabKey]: { ...prev[tabKey], approvalHistory: { data: [], loading: false, error: true } }
            }));
            console.error("getApprovalHistory error:", err);
        }
    };

    const requestApprovalForCreatedPlan = async () => {
        if (!createdPlanId) {
            showNotification("ERROR", "Plan id is missing");
            return;
        }
        try {
            await submitRequestApproval(String(createdPlanId));
            showNotification("SUCCESS", "Approval requested successfully");

            setApprovalDrawerOpen(false);
            setShowRequestApprovalButton(false);
            reloadPage();
        } catch (err: any) {
            console.error("requestApproval error:", err);
            const errorMessage = err?.response?.data?.message || "Unable to request approval. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    }

    const handleRequestApprovalBtnClick = async (planId?: string) => {
        if (planId) {
            setCreatedPlanId(planId);
        }
        try {
            const response = await getApprovalConfigs();
            if (response?.success) {
                setApprovalConfigs(response.data || []);
                setApprovalDrawerOpen(true);
            }
        } catch (err) {
            console.error("fetchApprovalConfigs error:", err);
        }
    };


    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_PLANS}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Search Plans</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    ref={tabBarRef}
                    initialTabs={[{ key: "search", label: "Search Plans" }]}
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
                            onClear={() => onSearchFormSubmit({})}
                            initialValues={searchForm}
                        />
                        <div className="common-button-bar">
                            <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                <ActionPermission action={ACTION_PERMISSION.EXPORT_PLAN_DETAILS_REPORT}>
                                    <Button
                                        type="default"
                                        size="small"
                                        style={{ fontSize: 12 }}
                                        onClick={() => { handleExport() }}
                                    >
                                        Export
                                    </Button>
                                </ActionPermission>
                                <ActionPermission action={ACTION_PERMISSION.CREATE_PLAN}>
                                    <Button
                                        type="primary"
                                        size="small"
                                        style={{ fontSize: 12 }}
                                        onClick={openCreateDrawer}
                                    >
                                        Create Plan
                                    </Button>
                                </ActionPermission>
                            </div>
                        </div>

                        <div>
                            <DynamicTable
                                columns={columns}
                                data={plansData?.data?.plans || []}
                                pagination={{
                                    current: paginationDetails.currentPage,
                                    pageSize: paginationDetails.currentItemPerPage,
                                    total: Number(plansData?.pageDetails?.totalRecords ?? plansData?.data?.plans.length ?? 0),
                                    onChange: onTableChange
                                }}
                            />
                        </div>
                    </div>
                )}

                {activeTab.startsWith("view-") && (
                    <>
                        <div className="common-page-margin" style={{ marginTop: "0px", display: "flex" }}>
                            {/* plan Information Card */}
                            <Card
                                title="Plan Information"
                                style={{ flex: 1, borderRadius: 0, borderRight: 'none' }}
                                headStyle={{ background: "#F8F9FA", fontWeight: '100px', fontSize: '14px', padding: '6px 16px', minHeight: 'auto', borderRadius: 0 }}
                            >
                                <div style={{ borderRadius: 0, border: '1px solid #f0f0f0', borderBottom: 'none' }}>
                                    <Table
                                        className="common-basic-table"
                                        columns={columnsViewMore}
                                        dataSource={descriptionData}
                                        pagination={false}
                                        showHeader={false}
                                        tableLayout="fixed"
                                    />
                                </div>
                            </Card>

                            {/* Bucket Information Card */}
                            <Card
                                title="Bucket Information"
                                style={{ flex: 1, borderRadius: 0 }}
                                headStyle={{ background: "#F8F9FA", fontWeight: '100px', fontSize: '14px', padding: '6px 16px', minHeight: 'auto', borderRadius: 0 }}
                            >
                                {buckets && buckets.length > 0 ? buckets.map((bucket: any, index: any) => (
                                    <div key={index} style={{ marginBottom: index < buckets.length - 1 ? '16px' : '0' }}>
                                        <Card>
                                            <div style={{ marginBottom: '8px', fontWeight: '500', color: '#1890ff' }}>Bucket: {index + 1}</div>
                                            <div style={{ borderRadius: 0, border: '1px solid #f0f0f0', borderBottom: 'none' }}>
                                                <Table
                                                    className="common-basic-table"
                                                    columns={columnsViewMore}
                                                    dataSource={bucketFields.map((field, fieldIndex) => {
                                                        const raw = bucket[field.name];
                                                        const value =
                                                            field.name === 'qosProfile'
                                                                ? (
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <span>{raw ?? 'N/A'}</span>
                                                                        <ActionPermission action={ACTION_PERMISSION.VIEW_QOS_PROFILE_INFO}>
                                                                            <EyeOutlined
                                                                                style={{ cursor: 'pointer', color: '#1890ff', fontSize: '14px' }}
                                                                                onClick={() => openQosDrawer(bucket)}
                                                                            />
                                                                        </ActionPermission>
                                                                    </div>
                                                                )
                                                                : field.name === 'bucketId'
                                                                    ? (
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <span>{raw ?? 'N/A'}</span>
                                                                            <ActionPermission action={ACTION_PERMISSION.VIEW_BUCKET_INFO_PRODUCT_CATALOG}>
                                                                                <EyeOutlined
                                                                                    style={{ cursor: 'pointer', color: '#1890ff', fontSize: '14px' }}
                                                                                    onClick={() => openBucketDetailsTab(bucket)}
                                                                                />
                                                                            </ActionPermission>
                                                                        </div>
                                                                    )
                                                                    : (field.name === 'initialQuota' || field.name === 'maxCarryForward' || field.name === 'totalCarryForward' || field.name === 'consumptionLimit')
                                                                        ? formatBytes(raw)
                                                                        : (typeof raw === 'boolean' ? (raw ? 'Yes' : 'No') : (raw ?? 'N/A'));

                                                        return {
                                                            key: fieldIndex + 1,
                                                            field: field.label,
                                                            value
                                                        };
                                                    })}
                                                    pagination={false}
                                                    showHeader={false}
                                                    tableLayout="fixed"
                                                />
                                            </div>
                                        </Card>
                                    </div>
                                )) : <div>No bucket information available</div>}
                            </Card>

                        </div>

                        {/* Comment Section */}
                        {currentProduct?.status === "Draft" && currentProduct?.approvalStatus === "Pending_Approval" && (
                            <div
                                className="common-page-margin"
                                style={{
                                    marginTop: "16px",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "12px"
                                }}
                            >
                                <div style={{ fontWeight: 500, fontSize: '14px' }}>
                                    Comment <span style={{ color: "red" }}>*</span>
                                </div>

                                <Input.TextArea
                                    rows={3}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Enter comment"
                                    style={{ flex: 1, resize: "none" }}
                                />
                            </div>
                        )}

                        <div className="common-page-margin"
                            style={{
                                marginTop: 16,
                                marginBottom: 24,
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "8px"
                            }}
                        >
                            <ActionPermission action={ACTION_PERMISSION.APPROVAL_HISTORY}>
                                <Button onClick={handlePlanApprovalHistory} type="default">
                                    Plan Approval History
                                </Button>
                            </ActionPermission>

                            <div style={{ display: "flex", gap: "8px" }}>
                                {currentProduct?.status === "Draft" && currentProduct?.approvalStatus === "Draft" && (
                                    <Button type="primary" onClick={() => handleRequestApprovalBtnClick(currentProduct?.planId)}>
                                        Request Approval
                                    </Button>
                                )}

                                {currentProduct?.status === "Draft" && currentProduct?.approvalStatus === "Pending_Approval" && (
                                    <>
                                        <ActionPermission action={ACTION_PERMISSION.REJECT_PLAN}>
                                            <Button onClick={handleReject} className="reject-btn">
                                                Reject
                                            </Button>
                                        </ActionPermission>
                                        <ActionPermission action={ACTION_PERMISSION.APPROVE_PLAN}>
                                            <Button type="primary" onClick={handleApproval}>
                                                Approve
                                            </Button>
                                        </ActionPermission>
                                    </>
                                )}
                            </div>
                        </div>

                    </>
                )}

                {activeTab.startsWith("history-") && (
                    <div className="common-page-margin" style={{ marginTop: "0px" }}>
                        <Card
                            title="Plan Approval History"
                            style={{ borderRadius: 0 }}
                            headStyle={{ background: "#F8F9FA", fontSize: '14px', padding: '6px 16px', minHeight: 'auto', borderRadius: 0 }}
                        >
                            <DynamicTable
                                columns={columnsApprovalHistory}
                                data={tabDataMap[activeTab]?.approvalHistory?.data || []}
                                pagination={false}
                                loading={tabDataMap[activeTab]?.approvalHistory?.loading}
                            />
                        </Card>
                    </div>
                )}

                <Drawer
                    className="common-drawer"
                    width={qosDrawerOpen ? 800 : 1345}
                    title={
                        <span className="font-2xl-semi-bold">
                            {drawerData.operation === OperationActionsEnum.NEW && "Create New Plan"}
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
                                colon={false}
                                labelCol={{ span: 7 }}
                                wrapperCol={{ span: 17 }}
                            >
                                {
                                    drawerData.operation !== OperationActionsEnum.VIEW &&
                                    <>
                                        {
                                            (drawerData.operation === OperationActionsEnum.NEW ||
                                                (drawerData.operation === OperationActionsEnum.EDIT && drawerData.drawerTitle === "Edit New Plan")) && (
                                                <>
                                                    {drawerData.operation === OperationActionsEnum.NEW && (
                                                        <Card size="small" title="Plan Information" style={{ marginTop: 0 }} headStyle={{ background: "#fafafa" }} bodyStyle={{ paddingTop: 25, paddingBottom: 5 }}>
                                                            <Row gutter={16}>
                                                                <Col span={8}>
                                                                    <Form.Item
                                                                        label="Plan ID"
                                                                        name="planId"
                                                                        rules={[{ required: true, message: 'Plan ID is required' }]}
                                                                    >
                                                                        <Input maxLength={50} placeholder="Enter Plan ID" />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={8}>
                                                                    <Form.Item
                                                                        label="Plan Name"
                                                                        name="planName"
                                                                        rules={[{ required: true, message: 'Plan Name is required' }]}
                                                                    >
                                                                        <Input maxLength={500} placeholder="Enter Plan Name" />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={8}>
                                                                    <Form.Item
                                                                        label="Plan Type"
                                                                        name="planType"
                                                                        rules={[{ required: true, message: 'Plan Type is required' }]}
                                                                    >
                                                                        <Select
                                                                            placeholder="Select Plan Type"
                                                                            options={typeOptions}
                                                                            allowClear
                                                                            showSearch
                                                                        />
                                                                    </Form.Item>
                                                                </Col>
                                                            </Row>

                                                            <Row gutter={16}>
                                                                <Col span={8}>
                                                                    <Form.Item
                                                                        label="Connection Type"
                                                                        name="connectionType"
                                                                        rules={[{ required: true, message: 'Connection Type is required' }]}
                                                                    >
                                                                        <Select
                                                                            placeholder="Select Connection Type"
                                                                            options={connectionTypeOptions}
                                                                            allowClear
                                                                        />
                                                                    </Form.Item>
                                                                </Col>
                                                                {/* <Col span={8}>
                                                                    <Form.Item
                                                                        label="Status"
                                                                        name="status"
                                                                        rules={[{ required: true, message: 'Status is required' }]}
                                                                    >
                                                                        <Select
                                                                            placeholder="Select Status"
                                                                            options={statusList}
                                                                            allowClear

                                                                        />
                                                                    </Form.Item>
                                                                </Col> */}
                                                            </Row>

                                                            {/* Divider between sections */}
                                                            <div style={{ borderTop: "1px solid #f0f0f0", margin: "0 0 25px 0" }} />

                                                            <Form.Item noStyle dependencies={['recurring']}>
                                                                {({ getFieldValue }) => {
                                                                    const recurring = getFieldValue('recurring');
                                                                    const showMode = recurring === 'Yes';
                                                                    return (
                                                                        <Row gutter={16}>
                                                                            <Col span={8}>
                                                                                <Form.Item
                                                                                    label="Recurring"
                                                                                    name="recurring"
                                                                                    rules={[{ required: true, message: 'Recurring is required' }]}
                                                                                >
                                                                                    <Select
                                                                                        placeholder="Select Recurring"
                                                                                        options={recurringOptions}
                                                                                        allowClear
                                                                                    />
                                                                                </Form.Item>
                                                                            </Col>

                                                                            {showMode && (
                                                                                <Col span={8}>
                                                                                    <Form.Item
                                                                                        label="Recurring Mode"
                                                                                        name="recurringMode"
                                                                                        rules={[{ required: true, message: 'Recurring Mode is required' }]}
                                                                                    >
                                                                                        <Select
                                                                                            placeholder="Select Recurring Mode"
                                                                                            options={recurringModeOptions}
                                                                                            allowClear
                                                                                        />
                                                                                    </Form.Item>
                                                                                </Col>
                                                                            )}

                                                                            <Col span={8}>
                                                                                <Form.Item
                                                                                    label="Quota Prorated"
                                                                                    name="quotaProrated"
                                                                                    rules={[{ required: true, message: 'Quota Prorated is required' }]}
                                                                                >
                                                                                    <Select
                                                                                        placeholder="Select Quota Prorated"
                                                                                        options={quotaProratedOptions}
                                                                                        allowClear
                                                                                    />
                                                                                </Form.Item>
                                                                            </Col>

                                                                            {recurring === 'No' && (
                                                                                <Col span={8}>
                                                                                    <Form.Item label="Validity Period">
                                                                                        <Input.Group compact>
                                                                                            <Form.Item
                                                                                                name="validityPeriod"
                                                                                                noStyle
                                                                                                dependencies={['recurring']}
                                                                                                rules={[
                                                                                                    ({ getFieldValue }) => ({
                                                                                                        required: getFieldValue('recurring') === 'No',
                                                                                                        message: 'Validity Period is required',
                                                                                                    }),
                                                                                                    {
                                                                                                        validator: (_, value) => {
                                                                                                            if (value == null || value === '') return Promise.resolve();
                                                                                                            const num = Number(value);
                                                                                                            return (!Number.isNaN(num) && num > 0)
                                                                                                                ? Promise.resolve()
                                                                                                                : Promise.reject(new Error('Must be a number > 0'));
                                                                                                        }
                                                                                                    }
                                                                                                ]}
                                                                                            >
                                                                                                <InputNumber
                                                                                                    style={{ width: 'calc(100% - 120px)' }}
                                                                                                    placeholder="Value"
                                                                                                    min={1}
                                                                                                    controls={false}
                                                                                                />
                                                                                            </Form.Item>
                                                                                            <Form.Item
                                                                                                    name="validityType"
                                                                                                    noStyle
                                                                                                    initialValue="Minutes"
                                                                                            >
                                                                                                <Select
                                                                                                    style={{ width: 120 }}
                                                                                                    options={validityPeriodOptions}
                                                                                                    placeholder="Unit"
                                                                                                />
                                                                                            </Form.Item>
                                                                                        </Input.Group>
                                                                                    </Form.Item>
                                                                                </Col>
                                                                            )}
                                                                        </Row>
                                                                    );
                                                                }}
                                                            </Form.Item>
                                                        </Card>
                                                    )}

                                                    {drawerData.operation === OperationActionsEnum.EDIT && (
                                                        <Card size="small" title="Plan Information" style={{ marginTop: 0 }} headStyle={{ background: "#fafafa" }} bodyStyle={{ paddingTop: 25, paddingBottom: 5 }}>
                                                            <Row gutter={16}>
                                                                <Col span={8}>
                                                                    <Form.Item
                                                                        label="Plan Name"
                                                                        name="planName"
                                                                        rules={[{ required: true, message: 'Plan Name is required' }]}
                                                                    >
                                                                        <Input maxLength={500} placeholder="Enter Plan Name" />
                                                                    </Form.Item>
                                                                </Col>
                                                                {/* <Col span={8}>
                                                                    <Form.Item
                                                                        label="Status"
                                                                        name="status"
                                                                        rules={[{ required: true, message: 'Status is required' }]}
                                                                    >
                                                                        <Select
                                                                            placeholder="Select Status"
                                                                            options={statusList}
                                                                            allowClear

                                                                        />
                                                                    </Form.Item>
                                                                </Col> */}
                                                                <Col span={8}>
                                                                    <Form.Item
                                                                        label="Quota Prorated"
                                                                        name="quotaProrated"
                                                                        rules={[{ required: true, message: 'Quota Prorated is required' }]}
                                                                    >
                                                                        <Select
                                                                            placeholder="Select Quota Prorated"
                                                                            options={quotaProratedOptions}
                                                                            allowClear
                                                                        />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Form.Item noStyle dependencies={['recurring']}>
                                                                    {({ getFieldValue }) => {
                                                                        const recurring = getFieldValue('recurring');
                                                                        if (recurring === 'No') {
                                                                            return (
                                                                                <Col span={8}>
                                                                                    <Form.Item label="Validity Period">
                                                                                        <Input.Group compact>
                                                                                            <Form.Item
                                                                                                name="validityPeriod"
                                                                                                noStyle
                                                                                                rules={[
                                                                                                    { required: true, message: 'Validity Period is required' },
                                                                                                    {
                                                                                                        validator: (_, value) => {
                                                                                                            if (value == null || value === '') return Promise.resolve();
                                                                                                            const num = Number(value);
                                                                                                            return (!Number.isNaN(num) && num > 0)
                                                                                                                ? Promise.resolve()
                                                                                                                : Promise.reject(new Error('Must be a number > 0'));
                                                                                                        }
                                                                                                    }
                                                                                                ]}
                                                                                            >
                                                                                                <InputNumber
                                                                                                    style={{ width: 'calc(100% - 120px)' }}
                                                                                                    placeholder="Value"
                                                                                                    min={1}
                                                                                                    controls={false}
                                                                                                />
                                                                                            </Form.Item>
                                                                                            <Form.Item
                                                                                                name="validityType"
                                                                                                noStyle
                                                                                                initialValue="Minutes"
                                                                                            >
                                                                                                <Select
                                                                                                    style={{ width: 120 }}
                                                                                                    options={validityPeriodOptions}
                                                                                                    placeholder="Unit"
                                                                                                />
                                                                                            </Form.Item>
                                                                                        </Input.Group>
                                                                                    </Form.Item>
                                                                                </Col>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    }}
                                                                </Form.Item>
                                                            </Row>
                                                        </Card>
                                                    )}

                                                    <Form.List name="buckets">
                                                        {(fields, { add, remove }) => (
                                                            <Card
                                                                size="small"
                                                                title="Bucket Information"
                                                                style={{ marginBottom: 25, marginTop: 25 }}
                                                                headStyle={{ background: "#fafafa" }}
                                                                bodyStyle={{ paddingTop: 25, paddingBottom: 5 }}
                                                                extra={
                                                                    <Button
                                                                        type="primary"
                                                                        size="small"
                                                                        onClick={() =>
                                                                            add({
                                                                                bucket: undefined,
                                                                                quota: '',
                                                                                quotaUnit: 'B',
                                                                                carryForward: undefined,
                                                                                maxCarryForward: undefined,
                                                                                maxCarryForwardUnit: 'B',
                                                                                totalCarryForward: undefined,
                                                                                totalCarryForwardUnit: 'B',
                                                                                consumptionLimit: undefined,
                                                                                consumptionLimitUnit: 'B',
                                                                                consumptionLimitWindow: '',
                                                                                consumptionLimitWindowUnit: 'Days',
                                                                                validity: '',
                                                                                validityUnit: 'Days',
                                                                                qosProfile: undefined,
                                                                                priority: undefined,
                                                                                expiryRule: undefined,
                                                                                maxRollover: undefined
                                                                            })
                                                                        }
                                                                    >
                                                                        Add New Bucket
                                                                    </Button>
                                                                }
                                                            >
                                                                {fields.map((field, index) => (
                                                                    <Card
                                                                        key={field.key}
                                                                        size="small"
                                                                        title={<span style={{ color: '#1890ff' }}>{'Bucket ' + (index + 1) + ':'}</span>}
                                                                        style={{ marginBottom: 16 }}
                                                                        headStyle={{ background: "#fafafa" }}
                                                                        bodyStyle={{ paddingTop: 25, paddingBottom: 5 }}
                                                                        extra={
                                                                            fields.length > 1 ? (
                                                                                <CommonSquareButtonPreDefined
                                                                                    type={ButtonTypeEnum.DELETE}
                                                                                    onClick={() => handleBucketDelete(field.name, remove, fields.length)}
                                                                                />
                                                                            ) : null
                                                                        }
                                                                    >
                                                                        <Row gutter={16}>
                                                                            <Col span={8}>
                                                                                <Form.Item
                                                                                    label="Bucket"
                                                                                    name={[field.name, "bucket"]}
                                                                                    dependencies={[['buckets']]}
                                                                                    rules={[
                                                                                        { required: true, message: 'Bucket is required' },
                                                                                        {
                                                                                            validator: (_rule: any, value: string) => {
                                                                                                if (!value) return Promise.resolve();
                                                                                                const allBuckets = drawerForm.getFieldValue('buckets') || [];
                                                                                                const duplicateCount = allBuckets.filter((b: any, idx: number) =>
                                                                                                    b?.bucket === value && idx !== field.name
                                                                                                ).length;
                                                                                                if (duplicateCount > 0) {
                                                                                                    showNotification("ERROR", 'The selected bucket already exists for the plan. Please choose a different bucket.');
                                                                                                    return Promise.reject('This bucket has already been selected');
                                                                                                }
                                                                                                return Promise.resolve();
                                                                                            }
                                                                                        }
                                                                                    ]}
                                                                                >
                                                                                    <Select
                                                                                        placeholder="Select Bucket"
                                                                                        options={bucketOptions}
                                                                                        allowClear
                                                                                        showSearch
                                                                                        disabled={
                                                                                            // Disable if editing and this bucket already has a value
                                                                                            !!drawerData?.drawerData?.buckets?.[index]?.bucket
                                                                                        }
                                                                                    />
                                                                                </Form.Item>
                                                                            </Col>
                                                                            <Col span={8}>
                                                                                <Form.Item
                                                                                    label="Unlimited"
                                                                                    name={[field.name, "isUnlimited"]}
                                                                                    rules={[{ required: true, message: 'Unlimited is required' }]}
                                                                                >
                                                                                    <Select
                                                                                        placeholder="Select"
                                                                                        options={recurringOptions}
                                                                                        allowClear
                                                                                    />
                                                                                </Form.Item>
                                                                            </Col>
                                                                        </Row>

                                                                        <div style={{ borderTop: "1px solid #f0f0f0", margin: "0 0 25px 0" }} />

                                                                        <Form.Item noStyle dependencies={[['buckets', field.name, 'isUnlimited']]}>
                                                                            {({ getFieldValue }) => {
                                                                                const isUnlimited = getFieldValue(['buckets', field.name, 'isUnlimited']);
                                                                                const isDisabled = isUnlimited === 'Yes' || isUnlimited === true;
                                                                                return (
                                                                                    <Row gutter={16}>
                                                                                        <Col span={8}>
                                                                                            <Form.Item label="Quota">
                                                                                                <Input.Group compact>
                                                                                                    <Form.Item
                                                                                                        name={[field.name, 'quota']}
                                                                                                        noStyle
                                                                                                        rules={[
                                                                                                            {
                                                                                                                validator: (_, value) => {
                                                                                                                    if (isDisabled) return Promise.resolve();
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
                                                                                                            disabled={isDisabled}
                                                                                                        />
                                                                                                    </Form.Item>

                                                                                                    <Form.Item
                                                                                                        name={[field.name, 'quotaUnit']}
                                                                                                        noStyle
                                                                                                        rules={[{ required: !isDisabled, message: 'Unit is required' }]}
                                                                                                        initialValue="B"
                                                                                                    >
                                                                                                        <Select
                                                                                                            style={{ width: 120 }}
                                                                                                            options={unitOptions}
                                                                                                            disabled={isDisabled}
                                                                                                        />
                                                                                                    </Form.Item>
                                                                                                </Input.Group>
                                                                                            </Form.Item>
                                                                                        </Col>
                                                                                    </Row>
                                                                                );
                                                                            }}
                                                                        </Form.Item>

                                                                        <div style={{ borderTop: "1px solid #f0f0f0", margin: "0 0 25px 0" }} />

                                                                        <Form.Item noStyle dependencies={[['buckets', field.name, 'carryForward'], ['buckets', field.name, 'isUnlimited']]}>
                                                                            {({ getFieldValue }) => {
                                                                                const isCarryForward = getFieldValue(['buckets', field.name, 'carryForward']);
                                                                                const isUnlimited = getFieldValue(['buckets', field.name, 'isUnlimited']);
                                                                                const isUnlimitedDisabled = isUnlimited === 'Yes' || isUnlimited === true;
                                                                                const showOtherCarryForwards = (isCarryForward === 'Yes' || isCarryForward === true) && !isUnlimitedDisabled;
                                                                                return (
                                                                                    <Row gutter={16}>
                                                                                        <Col span={8}>
                                                                                            <Form.Item
                                                                                                label="Carry Forward"
                                                                                                name={[field.name, 'carryForward']}
                                                                                                rules={[{ required: !isUnlimitedDisabled, message: 'Carry Forward is required' }]}
                                                                                            >
                                                                                                <Select
                                                                                                    placeholder="Select Carry Forward"
                                                                                                    options={carryForwardOptions}
                                                                                                    allowClear
                                                                                                    disabled={isUnlimitedDisabled}
                                                                                                />
                                                                                            </Form.Item>
                                                                                        </Col>

                                                                                        <Col span={8}>
                                                                                            {showOtherCarryForwards ? (
                                                                                                <Form.Item label={<span>Max Carry<br />Forward</span>} required>
                                                                                                    <Input.Group compact>
                                                                                                        <Form.Item
                                                                                                            name={[field.name, 'maxCarryForward']}
                                                                                                            noStyle
                                                                                                            rules={[
                                                                                                                { required: true, message: 'Max Carry Forward is required' },
                                                                                                                {
                                                                                                                    validator: (_: any, value: any) => {
                                                                                                                        if (value == null || value === '') return Promise.resolve();
                                                                                                                        const num = Number(String(value).replace(/,/g, '').trim());
                                                                                                                        return (!Number.isNaN(num) && Number.isFinite(num) && num > 0)
                                                                                                                            ? Promise.resolve()
                                                                                                                            : Promise.reject(new Error('Max Carry Forward must be a number greater than 0'));
                                                                                                                    }
                                                                                                                }
                                                                                                            ]}
                                                                                                        >
                                                                                                            <InputNumber
                                                                                                                style={{ width: 'calc(100% - 120px)' }}
                                                                                                                min={0}
                                                                                                                step={0.01}
                                                                                                                precision={2}
                                                                                                                stringMode={false}
                                                                                                                parser={(v: any) => (v ? v.toString().replace(/[^0-9.]/g, '') : '')}
                                                                                                                placeholder="Enter Max Carry Forward"
                                                                                                                controls={false}
                                                                                                            />
                                                                                                        </Form.Item>

                                                                                                        <Form.Item
                                                                                                            name={[field.name, 'maxCarryForwardUnit']}
                                                                                                            noStyle
                                                                                                            rules={[{ required: true, message: 'Unit is required' }]}
                                                                                                            initialValue="B"
                                                                                                        >
                                                                                                            <Select style={{ width: 120 }} options={unitOptions} />
                                                                                                        </Form.Item>
                                                                                                    </Input.Group>
                                                                                                </Form.Item>
                                                                                            ) : <div style={{ height: 56 }} />}
                                                                                        </Col>

                                                                                        <Col span={8}>
                                                                                            {showOtherCarryForwards ? (
                                                                                                <Form.Item label={<span>Total Carry<br />Forward</span>}>
                                                                                                    <Input.Group compact>
                                                                                                        <Form.Item
                                                                                                            name={[field.name, 'totalCarryForward']}
                                                                                                            noStyle
                                                                                                            rules={[
                                                                                                                { required: true, message: 'Total Carry Forward is required' },
                                                                                                                {
                                                                                                                    validator: (_: any, value: any) => {
                                                                                                                        if (value == null || value === '') return Promise.resolve();
                                                                                                                        const num = Number(String(value).replace(/,/g, '').trim());
                                                                                                                        return (!Number.isNaN(num) && Number.isFinite(num) && num >= 0)
                                                                                                                            ? Promise.resolve()
                                                                                                                            : Promise.reject(new Error('Total Carry Forward must be a number'));
                                                                                                                    }
                                                                                                                }
                                                                                                            ]}
                                                                                                            validateTrigger={['onBlur', 'onChange']}
                                                                                                        >
                                                                                                            <InputNumber
                                                                                                                style={{ width: 'calc(100% - 120px)' }}
                                                                                                                min={0}
                                                                                                                step={0.01}
                                                                                                                precision={2}
                                                                                                                stringMode={false}
                                                                                                                parser={(v: any) => (v ? v.toString().replace(/[^0-9.]/g, '') : '')}
                                                                                                                placeholder="Enter Total Carry Forward"
                                                                                                                controls={false}
                                                                                                            />
                                                                                                        </Form.Item>

                                                                                                        <Form.Item
                                                                                                            name={[field.name, 'totalCarryForwardUnit']}
                                                                                                            noStyle
                                                                                                            rules={[{ required: true, message: 'Unit is required' }]}
                                                                                                            initialValue="B"
                                                                                                        >
                                                                                                            <Select style={{ width: 120 }} options={unitOptions} />
                                                                                                        </Form.Item>
                                                                                                    </Input.Group>
                                                                                                </Form.Item>
                                                                                            ) : <div style={{ height: 56 }} />}
                                                                                        </Col>
                                                                                    </Row>
                                                                                );
                                                                            }}
                                                                        </Form.Item>

                                                                        <Row gutter={16}>
                                                                            <Col span={8}>
                                                                                <Form.Item label={<span>Consumption<br />Limit</span>}>
                                                                                    <Input.Group compact>
                                                                                        <Form.Item
                                                                                            name={[field.name, 'consumptionLimit']}
                                                                                            noStyle
                                                                                            rules={[
                                                                                                {
                                                                                                    validator: (_: any, value: any) => {
                                                                                                        if (value == null || value === '') return Promise.resolve();
                                                                                                        const num = Number(value);
                                                                                                        return (!Number.isNaN(num) && num >= 0)
                                                                                                            ? Promise.resolve()
                                                                                                            : Promise.reject(new Error('Consumption Limit must be a number greater than or equal to 0'));
                                                                                                    }
                                                                                                }
                                                                                            ]}
                                                                                        >
                                                                                            <InputNumber
                                                                                                style={{ width: 'calc(100% - 120px)' }}
                                                                                                min={0}
                                                                                                precision={0}
                                                                                                parser={(v: any) => (v ? v.toString().replace(/[^\d.-]/g, '') : '')}
                                                                                                placeholder="Enter Consumption Limit"
                                                                                                controls={false}
                                                                                            />
                                                                                        </Form.Item>

                                                                                        <Form.Item
                                                                                            name={[field.name, 'consumptionLimitUnit']}
                                                                                            noStyle
                                                                                            rules={[{ required: true, message: 'Unit is required' }]}
                                                                                            initialValue="B"
                                                                                        >
                                                                                            <Select style={{ width: 120 }} options={unitOptions} />
                                                                                        </Form.Item>
                                                                                    </Input.Group>
                                                                                </Form.Item>
                                                                            </Col>

                                                                            <Col span={8}>
                                                                                <Form.Item label={<span>Consumption Limit<br />Window</span>}>
                                                                                    <Input.Group compact>
                                                                                        <Form.Item
                                                                                            name={[field.name, 'consumptionLimitWindow']}
                                                                                            noStyle
                                                                                            rules={[
                                                                                                {
                                                                                                    validator: (_: any, value: any) => {
                                                                                                        if (value == null || String(value).trim() === '') return Promise.resolve();
                                                                                                        const num = Number(String(value).replace(/,/g, '').trim());
                                                                                                        return (!Number.isNaN(num))
                                                                                                            ? Promise.resolve()
                                                                                                            : Promise.reject(new Error('Consumption Limit Window must be a number'));
                                                                                                    }
                                                                                                }
                                                                                            ]}
                                                                                        >
                                                                                            <Input
                                                                                                style={{ width: 'calc(100% - 120px)' }}
                                                                                                maxLength={10}
                                                                                                placeholder="Enter Consumption Limit Window"
                                                                                            />
                                                                                        </Form.Item>

                                                                                        <Form.Item
                                                                                            name={[field.name, 'consumptionLimitWindowUnit']}
                                                                                            noStyle
                                                                                            initialValue="Days"
                                                                                        >
                                                                                            <Select
                                                                                                style={{ width: 120 }}
                                                                                                options={[{ label: 'Days', value: 'Days' }]}
                                                                                                open={false}
                                                                                                showArrow={false}
                                                                                                dropdownMatchSelectWidth={false}
                                                                                                placeholder="Days"
                                                                                            />
                                                                                        </Form.Item>
                                                                                    </Input.Group>
                                                                                </Form.Item>
                                                                            </Col>

                                                                            <Col span={8}>
                                                                                <Form.Item noStyle dependencies={[['buckets', field.name, 'carryForward']]}>
                                                                                    {({ getFieldValue }) =>
                                                                                        getFieldValue(['buckets', field.name, 'carryForward']) === 'Yes' ? (
                                                                                            <Form.Item label="Validity" required>
                                                                                                <Input.Group compact>
                                                                                                    <Form.Item
                                                                                                        name={[field.name, 'validity']}
                                                                                                        noStyle
                                                                                                        rules={[
                                                                                                            { required: true, message: 'Validity is required' },
                                                                                                            {
                                                                                                                validator: (_: any, value: any) => {
                                                                                                                    if (value == null || String(value).trim() === '') return Promise.resolve();
                                                                                                                    const num = Number(String(value).replace(/,/g, '').trim());
                                                                                                                    return (!Number.isNaN(num))
                                                                                                                        ? Promise.resolve()
                                                                                                                        : Promise.reject(new Error('Validity must be a number'));
                                                                                                                }
                                                                                                            }
                                                                                                        ]}
                                                                                                    >
                                                                                                        <Input
                                                                                                            style={{ width: 'calc(100% - 120px)' }}
                                                                                                            maxLength={5}
                                                                                                            placeholder="Enter Validity"
                                                                                                        />
                                                                                                    </Form.Item>

                                                                                                    <Form.Item
                                                                                                        name={[field.name, 'validityUnit']}
                                                                                                        noStyle
                                                                                                        rules={[{ required: true, message: 'Unit is required' }]}
                                                                                                        initialValue="Days"
                                                                                                    >
                                                                                                        <Select
                                                                                                            style={{ width: 120 }}
                                                                                                            options={[{ label: 'Days', value: 'Days' }]}
                                                                                                            open={false}
                                                                                                            showArrow={false}
                                                                                                            dropdownMatchSelectWidth={false}
                                                                                                            placeholder="Days"
                                                                                                        />
                                                                                                    </Form.Item>
                                                                                                </Input.Group>
                                                                                            </Form.Item>
                                                                                        ) : null
                                                                                    }
                                                                                </Form.Item>
                                                                            </Col>
                                                                        </Row>
                                                                    </Card>
                                                                ))}
                                                            </Card>
                                                        )}
                                                    </Form.List>
                                                </>
                                            )}
                                    </>
                                }

                            </Form>
                        </div>
                        <div className="drawer-btn-section">
                            {/*{*/}
                            {/*    drawerData.operation === OperationActionsEnum.NEW &&*/}
                            {/*    <Button type="primary" onClick={() => createPlan()}>*/}
                            {/*        Add*/}
                            {/*    </Button>*/}
                            {/*}*/}
                            {
                                drawerData.operation === OperationActionsEnum.NEW &&
                                <>
                                    <Button
                                        type="primary"
                                        onClick={() => createPlan()}
                                        disabled={showRequestApprovalButton}
                                    >
                                        Add
                                    </Button>

                                    {showRequestApprovalButton && (
                                        <ActionPermission action={ACTION_PERMISSION.REQUEST_PLAN_APPROVAL}>
                                            <Button
                                                type="primary"
                                                // onClick={requestApprovalForCreatedPlan}
                                                onClick={() => handleRequestApprovalBtnClick()}
                                                style={{ marginLeft: 8 }}
                                            >
                                                Request Approvals
                                            </Button>
                                        </ActionPermission>
                                    )}

                                </>
                            }
                            {
                                drawerData.operation === OperationActionsEnum.EDIT &&
                                <Button type="primary" onClick={() => updatePlan()}>
                                    Update
                                </Button>
                            }
                        </div>
                    </div>
                </Drawer>

                {/* QoS Profile Drawer */}
                <QosProfileDrawer
                    open={qosDrawerOpen}
                    onClose={closeQosDrawer}
                    bucketData={selectedBucket}
                />

                <BucketDetailsDrawer
                    open={bucketDetailsDrawerOpen}
                    onClose={closeBucketDrawer}
                />

                <ApprovalDrawer
                    open={approvalDrawerOpen}
                    onClose={() => setApprovalDrawerOpen(false)}
                    onSubmit={requestApprovalForCreatedPlan}
                    approvalConfigs={approvalConfigs}
                />


                {activeTab.startsWith("bucket-") && (
                    <div className="common-page-margin">
                        <div className="bordered-container" style={{ marginTop: "10px" }}>
                            <Table
                                className="common-basic-table custom-bordered-table"
                                columns={columnsBucketDetails}
                                dataSource={dataBucketDetails}
                                pagination={false}
                                showHeader={false}
                            />
                        </div>
                    </div>
                )}

                {activeTab.startsWith("qos-") && (
                    <div className="common-page-margin">
                        <div className="bordered-container" style={{ marginTop: "10px" }}>
                            <Table
                                className="common-basic-table custom-bordered-table"
                                columns={columnsBucketDetails}
                                dataSource={dataQosDetails}
                                pagination={false}
                                showHeader={false}
                            />
                        </div>
                    </div>
                )}

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

export default ProductCatalog;
