import {FC, useEffect, useState} from "react";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
import {InputsProps} from "../../../../components/common-search-panel/models/InputsProps.model.ts";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
import {formatValue} from "../../../../helpers/stringValidators.ts";
import CommonTabBar from "../../../../components/common-tab-bar/CommonTabBar.tsx";
import {Button, Drawer, Form, Input, Select} from "antd";
import CommonSquareButtonPreDefined
    from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import {ButtonTypeEnum} from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import {debounce, DrawerState, updateDrawerState} from "../../../../helpers/helperFunctions.tsx";
import OperationActionsEnum from "../../../../model/operationsActionsEnum.model.ts";
import {CloseOutlined} from "@ant-design/icons";
import BaseResponse from "../../../../model/baseResponse.ts";
import {QosModel, QosResponseModel} from "../../models/qos.model.ts";
import {
    createQosProfile,
    deleteQosProfile,
    editQosProfile,
    getQosProfiles
} from "../../services/qos.management.service.ts";
import DropdownValue from "../../../../model/dropdownValue.ts";
import showNotification from "../../../../services/notification.service.tsx";
import {DEBOUNCE_TIME_IN_MS} from "../../../../constants/validationConditions.ts";
import {QosCreationModel} from "../../models/qos.creation.model.ts";
import CommonConfirmModal from "../../../../components/common-confirm-modal/CommonConfirmModal.tsx";
import {useLocation} from "react-router-dom";

type UsersProps = object;

