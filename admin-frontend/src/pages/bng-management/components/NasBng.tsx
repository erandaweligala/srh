import { FC, useState, useRef, useEffect } from "react";
import ACTION_PERMISSION from "../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../components/access-control/action-permission/ActionPermission.tsx";
import DynamicTable from "../../../components/dynamic-table/DynamicTable.tsx";
import { Button, Drawer, Form, Descriptions, Card, Input, Select } from "antd";
import DynamicForm from "../../../components/dynamic-form/DynamicForm.tsx";
import { renderStatusTag } from "../../../helpers/helperFunctions.tsx";
import { formatValue } from "../../../helpers/stringValidators.ts";
import CommonSquareButtonPreDefined
    from "../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import { ButtonTypeEnum } from "../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import { CloseOutlined } from "@ant-design/icons";
import CommonTabBar, { CommonTabBarRef } from "../../../components/common-tab-bar/CommonTabBar.tsx";
import ApiCommonResponse from "../../../model/apiCommonResponse.ts";
import { BngModel, BngResponseModel } from "../models/bng.model.ts";
import { createBng, getVendorConfigsList, searchBng, updateBng } from "../services/bng.management.service.ts";
import CommonSearchPanel from "../../../components/common-search-panel/CommonSearchPanel.tsx";
import { InputsProps } from "../../../components/common-search-panel/models/InputsProps.model.ts";
import DropdownValue from "../../../model/dropdownValue.ts";
import showNotification from "../../../services/notification.service.tsx";

type UsersProps = object;

// Data type
type NasBngRow = {
    key: number;
    bngId: string;
    bngIp: string;
    bngName: string;
    bngTypeVendor: string;
    modelVersion: string;
    status: string;
    createdDate: string;
    createdBy: string;
    updatedDate: string;
    updatedBy: string;
    nasIpAddress: string;
    nasIdentifier: string;
    coaIp: string;
    coaPort: string;
    sharedSecret: string;
    location: string;
    serviceId?: string; // Add serviceId field
    [key: string]: string | number | undefined; // for dynamic access
};

