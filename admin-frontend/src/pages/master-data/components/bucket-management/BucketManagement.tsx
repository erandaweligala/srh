import {FC, useEffect, useState} from "react";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
import {InputsProps} from "../../../../components/common-search-panel/models/InputsProps.model.ts";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
import {formatValue} from "../../../../helpers/stringValidators.ts";
import CommonTabBar from "../../../../components/common-tab-bar/CommonTabBar.tsx";
import {Button, Drawer, Form, Input, Select, TimePicker} from "antd";
import dayjs from "dayjs";
import CommonSquareButtonPreDefined
    from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import {ButtonTypeEnum} from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import {debounce, DrawerState, updateDrawerState} from "../../../../helpers/helperFunctions.tsx";
import OperationActionsEnum from "../../../../model/operationsActionsEnum.model.ts";
import {CloseOutlined} from "@ant-design/icons";
import BaseResponse from "../../../../model/baseResponse.ts";
import DropdownValue from "../../../../model/dropdownValue.ts";
import showNotification from "../../../../services/notification.service.tsx";
import {DEBOUNCE_TIME_IN_MS} from "../../../../constants/validationConditions.ts";
import CommonConfirmModal from "../../../../components/common-confirm-modal/CommonConfirmModal.tsx";
import {createBucket, deleteBucket, editBucket, getBuckets} from "../../services/bucket.management.service.ts";
import {BucketResponseModel} from "../../models/bucket.model.ts";
import {BucketCreationModel} from "../../models/bucket.creation.model.ts";
import {BucketUpdateModel} from "../../models/bucket.update.model.ts";
import {Link} from "react-router-dom";
import INTERNAL_ROUTES from "../../../../constants/internalRoutes.ts";
import {getQosProfiles} from "../../services/qos.management.service.ts";

type UsersProps = object;