const QosManagement: FC<UsersProps> = () => {
    const location = useLocation();

    const isDefaultOptions: DropdownValue[] = [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' }
    ];

    const bandwidthUnitOptions: DropdownValue[] = [
        { label: 'Mbps', value: 'Mbps' },
        { label: 'Gbps', value: 'Gbps' }
    ];

    const [drawerData, setDrawerData] = useState<DrawerState>({
        isDrawerOpen: false,
        operation: OperationActionsEnum.NONE,
        drawerData: null
    });

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
    }>({currentPage: 1, currentItemPerPage: 10});

    const [formValues, setFormValues] = useState<{
        id: number | null;
        bngCode: string | null;
    }>({ id: null, bngCode: null });

    const [qosData, setQosData] = useState<BaseResponse<QosResponseModel> | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    const [deletingQos, setDeletingQos] = useState<QosResponseModel | null>(null);

    const [drawerForm] = Form.useForm();

    const searchPanelInputs: InputsProps[] = [
        {
            type: "INPUT",
            valueName: "id",
            label: "QoS ID",
            required: false,
            mainInput: true,
            placeholder: "Enter QoS ID"
        },
        {
            type: "INPUT",
            valueName: "bngCode",
            label: "BNG Code",
            required: false,
            mainInput: true,
            placeholder: "Enter BNG Code"
        }
    ];

    const qosColumns = [
        { title: 'QoS ID', dataIndex: 'id', key: 'id', render: formatValue },
        { title: 'BNG Code', dataIndex: 'bngCode', key: 'bngCode', render: formatValue },
        { title: 'QoS Profile Name', dataIndex: 'qosProfileName', key: 'qosProfileName', render: formatValue },
        { title: 'Uplink', dataIndex: 'upLink', key: 'upLink', render: formatValue },
        { title: 'Downlink', dataIndex: 'downLink', key: 'downLink', render: formatValue },
        { title: 'Created Date', dataIndex: 'createdDate', key: 'createdDate', render: formatValue },
        { title: 'Last Updated Date', dataIndex: 'updatedDate', key: 'updatedDate', render: formatValue },
        {
            title: "Action",
            key: "action",
            align: "center",
            width: 100,
            render: (_: any, record: any) => (
                <div>
                    <ActionPermission action={ACTION_PERMISSION.UPDATE_QOS_MANAGEMENT}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.EDIT}
                            onClick={() => {
                                // open edit drawer and populate form with selected record
                                openEditDrawer(record);
                            }}
                        />
                    </ActionPermission>
                    <ActionPermission action={ACTION_PERMISSION.DELETE_QOS_MANAGEMENT}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.DELETE}
                            onClick={() => handleDeleteClick(record)}
                        />
                    </ActionPermission>
                </div>
            )
        }
    ];

    const [queryParamsApplied, setQueryParamsApplied] = useState<boolean>(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const idParam = params.get('id');
        if (idParam) {
            const idNum = Number(idParam);
            if (Number.isFinite(idNum)) {
                setFormValues(prev => ({ ...prev, id: idNum }));
                setPaginationDetails(prev => ({ ...prev, currentPage: 1 }));
            }
        }
        setQueryParamsApplied(true);
    }, [location.search]);

    useEffect(() => {
        if (!queryParamsApplied) return;
        searchQos();
    }, [paginationDetails, formValues, queryParamsApplied]);

    const searchQos = async () => {

        try {
            const response = await getQosProfiles(
                paginationDetails.currentPage,
                paginationDetails.currentItemPerPage,
                formValues.id ?? undefined,
                formValues.bngCode ?? undefined
            );

            if (response) {
                setQosData(response);
            }
        } catch (err: any) {
            console.error("searchQos error:", err);
            const errorMessage = err?.response?.data?.message || "Failed to retrieve QoS profiles. Please try again.";
            showNotification("ERROR", errorMessage);
        }

    }

    const onSearchFormSubmit = (values?: {
        id: number | null;
        bngCode: string | null;
    }) => {
        setFormValues(values ?? { id: null, bngCode: null });
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
        let isDefaultValue = record.isDefault;

        if (record.isDefault === true) {
            isDefaultValue = 'true';
        } else if (record.isDefault === false) {
            isDefaultValue = 'false';
        }

        // Split uplink and downlink into value and unit
        const parseBandwidth = (bandwidth: string | number) => {
            if (!bandwidth) {
                return { value: '', unit: 'Mbps' };
            }

            const bwStr = String(bandwidth).trim();
            const regex = /^(\d+(?:\.\d+)?)([a-zA-Z]+)$/;
            const match = regex.exec(bwStr);

            if (match) {
                return {
                    value: match[1],
                    unit: match[2]
                };
            }

            return { value: bwStr, unit: 'Mbps' };
        };

        const uplink = parseBandwidth(record.upLink);
        const downlink = parseBandwidth(record.downLink);

        drawerForm.setFieldsValue({
            bngCode: record.bngCode,
            qosProfileName: record.qosProfileName,
            upLink: uplink.value,
            uplinkUnit: uplink.unit,
            downLink: downlink.value,
            downlinkUnit: downlink.unit,
            isDefault: isDefaultValue
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

    const createQos = async () => {
        try {
            await drawerForm.validateFields();

            const values = drawerForm.getFieldsValue(true);
            const uplinkWithUnit = `${values.upLink}${values.uplinkUnit}`;
            const downlinkWithUnit = `${values.downLink}${values.downlinkUnit}`;

            const reqBody: QosCreationModel = {
                bngCode: values.bngCode,
                qosProfileName: values.qosProfileName,
                upLink: uplinkWithUnit,
                downLink: downlinkWithUnit,
                isDefault: values.isDefault === 'true'
            };

            const response = await createQosProfile(reqBody);

            if (response) {
                showNotification("SUCCESS", 'QoS Profile created successfully');
                reloadPage();
            }
        } catch (err: any) {
            console.log("ERROR in creating QoS Profile:", err);
            if (err?.errorFields?.length > 0) {
                showNotification("ERROR", "Please fill in all required fields.");
            } else {
                const errorMessage = err?.response?.data?.message || "Failed to create QoS Profile. Please try again.";
                showNotification("ERROR", errorMessage);
            }
        }
        }

    const updateQos = async () => {
        try {
            await drawerForm.validateFields();
            const values = drawerForm.getFieldsValue(true);
            const uplinkWithUnit = `${values.upLink}${values.uplinkUnit}`;
            const downlinkWithUnit = `${values.downLink}${values.downlinkUnit}`;

            const id = drawerData.drawerData?.id ?? values.id;
            if (!id) {
                showNotification("ERROR", "QoS id is missing");
                return;
            }

            const reqBody: QosModel = {
                id: id,
                bngCode: values.bngCode,
                qosProfileName: values.qosProfileName,
                upLink: uplinkWithUnit,
                downLink: downlinkWithUnit,
                isDefault: values.isDefault === 'true'
            };

            const response = await editQosProfile(reqBody);

            if (response) {
                showNotification("SUCCESS", 'QoS Profile updated successfully');
                reloadPage();
            }
        } catch (err: any) {
            console.log("ERROR in updating QoS Profile:", err);
            const errorMessage = err?.response?.data?.message || "Failed to update QoS Profile. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    }

    const debouncedSearchQos = debounce(searchQos, DEBOUNCE_TIME_IN_MS);

    const reloadPage = () => {
        closeDrawer();
        debouncedSearchQos();
    }

    const handleDeleteClick = (qos: QosResponseModel) => {
        setDeletingQos(qos);
        setIsConfirmOpen(true);
        setDrawerData(prev => ({
            ...prev,
            operation: OperationActionsEnum.DELETE
        }));
    };

    const deleteUserConfirmation = async () => {
        if (!deletingQos) {
            showNotification("ERROR", "Something went wrong! Please try again shortly");
            return;
        }
        const idToDelete = (deletingQos as any).id;
        if (!idToDelete) {
            showNotification("ERROR", "Qos Id is missing");
            return;
        }
        try {
            const response = await deleteQosProfile(idToDelete);

            if (response) {
                showNotification("SUCCESS", "QoS Profile deleted successfully");
                reloadPage();
                cancelUserDeletion();
            } else {
                showNotification("ERROR", "Something went wrong! Please try again shortly");
            }
        } catch (err) {
            showNotification("ERROR", "Unable to delete QoS profile. Please try again.");
            cancelUserDeletion();
            console.log("Error in deleting QoS Profile:", err);
        }
    };

    const cancelUserDeletion = () => {
        setIsConfirmOpen(false);
        setDeletingQos(null);
        setDrawerData(prev => ({ ...prev, operation: OperationActionsEnum.NONE }));
    };

    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_QOS_MANAGEMENT}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Product Catalog</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>QoS Management</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    initialTabs={[{ key: "search", label: "QoS Management" }]}
                    initialActiveKey="search"
                />

                <div className="common-page-margin" style={{ marginTop: "0px" }}>
                    <CommonSearchPanel
                        inputs={searchPanelInputs}
                        title="Search Conditions"
                        isExpandBtnVisible={false}
                        onSubmit={onSearchFormSubmit}
                        onClear={() => onSearchFormSubmit({ id: null, bngCode: null })}
                    />

                    <div className="common-button-bar">
                        <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <ActionPermission action={ACTION_PERMISSION.ADD_QOS_MANAGEMENT}>
                                <Button
                                    type="primary"
                                    size="small"
                                    style={{fontSize: 12}}
                                    onClick={openCreateDrawer}
                                >
                                    Create New QoS Profile
                                </Button>
                            </ActionPermission>
                        </div>
                    </div>

                    <div>
                        <DynamicTable
                            columns={qosColumns}
                            data={qosData?.data?.qosProfiles || []}
                            pagination={{
                                current: paginationDetails.currentPage,
                                pageSize: paginationDetails.currentItemPerPage,
                                total: Number(qosData?.pageDetails?.totalRecords ?? qosData?.data?.qosProfiles.length ?? 0),
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
                            {drawerData.operation === OperationActionsEnum.NEW && "Add QoS Profile"}
                            {drawerData.operation === OperationActionsEnum.EDIT && "Edit QoS Profile"}
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
                                    label="BNG Code"
                                    name="bngCode"
                                    rules={[{ required: true, message: 'BNG Code is required' }]}
                                >
                                    <Input
                                        placeholder="Enter BNG Code"
                                        disabled={drawerData.operation === OperationActionsEnum.EDIT}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="QoS Profile Name"
                                    name="qosProfileName"
                                    rules={[{ required: true, message: 'QoS Profile Name is required' }]}
                                >
                                    <Input placeholder="Enter QoS Profile Name" />
                                </Form.Item>

                                <Form.Item
                                    label="Uplink"
                                    required
                                    validateStatus={
                                        drawerForm.getFieldError('uplink').length ||
                                        drawerForm.getFieldError('uplinkUnit').length
                                            ? 'error'
                                            : ''
                                    }
                                    help={
                                        drawerForm.getFieldError('uplink')[0] ||
                                        drawerForm.getFieldError('uplinkUnit')[0]
                                    }
                                >
                                    <Input.Group compact>
                                        <Form.Item
                                            name="upLink"
                                            noStyle
                                            rules={[
                                                { required: true, message: 'Uplink is required' },
                                                {
                                                    validator: (_, value) => {
                                                        if (!value) return Promise.resolve();
                                                        const num = Number(value);
                                                        if (Number.isNaN(num)) {
                                                            return Promise.reject(new Error('Uplink must be a number'));
                                                        }
                                                        if (num <= 0) {
                                                            return Promise.reject(new Error('Bandwidth must be greater than zero'));
                                                        }
                                                        return Promise.resolve();
                                                    }
                                                }
                                            ]}
                                        >
                                            <Input
                                                type="number"
                                                style={{ width: 'calc(100% - 120px)' }}
                                                placeholder="Enter Uplink"
                                                maxLength={9}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="uplinkUnit"
                                            noStyle
                                            rules={[{ required: true, message: 'Unit is required' }]}
                                            initialValue="Mbps"
                                        >
                                            <Select style={{ width: 120 }} options={bandwidthUnitOptions} />
                                        </Form.Item>
                                    </Input.Group>
                                </Form.Item>

                                <Form.Item
                                    label="Downlink"
                                    colon={false}
                                    required
                                    validateStatus={
                                        drawerForm.getFieldError('downLink').length ||
                                        drawerForm.getFieldError('downlinkUnit').length
                                            ? 'error'
                                            : ''
                                    }
                                    help={
                                        drawerForm.getFieldError('downLink')[0] ||
                                        drawerForm.getFieldError('downlinkUnit')[0]
                                    }
                                >
                                    <Input.Group compact>
                                        <Form.Item
                                            name="downLink"
                                            noStyle
                                            rules={[
                                                { required: true, message: 'Downlink is required' },
                                                {
                                                    validator: (_, value) => {
                                                        if (!value) return Promise.resolve();
                                                        const num = Number(value);
                                                        if (Number.isNaN(num)) {
                                                            return Promise.reject(new Error('Downlink must be a number'));
                                                        }
                                                        if (num <= 0) {
                                                            return Promise.reject(new Error('Bandwidth must be greater than zero'));
                                                        }
                                                        return Promise.resolve();
                                                    }
                                                }
                                            ]}
                                        >
                                            <Input
                                                type="number"
                                                style={{ width: 'calc(100% - 120px)' }}
                                                placeholder="Enter Downlink"
                                                maxLength={9}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="downlinkUnit"
                                            noStyle
                                            rules={[{ required: true, message: 'Unit is required' }]}
                                            initialValue="Mbps"
                                        >
                                            <Select style={{ width: 120 }} options={bandwidthUnitOptions} />
                                        </Form.Item>
                                    </Input.Group>
                                </Form.Item>

                                <Form.Item
                                    label="Is Default"
                                    name="isDefault"
                                    rules={[{ required: true, message: 'Is Default is required' }]}
                                >
                                    <Select
                                        placeholder="Select Is Default"
                                        options={isDefaultOptions}
                                        allowClear
                                    />
                                </Form.Item>
                            </Form>
                        </div>
                        <div className="drawer-btn-section">
                            {
                                drawerData.operation === OperationActionsEnum.NEW &&
                                <Button type="primary" onClick={() => createQos()}>
                                    Add
                                </Button>
                            }
                            {
                                drawerData.operation === OperationActionsEnum.EDIT &&
                                <Button type="primary" onClick={() => updateQos()}>
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
                        title="Are you sure you want to delete this record?"
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        btnDanger={true}
                        onOk={deleteUserConfirmation}
                        onCancel={cancelUserDeletion}
                    />
                }
            </>
        </ActionPermission>
    )
}

export default QosManagement;