const NasBng: FC<UsersProps> = () => {

    const statusOptions: DropdownValue[] = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
    ];

    // Tab management
    const tabBarRef = useRef<CommonTabBarRef>(null);
    const [activeTab, setActiveTab] = useState("search");
    const [tabDataMap, setTabDataMap] = useState<Record<string, NasBngRow>>({});
    const [viewRecord, setViewRecord] = useState<NasBngRow | null>(null);
    const [searchForm, setSearchForm] = useState<Record<string, string>>({});

    // Drawers & form state for Create, Edit and View
    const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
    const [editDrawerVisible, setEditDrawerVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<NasBngRow | null>(null);
    // create forms
    const [identFormCreate] = Form.useForm();
    const [connFormCreate] = Form.useForm();
    const [opFormCreate] = Form.useForm();
    // edit forms
    const [identFormEdit] = Form.useForm();
    const [connFormEdit] = Form.useForm();
    const [opFormEdit] = Form.useForm();

    type SearchFormValues = {
        bngId?: string | null;
        bngName?: string | null;
        bngIp?: string | null;
        status?: string | null;
    };
    const initialSearchFormValues: SearchFormValues = {
        bngId: null,
        bngName: null,
        bngIp: null,
        status: null
    };
    const [formValues, setFormValues] = useState<SearchFormValues>(initialSearchFormValues);

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
    }>({ currentPage: 1, currentItemPerPage: 10 });

    const [bngData, setBngData] = useState<ApiCommonResponse<BngResponseModel> | null>(null);
    const [vendorOptions, setVendorOptions] = useState<DropdownValue[]>([]);

    // Update viewRecord when active tab changes
    useEffect(() => {
        if (activeTab.startsWith("view-")) {
            setViewRecord(tabDataMap[activeTab] || null);
        } else {
            setViewRecord(null);
        }
    }, [activeTab, tabDataMap]);

    const searchPanelInputs: InputsProps[] = [
        {
            type: "INPUT",
            valueName: "bngId",
            label: "BNG ID",
            required: false,
            mainInput: true,
            placeholder: "Enter BNG ID"
        },
        {
            type: "INPUT",
            valueName: "bngName",
            label: "BNG Name",
            required: false,
            mainInput: true,
            placeholder: "Enter BNG Name"
        },
        {
            type: "INPUT",
            valueName: "bngIp",
            label: "BNG IP",
            required: false,
            mainInput: true,
            placeholder: "Enter BNG IP"
        },
        {
            type: "DROPDOWN",
            valueName: "status",
            label: "Status",
            required: false,
            mainInput: false,
            placeholder: "Select Status",
            values: statusOptions
        }
    ];

    // Columns array
    const columns = [
        { title: 'BNG ID', dataIndex: 'bngId', key: 'bngId', render: formatValue },
        { title: 'BNG Name', dataIndex: 'bngName', key: 'bngName', render: formatValue },
        { title: 'NAS IP', dataIndex: 'nasIpAddress', key: 'nasIpAddress', render: formatValue },
        { title: 'BNG Type / Vendor', dataIndex: 'bngTypeVendor', key: 'bngTypeVendor', render: formatValue },
        { title: 'Model / Version', dataIndex: 'modelVersion', key: 'modelVersion', render: formatValue },
        { title: 'Status', dataIndex: 'status', key: 'status', width: 120, align: 'center', render: renderStatusTag },
        { title: 'Created Date', dataIndex: 'createdDate', key: 'createdDate', render: formatValue },
        { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy', render: formatValue },
        { title: 'Last Modified Date', dataIndex: 'updatedDate', key: 'updatedDate', render: formatValue },
        { title: 'Last Modified By', dataIndex: 'updatedBy', key: 'updatedBy', render: formatValue },
        {
            title: "Action",
            key: "action",
            width: 140,
            fixed: "right",
            align: "center",
            render: (_: any, record: NasBngRow) => (
                <div>
                    <ActionPermission action={ACTION_PERMISSION.VIEW_BNG_ACTION}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.VIEW}
                            onClick={() => {
                                const tabKey = `view-${record.bngId}`;
                                const tabLabel = "BNG Details";

                            setTabDataMap(prev => ({
                                ...prev,
                                [tabKey]: record
                            }));

                                tabBarRef.current?.openTab({ key: tabKey, label: tabLabel });
                                setActiveTab(tabKey);
                            }}
                        />
                    </ActionPermission>

                            <ActionPermission action={ACTION_PERMISSION.UPDATE_BNG_ACTION}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.EDIT}
                            onClick={async () => {
                                // load vendor options first so the Select has items
                                await fetchBngNames();
                                // open edit drawer and populate edit forms with the clicked row's data
                                setEditingRecord(record);
                                // populate identification
                                identFormEdit.setFieldsValue({
                                    bngId: record.bngId,
                                    bngName: record.bngName,
                                    bngIp: record.bngIp,
                                    bngTypeVendor: record.bngTypeVendor,
                                    modelVersion: record.modelVersion,
                                });
                                // populate connectivity if present on record
                                connFormEdit.setFieldsValue({
                                    nasIpAddress: record.nasIpAddress || undefined,
                                    nasIdentifier: record.nasIdentifier || undefined,
                                    coaIp: record.coaIp || undefined,
                                    coaPort: record.coaPort || undefined,
                                    sharedSecret: record.sharedSecret || undefined,
                                });
                                // operational
                                opFormEdit.setFieldsValue({
                                    location: record.location || undefined,
                                    status: record.status || undefined,
                                });
                                setEditDrawerVisible(true);
                            }}
                        />
                    </ActionPermission>
                </div>
            )
        }
    ];

    // Helper to display values in the View drawer: show actual value, or '-' when missing
    const displayViewValue = (val?: string | number | null) => {
        if (val === undefined || val === null || val === '') return '-';
        return val;
    }

    useEffect(() => {
        getBngData();
    }, [paginationDetails, formValues]);

    const fetchBngNames = async () => {
        try {
            const response = await getVendorConfigsList();
            if (response && response.data) {
                const names = response.data.map((item: any) => ({
                    label: item.vendorName,
                    value: item.vendorName
                }));
                setVendorOptions(names);
            }
        } catch (error) {
            console.error("Error fetching vendor configs:", error);
        }
    };

    const getBngData = async () => {

        const response = await searchBng(
            {
                page: paginationDetails.currentPage,
                size: paginationDetails.currentItemPerPage,
                bngId: formValues?.bngId ?? undefined,
                bngName: formValues?.bngName ?? undefined,
                bngIp: formValues?.bngIp ?? undefined,
                status: formValues?.status ?? undefined
            }
        );

        if (response) {
            setBngData(response);
        }
    }

    const onSearchFormSubmit = (values?: SearchFormValues) => {
        setFormValues(values ?? initialSearchFormValues);
        setSearchForm(values as any ?? {});
        setPaginationDetails((current) => ({ ...current, currentPage: 1 }));
    };

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
    };

    const createNewBng = async () => {
        try {
            // validate all create forms
            await identFormCreate.validateFields();
            await connFormCreate.validateFields();
            await opFormCreate.validateFields();

            // gather values
            const ident = identFormCreate.getFieldsValue(true);
            const conn = connFormCreate.getFieldsValue(true);
            const op = opFormCreate.getFieldsValue(true);

            const reqBody: BngModel = {
                // identification
                bngId: ident.bngId,
                bngName: ident.bngName,
                bngIp: ident.bngIp,
                bngTypeVendor: ident.bngTypeVendor,
                modelVersion: ident.modelVersion,

                // connectivity
                nasIpAddress: conn.nasIpAddress,
                nasIdentifier: conn.nasIdentifier,
                coaIp: conn.coaIp,
                coaPort:
                    conn.coaPort !== undefined &&
                        conn.coaPort !== null &&
                        conn.coaPort !== ''
                        ? Number(conn.coaPort)
                        : undefined,
                sharedSecret: conn.sharedSecret,

                // operational
                location: op.location,
                status: op.status,


            };

            const response = await createBng(reqBody);

            if (response) {
                showNotification("SUCCESS", "BNG created successfully");

                identFormCreate.resetFields();
                connFormCreate.resetFields();
                opFormCreate.resetFields();

                setCreateDrawerVisible(false);
                getBngData();
            }
        } catch (err: any) {
            console.log("ERROR in creating BNG:", err);
            const errorMessage = err?.response?.data?.message || "Failed to create BNG. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    };

    const updateBngHandler = async () => {
        if (!editingRecord) {
            showNotification("ERROR", "No BNG selected for update");
            return;
        }

        try {
            await identFormEdit.validateFields();
            await connFormEdit.validateFields();
            await opFormEdit.validateFields();

            const ident = identFormEdit.getFieldsValue(true);
            const conn = connFormEdit.getFieldsValue(true);
            const op = opFormEdit.getFieldsValue(true);

            const reqBody: BngModel = {
                // identifier
                bngId: editingRecord.bngId,

                // identification
                bngName: ident.bngName,
                bngIp: ident.bngIp,
                bngTypeVendor: ident.bngTypeVendor,
                modelVersion: ident.modelVersion,

                // connectivity
                nasIpAddress: conn.nasIpAddress,
                nasIdentifier: conn.nasIdentifier,
                coaIp: conn.coaIp,
                coaPort: Number(conn.coaPort),
                sharedSecret: conn.sharedSecret,

                // operational
                location: op.location,
                status: op.status,


            };

            const response = await updateBng(reqBody);

            if (response) {
                showNotification("SUCCESS", "BNG updated successfully");
                setEditDrawerVisible(false);
                setEditingRecord(null);
                getBngData();
            }
        } catch (err: any) {
            console.log("ERROR in updating BNG:", err);
            const errorMessage = err?.response?.data?.message || "Failed to update BNG. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    };


    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_BNG}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>NAS/BNG</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    ref={tabBarRef}
                    initialTabs={[{ key: "search", label: "NAS/BNG" }]}
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
                            onClear={() => onSearchFormSubmit(initialSearchFormValues)}
                            initialValues={searchForm}
                        />

                        <div className="common-button-bar">
                                    <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                        <ActionPermission action={ACTION_PERMISSION.ADD_NEW_BNG_ACTION}>
                                            <Button
                                                type="primary"
                                                size="small"
                                                style={{ fontSize: 12 }}
                                                onClick={() => {
                                                    // open create drawer and reset create forms
                                                    fetchBngNames();
                                                    identFormCreate.resetFields();
                                                    connFormCreate.resetFields();
                                                    opFormCreate.resetFields();
                                                    setCreateDrawerVisible(true);
                                                }}
                                            >
                                                Add New
                                            </Button>
                                        </ActionPermission>
                                    </div>
                        </div>

                        <div>
                            <DynamicTable
                                columns={columns}
                                data={bngData?.data?.["BNGData"] || []}
                                pagination={{
                                    current: paginationDetails.currentPage,
                                    pageSize: paginationDetails.currentItemPerPage,
                                    total: Number(bngData?.data?.pageDetails.totalRecords ?? bngData?.data?.["BNGData"].length ?? 0),
                                    onChange: onTableChange
                                }}
                                scroll={{ x: 1450 }}
                            />
                        </div>

                        {/* Create Drawer */}
                        <Drawer
                            title="Create New BNG"
                            width={500}
                            onClose={() => setCreateDrawerVisible(false)}
                            open={createDrawerVisible}
                            bodyStyle={{ paddingBottom: 80 }}
                            destroyOnClose
                            className="common-drawer"
                            closeIcon={<CloseOutlined className="custom-close-icon" />}
                        >
                            <div className="drawer-body">
                                <div className="drawer-form-content">

                                    <Card title="BNG Identification" size="small" bordered style={{ marginBottom: 12 }} headStyle={{ backgroundColor: 'var(--tertiary-background-color)' }}>
                                        <DynamicForm
                                            form={identFormCreate}
                                            mode="form"
                                            labelCol={{ span: 7 }}
                                            wrapperCol={{ span: 17 }}
                                            fieldConfigs={[
                                                { type: 'INPUT', valueName: 'bngId', label: 'BNG ID', required: true, placeholder: 'Enter BNG ID', maxLength: 36, form: identFormCreate },
                                                { type: 'INPUT', valueName: 'bngName', label: 'BNG Name', required: true, placeholder: 'Enter BNG Name', maxLength: 36, form: identFormCreate },
                                                { type: 'DROPDOWN', valueName: 'bngTypeVendor', label: 'BNG Type/Vendor', required: true, placeholder: 'Select BNG Type/Vendor', values: vendorOptions },
                                                { type: 'INPUT', valueName: 'modelVersion', label: 'Model/Version', required: true, placeholder: 'Enter Model/Version', maxLength: 20, alphanumericOnly: true, form: identFormCreate },
                                            ]}
                                        />
                                    </Card>


                                    <Card title="Connectivity" size="small" bordered style={{ marginBottom: 12 }} headStyle={{ backgroundColor: 'var(--tertiary-background-color)' }}>
                                        <DynamicForm
                                            form={connFormCreate}
                                            mode="form"
                                            labelCol={{ span: 7 }}
                                            wrapperCol={{ span: 17 }}
                                            fieldConfigs={[
                                                { type: 'INPUT', valueName: 'nasIpAddress', label: 'NAS-IP-Address', required: true, placeholder: 'Enter NAS IP', maxLength: 36, ipOnly: true, form: connFormCreate },
                                                { type: 'INPUT', valueName: 'nasIdentifier', label: 'NAS-Identifier', required: true, placeholder: 'Enter NAS identifier', maxLength: 20, numericOnly: true, form: connFormCreate },
                                            ]}
                                        />
                                    </Card>


                                    <Card title="Operational Parameters" size="small" bordered headStyle={{ backgroundColor: 'var(--tertiary-background-color)' }}>
                                        <DynamicForm
                                            form={opFormCreate}
                                            mode="form"
                                            labelCol={{ span: 7 }}
                                            wrapperCol={{ span: 17 }}
                                            fieldConfigs={[
                                                { type: 'INPUT', valueName: 'location', label: (<div style={{ textAlign: 'center', lineHeight: '1.4' }}>Location/Region<br />Site</div>) as React.ReactNode, required: true, placeholder: 'Enter Location/Region/Site', maxLength: 20 },
                                                { type: 'DROPDOWN', valueName: 'status', label: 'Status', required: true, placeholder: 'Select Status', values: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }] },
                                            ]}
                                        />
                                    </Card>
                                </div>

                                <div className="drawer-footer">
                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                        <Button type="primary" onClick={createNewBng}>
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Drawer>

                        {/* Edit Drawer */}
                        <Drawer
                            title="Edit BNG"
                            width={500}
                            onClose={() => { setEditDrawerVisible(false); setEditingRecord(null); }}
                            open={editDrawerVisible}
                            bodyStyle={{ paddingBottom: 80 }}
                            destroyOnClose
                            className="common-drawer"
                            closeIcon={<CloseOutlined className="custom-close-icon" />}
                        >
                            <div className="drawer-body">
                                <div className="drawer-form-content">

                                    <Card title="BNG Identification" size="small" bordered style={{ marginBottom: 12 }} headStyle={{ backgroundColor: 'var(--tertiary-background-color)' }}>
                                        <Form
                                            form={identFormEdit}
                                            layout="horizontal"
                                            labelCol={{ span: 7 }}
                                            wrapperCol={{ span: 17 }}
                                            colon={false}
                                        >
                                            <Form.Item
                                                label="BNG ID"
                                                name="bngId"
                                                rules={[
                                                    { required: true, message: 'BNG ID is required' },
                                                    { max: 36, message: 'BNG ID must not exceed 36 characters' }
                                                ]}
                                            >
                                                <Input placeholder="Enter BNG ID" disabled maxLength={36} />
                                            </Form.Item>
                                            <Form.Item
                                                label="BNG Name"
                                                name="bngName"
                                                rules={[
                                                    { required: true, message: 'BNG Name is required' },
                                                    { max: 36, message: 'BNG Name must not exceed 36 characters' }
                                                ]}
                                            >
                                                <Input placeholder="Enter BNG Name"  maxLength={36} />
                                            </Form.Item>
                                            {/* <Form.Item
                                                label="BNG IP"
                                                name="bngIp"
                                                rules={[
                                                    { required: true, message: 'BNG IP is required' },
                                                    { max: 36, message: 'BNG IP must not exceed 36 characters' },
                                                    {
                                                        validator: (_rule: any, value: string) => {
                                                            if (value && !/^[0-9.]+$/.test(value)) {
                                                                return Promise.reject('Please enter numeric values only.');
                                                            }
                                                            return Promise.resolve();
                                                        }
                                                    }
                                                ]}
                                            >
                                                <Input
                                                    placeholder="Enter BNG IP"
                                                    maxLength={36}
                                                    onKeyPress={(e) => {
                                                        if (!/^[0-9.]$/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^0-9.]/g, '');
                                                        if (value !== e.target.value) {
                                                            identFormEdit.setFieldsValue({ bngIp: value });
                                                        }
                                                    }}
                                                />
                                            </Form.Item> */}
                                            <Form.Item
                                                label="BNG Type/Vendor"
                                                name="bngTypeVendor"
                                                rules={[
                                                    { required: true, message: 'BNG Type/Vendor is required' },
                                                    { max: 20, message: 'BNG Type/Vendor must not exceed 20 characters' }
                                                ]}
                                            >
                                                <Select placeholder="Select BNG Type/Vendor" allowClear disabled>
                                                    {vendorOptions.map(opt => (
                                                        <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                label="Model/Version"
                                                name="modelVersion"
                                                rules={[
                                                    { required: true, message: 'Model/Version is required' },
                                                    {
                                                        validator: (_rule: any, value: string) => {
                                                            if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
                                                                return Promise.reject('Please enter alphanumeric values only.');
                                                            }
                                                            return Promise.resolve();
                                                        }
                                                    }
                                                ]}
                                            >
                                                <Input
                                                    placeholder="Enter Model/Version"
                                                    maxLength={20}
                                                    onKeyPress={(e) => {
                                                        if (!/^[a-zA-Z0-9]$/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                                                        if (value !== e.target.value) {
                                                            identFormEdit.setFieldsValue({ modelVersion: value });
                                                        }
                                                    }}
                                                />
                                            </Form.Item>
                                        </Form>
                                    </Card>

                                    <Card title="Connectivity" size="small" bordered style={{ marginBottom: 12 }} headStyle={{ backgroundColor: 'var(--tertiary-background-color)' }}>
                                        <DynamicForm
                                            form={connFormEdit}
                                            mode="form"
                                            labelCol={{ span: 7 }}
                                            wrapperCol={{ span: 17 }}
                                            fieldConfigs={[
                                                { type: 'INPUT', valueName: 'nasIpAddress', label: 'NAS-IP-Address', required: true, placeholder: 'Enter NAS-IP-Address', maxLength: 36, ipOnly: true, form: connFormEdit },
                                                { type: 'INPUT', valueName: 'nasIdentifier', label: 'NAS-Identifier', required: true, placeholder: 'Enter NAS-Identifier', maxLength: 20, numericOnly: true, form: connFormEdit },
                                            ]}
                                        />

                                    </Card>

                                    <Card title="Operational Parameters" size="small" bordered style={{ marginBottom: 12 }} headStyle={{ backgroundColor: 'var(--tertiary-background-color)' }}>
                                        <DynamicForm
                                            form={opFormEdit}
                                            mode="form"
                                            labelCol={{ span: 7 }}
                                            wrapperCol={{ span: 17 }}
                                            fieldConfigs={[
                                                { type: 'INPUT', valueName: 'location', label: (<div style={{ textAlign: 'center', lineHeight: '1.4' }}>Location/Region<br />Site</div>) as React.ReactNode, required: true, placeholder: 'Enter Location/Region/Site' },
                                                { type: 'DROPDOWN', valueName: 'status', label: 'Status', required: true, placeholder: 'Select Status', values: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }] },
                                            ]}
                                        />

                                    </Card>
                                </div>

                                <div className="drawer-footer">
                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                        <Button type="primary" onClick={updateBngHandler}>
                                            Update
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Drawer>
                    </div>
                )}

                {activeTab.startsWith("view-") && viewRecord && (
                    <div className="common-page-margin" style={{ marginTop: "0px", display: "flex" }}>
                        <Card title="BNG Identification" style={{ flex: 1, borderRadius: 0 }} headStyle={{ background: "#f5f5f5", fontWeight: '100px', fontSize: '14px', padding: '6px 16px', minHeight: 'auto', borderRadius: 0 }}>
                            <Descriptions bordered column={1} size="small"
                                labelStyle={{ width: 180, fontWeight: 500, backgroundColor: "#fa5f5f5", whiteSpace: "nowrap", color: "#000" }}
                                contentStyle={{ paddingLeft: 16, color: "#000" }}>
                                <Descriptions.Item label="BNG ID">{displayViewValue(viewRecord?.bngId)}</Descriptions.Item>
                                <Descriptions.Item label="BNG Name">{displayViewValue(viewRecord?.bngName)}</Descriptions.Item>
                                <Descriptions.Item label="BNG Type / Vendor">{displayViewValue(viewRecord?.bngTypeVendor)}</Descriptions.Item>
                                <Descriptions.Item label="Model / Version">{displayViewValue(viewRecord?.modelVersion)}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card title="Connectivity" style={{ flex: 1, borderRadius: 0 }} headStyle={{ background: "#f5f5f5", fontWeight: '100px', fontSize: '14px', padding: '6px 16px', minHeight: 'auto', borderRadius: 0 }}>
                            <Descriptions bordered column={1} size="small"
                                labelStyle={{ width: 180, fontWeight: 500, backgroundColor: "#f5f5f5", whiteSpace: "nowrap", color: "#000" }}
                                contentStyle={{ paddingLeft: 16, color: "#000" }}>
                                <Descriptions.Item label="NAS-IP-Address">{displayViewValue(viewRecord?.nasIpAddress)}</Descriptions.Item>
                                <Descriptions.Item label="NAS-Identifier">{displayViewValue(viewRecord?.nasIdentifier)}</Descriptions.Item>
                                <Descriptions.Item label="CoA Port">{displayViewValue(viewRecord?.coaPort)}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card title="Operational Parameters" style={{ flex: 1, borderRadius: 0 }} headStyle={{ background: "#f5f5f5", fontWeight: '100px', fontSize: '14px', padding: '6px 16px', minHeight: 'auto', borderRadius: 0 }}>
                            <Descriptions bordered column={1} size="small"
                                labelStyle={{ width: 180, fontWeight: 500, backgroundColor: "#f5f5f5", whiteSpace: "nowrap", color: "#000" }}
                                contentStyle={{ paddingLeft: 16, color: "#000" }}>
                                <Descriptions.Item label="Location / Region / Site">{displayViewValue(viewRecord?.location)}</Descriptions.Item>
                                <Descriptions.Item label="Status">{displayViewValue(viewRecord?.status)}</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </div>
                )}
            </>
        </ActionPermission>
    )
}

export default NasBng;