const BucketManagement: FC<UsersProps> = () => {

    const timeFormat = 'HH:mm';

    const [drawerData, setDrawerData] = useState<DrawerState>({
        isDrawerOpen: false,
        operation: OperationActionsEnum.NONE,
        drawerData: null
    });

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
    }>({currentPage: 1, currentItemPerPage: 50});

    const [formValues, setFormValues] = useState<{
        bucketId: string | null;
        bucketName: string | null;
    }>({ bucketId: null, bucketName: null });

    const [bucketsData, setBucketsData] = useState<BaseResponse<BucketResponseModel> | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    const [deletingBucket, setDeletingBucket] = useState<BucketResponseModel | null>(null);

    const [qosOptions, setQosOptions] = useState<any[]>([]);
    const [isLoadingQosOptions, setIsLoadingQosOptions] = useState<boolean>(false);

    const [searchForm, setSearchForm] = useState<Record<string, string>>({});

    const [drawerForm] = Form.useForm();

    const searchPanelInputs: InputsProps[] = [
        {
            type: "INPUT",
            valueName: "bucketId",
            label: "Bucket ID",
            required: false,
            mainInput: true,
            placeholder: "Enter Bucket ID"
        },
        {
            type: "INPUT",
            valueName: "bucketName",
            label: "Bucket Name",
            required: false,
            mainInput: true,
            placeholder: "Enter Bucket Name"
        }
    ];

    const bucketColumns = [
        { title: 'Bucket ID', dataIndex: 'bucketId', key: 'bucketId', render: formatValue },
        { title: 'Bucket Name', dataIndex: 'bucketName', key: 'bucketName', render: formatValue },
        { title: 'Bucket Type', dataIndex: 'bucketType', key: 'bucketType', render: formatValue },
        // { title: 'QoS ID', dataIndex: 'qosId', key: 'qosId', render: formatValue },
        {
            title: 'QoS ID',
            dataIndex: 'qosId',
            key: 'qosId',
            render: (_: any, record: any) => {
                const qosId = record?.qosId;
                const display = formatValue(qosId);
                return qosId != null
                    ? <Link to={`${INTERNAL_ROUTES.QOS_MANAGEMENT}?id=${encodeURIComponent(String(qosId))}`}>{display}</Link>
                    : display;
            }
        },
        { title: 'Priority', dataIndex: 'priority', key: 'priority', render: formatValue },
        { title: 'Time Window', dataIndex: 'timeWindow', key: 'timeWindow', render: formatValue },
        {
            title: "Action",
            key: "action",
            align: "center",
            width: 100,
            render: (_: any, record: any) => (
                <div>
                    <ActionPermission action={ACTION_PERMISSION.UPDATE_BUCKET}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.EDIT}
                            onClick={() => {
                                openEditDrawer(record);
                            }}
                        />
                    </ActionPermission>
                    <ActionPermission action={ACTION_PERMISSION.DELETE_BUCKET}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.DELETE}
                            onClick={() => handleDeleteClick(record)}
                        />
                    </ActionPermission>
                </div>
            )
        }
    ];

    useEffect(() => {
        searchBuckets();
    }, [paginationDetails, formValues]);

    useEffect(() => {
        fetchQosProfiles();
    }, []);

    const fetchQosProfiles = async () => {
        try {
            setIsLoadingQosOptions(true);
            const response = await getQosProfiles(1, 1000);
            
            if (response && response.data?.qosProfiles) {
                const options = response.data.qosProfiles.map((qos: any) => ({
                    label: qos.qosProfileName,
                    value: qos.id
                }));
                setQosOptions(options);
            }
        } catch (err: any) {
            console.error("fetchQosProfiles error:", err);
            showNotification("ERROR", "Failed to fetch QoS profiles");
        } finally {
            setIsLoadingQosOptions(false);
        }
    }

    const searchBuckets = async () => {
        try {
            const response = await getBuckets(
                paginationDetails.currentPage,
                paginationDetails.currentItemPerPage,
                formValues?.bucketId ?? undefined,
                formValues?.bucketName ?? undefined
            );

            if (response) {
                setBucketsData(response);
            }
        } catch (err: any) {
            console.error("searchBuckets error:", err);
            const errorMessage = err?.response?.data?.message || "Failed to retrieve buckets. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    }

    const onSearchFormSubmit = (values?: {
        bucketId: string | null;
        bucketName: string | null;
    }) => {
        setFormValues(values ?? { bucketId: null, bucketName: null });
        setPaginationDetails((current) => ({ ...current, currentPage: 1 }));
    };

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
    };

    const openCreateDrawer = () => {
        drawerForm.resetFields();
        updateDrawerState(setDrawerData, {
            isDrawerOpen: true,
            operation: OperationActionsEnum.NEW,
            drawerData: null
        });
    }

    const openEditDrawer = (record: any) => {
        const timeRange = record.timeWindow ? record.timeWindow.split('-') : [];
        const startTime = timeRange[0] ? dayjs(timeRange[0], timeFormat) : null;
        const endTime = timeRange[1] ? dayjs(timeRange[1], timeFormat) : null;

        drawerForm.setFieldsValue({
            bucketId: record.bucketId,
            bucketName: record.bucketName,
            bucketType: record.bucketType,
            qosId: record.qosId,
            priority: record.priority,
            timeWindow: (startTime && endTime) ? [startTime, endTime] : null,
        });

        updateDrawerState(setDrawerData, {
            isDrawerOpen: true,
            operation: OperationActionsEnum.EDIT,
            drawerData: record
        });
    };

    const closeDrawer = () => {
        setDrawerData({
            isDrawerOpen: false,
            operation: OperationActionsEnum.NONE,
            drawerData: null
        })
        drawerForm.resetFields();
    }

    const createNewBucket = async () => {
        try {
            await drawerForm.validateFields();

            const values = drawerForm.getFieldsValue(true);

            const timeWindowValue = values.timeWindow;
            const timeWindowStr = (timeWindowValue && timeWindowValue.length === 2)
                ? `${timeWindowValue[0].format(timeFormat)}-${timeWindowValue[1].format(timeFormat)}`
                : "";

            const reqBody: BucketCreationModel = {
                bucketId: values.bucketId,
                bucketName: values.bucketName,
                bucketType: values.bucketType,
                qosId: values.qosId,
                priority: Number(values.priority),
                timeWindow: timeWindowStr
            };

            const response = await createBucket(reqBody);

            if (response) {
                showNotification("SUCCESS", 'Bucket created successfully');
                reloadPage();
            }
        } catch (err: any) {
            console.log("ERROR in creating Bucket:", err);
            const errorMessage = err?.response?.data?.message || "Failed to create Bucket. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    }

    const updateBucket = async () => {
        try {
            await drawerForm.validateFields();
            const values = drawerForm.getFieldsValue(true);

            const id = drawerData.drawerData?.id ?? values.id;
            if (!id) {
                showNotification("ERROR", "ID is missing");
                return;
            }

            const timeWindowValue = values.timeWindow;
            const timeWindowStr = (timeWindowValue && timeWindowValue.length === 2)
                ? `${timeWindowValue[0].format(timeFormat)}-${timeWindowValue[1].format(timeFormat)}`
                : "";

            const reqBody: BucketUpdateModel = {
                bucketId: values.bucketId,
                bucketName: values.bucketName,
                qosId: values.qosId,
                priority: Number(values.priority),
                timeWindow: timeWindowStr
            };

            const response = await editBucket(reqBody);

            if (response) {
                showNotification("SUCCESS", 'Bucket updated successfully');
                reloadPage();
            }
        } catch (err: any) {
            console.log("ERROR in updating Bucket:", err);
            const errorMessage = err?.response?.data?.message || "Failed to update Bucket. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    }

    const debouncedSearchBuckets = debounce(searchBuckets, DEBOUNCE_TIME_IN_MS);

    const reloadPage = () => {
        closeDrawer();
        debouncedSearchBuckets();
    }

    const handleDeleteClick = (bucket: BucketResponseModel) => {
        setDeletingBucket(bucket);
        setIsConfirmOpen(true);
        setDrawerData(prev => ({
            ...prev,
            operation: OperationActionsEnum.DELETE
        }));
    };

    const deleteBucketConfirmation = async () => {
        if (!deletingBucket) {
            showNotification("ERROR", "Something went wrong! Please try again shortly");
            return;
        }
        const idToDelete = (deletingBucket as any).id;
        if (!idToDelete) {
            showNotification("ERROR", "ID is missing");
            return;
        }
        try {
            const response = await deleteBucket(idToDelete);

            if (response) {
                showNotification("SUCCESS", "Bucket deleted successfully");
                reloadPage();
                cancelBucketDeletion();
            } else {
                showNotification("ERROR", "Something went wrong! Please try again shortly");
            }
        } catch (err) {
            showNotification("ERROR", "Unable to delete Bucket. Please try again.");
            cancelBucketDeletion();
            console.log("Error in deleting Bucket:", err);
        }
    };

    const cancelBucketDeletion = () => {
        setIsConfirmOpen(false);
        setDeletingBucket(null);
        setDrawerData(prev => ({ ...prev, operation: OperationActionsEnum.NONE }));
    };

    const isCreateDrawer = drawerData.operation === OperationActionsEnum.NEW;


    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_BUCKET}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Product Catalog</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Bucket Management</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    initialTabs={[{ key: "search", label: "Bucket Management" }]}
                    initialActiveKey="search"
                />

                <div className="common-page-margin" style={{ marginTop: "0px" }}>
                    <CommonSearchPanel
                        inputs={searchPanelInputs}
                        title="Search Conditions"
                        isExpandBtnVisible={false}
                        onSubmit={onSearchFormSubmit}
                        onClear={() => onSearchFormSubmit({ bucketId: null, bucketName: null })}
                        initialValues={searchForm}
                    />

                    <div className="common-button-bar">
                        <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <ActionPermission action={ACTION_PERMISSION.ADD_NEW_BUCKET}>
                                <Button
                                    type="primary"
                                    size="small"
                                    style={{fontSize: 12}}
                                    onClick={openCreateDrawer}
                                >
                                    Create New Bucket
                                </Button>
                            </ActionPermission>
                        </div>
                    </div>

                    <div>
                        <DynamicTable
                            columns={bucketColumns}
                            data={bucketsData?.data?.buckets || []}
                            pagination={{
                                current: paginationDetails.currentPage,
                                pageSize: paginationDetails.currentItemPerPage,
                                total: Number(bucketsData?.pageDetails?.totalRecords ?? bucketsData?.data?.buckets.length ?? 0),
                                onChange: onTableChange
                            }}
                            scroll={{ x: 0 }}
                        />
                    </div>
                </div>

                <Drawer
                    className="common-drawer"
                    width={500}
                    title={
                        <span className="font-2xl-semi-bold">
                            {drawerData.operation === OperationActionsEnum.NEW && "Create New Bucket"}
                            {drawerData.operation === OperationActionsEnum.EDIT && "Edit New Bucket"}
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
                                colon={false}
                            >
                                <Form.Item
                                    label="Bucket ID"
                                    name="bucketId"
                                    rules={[{ required: true, message: 'Bucket ID is required' }]}
                                >
                                    <Input placeholder="Enter Bucket ID" disabled={drawerData.operation === OperationActionsEnum.EDIT} />
                                </Form.Item>
                                <Form.Item
                                    label="Bucket Name"
                                    name="bucketName"
                                    rules={
                                        isCreateDrawer
                                            ? [{ required: true, message: 'Bucket Name is required' }]
                                            : []
                                    }
                                >
                                    <Input placeholder="Enter Bucket Name" />
                                </Form.Item>

                                <Form.Item
                                    label="Bucket Type"
                                    name="bucketType"
                                    rules={
                                        isCreateDrawer
                                            ? [{ required: true, message: 'Bucket Type is required' }]
                                            : []
                                    }
                                >
                                    <Input
                                        placeholder="Enter Bucket Type"
                                        disabled={!isCreateDrawer}
                                    />
                                </Form.Item>


                                <Form.Item
                                    label="QoS Name"
                                    name="qosId"
                                    rules={
                                        isCreateDrawer
                                            ? [{ required: true, message: 'QoS Name is required' }]
                                            : []
                                    }
                                >
                                    <Select 
                                        placeholder="Select QoS Name"
                                        loading={isLoadingQosOptions}
                                        options={qosOptions}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Priority"
                                    name="priority"
                                    rules={
                                        isCreateDrawer
                                            ? [{ required: true, message: 'Priority is required' }]
                                            : []
                                    }
                                >
                                    <Input placeholder="Enter Priority" />
                                </Form.Item>

                                <Form.Item
                                    label="Time Window"
                                    name="timeWindow"
                                    rules={
                                        isCreateDrawer
                                            ? [{ required: true, message: 'Time Window is required' }]
                                            : []
                                    }
                                >
                                    <TimePicker.RangePicker
                                        className="range-picker-centered"
                                        style={{ width: '100%' }}
                                        format={timeFormat}
                                    />
                                </Form.Item>
                            </Form>
                        </div>
                        <div className="drawer-btn-section">
                            {
                                drawerData.operation === OperationActionsEnum.NEW &&
                                <Button type="primary" onClick={() => createNewBucket()}>
                                    Add
                                </Button>
                            }
                            {
                                drawerData.operation === OperationActionsEnum.EDIT &&
                                <Button type="primary" onClick={() => updateBucket()}>
                                    Update
                                </Button>
                            }
                        </div>
                    </div>
                </Drawer>

                {
                    drawerData.operation === OperationActionsEnum.DELETE &&
                    <CommonConfirmModal
                        isOpen={isConfirmOpen}
                        title="Are you sure you want to delete this bucket?"
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        btnDanger={true}
                        onOk={deleteBucketConfirmation}
                        onCancel={cancelBucketDeletion}
                    />
                }

            </>
        </ActionPermission>
    )
}

export default BucketManagement;
