import { FC, useEffect, useState, useRef } from "react";
import ACTION_PERMISSION from "../../../../constants/actionPermissions";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel";
import { InputsProps } from "../../../../components/common-search-panel/models/InputsProps.model";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable";
import { formatValue } from "../../../../helpers/stringValidators";
import CommonTabBar, { CommonTabBarRef } from "../../../../components/common-tab-bar/CommonTabBar";
import { Button, Drawer, Form } from "antd";
import CommonSquareButtonPreDefined
    from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined";
import { ButtonTypeEnum } from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model";
import { DrawerState, updateDrawerState } from "../../../../helpers/helperFunctions";
import OperationActionsEnum from "../../../../model/operationsActionsEnum.model";
import CreateConfiguration from "./CreateEditConfiguration";
import ViewConfiguration from "./ViewConfiguration";
import showNotification from "../../../../services/notification.service";
import CommonConfirmModal from "../../../../components/common-confirm-modal/CommonConfirmModal";
import { getConfigurationsRequest, deleteConfigurationRequest } from "../../services/configuration.service";
import { ConfigurationManagementModel, ConfigurationQueryParams } from "../../models/configuration.model";
import "./Configuration.css";

type ConfigurationManagementProps = object;

const ConfigurationManagement: FC<ConfigurationManagementProps> = () => {
    const tabBarRef = useRef<CommonTabBarRef>(null);
    const [activeTab, setActiveTab] = useState("search");
    const [searchForm, setSearchForm] = useState<Record<string, string>>({});
    const [tabDataMap, setTabDataMap] = useState<Record<string, any>>({});

    useEffect(() => {
        console.log("Active tab changed to:", activeTab);
        console.log("Current tabDataMap:", tabDataMap);

        if (activeTab.startsWith("view-")) {
            const record = tabDataMap[activeTab] || null;
            console.log("Setting viewRecord for tab", activeTab, ":", record);
        } else {
            console.log("Active tab is not a view tab, clearing viewRecord");
        }
    }, [activeTab, tabDataMap]);

    const [drawerData, setDrawerData] = useState<DrawerState>({
        isDrawerOpen: false,
        operation: OperationActionsEnum.NONE,
        drawerData: null
    });

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
        total?: number;
    }>({ currentPage: 1, currentItemPerPage: 10, total: 0 });

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<ConfigurationManagementModel | null>(null);

    const [formValues, setFormValues] = useState<{
        vendorId: string | null;
        attributeId: string | null;
        vendorName: string | null;
        attributeName: string | null;
    }>({ vendorId: null, attributeId: null, vendorName: null, attributeName: null });

    const [configurationData, setConfigurationData] = useState<ConfigurationManagementModel[]>([]);

    const [drawerForm] = Form.useForm();

    const searchPanelInputs: InputsProps[] = [
        {
            type: "INPUT",
            valueName: "vendorId",
            label: "Vendor ID",
            required: false,
            maxLength: 24,
            mainInput: true,
            placeholder: "Vendor ID"

        },
        {
            type: "INPUT",
            valueName: "attributeId",
            label: "Attribute ID",
            required: false,
            maxLength: 24,
            placeholder: "Attribute ID",
            mainInput: true,
            numericOnly: true
        },
        {
            type: "INPUT",
            valueName: "vendorName",
            label: "Vendor Name",
            required: false,
            maxLength: 50,
            placeholder: "Vendor Name",
            mainInput: true
        },
        {
            type: "INPUT",
            valueName: "attributeName",
            label: "Attribute Name",
            required: false,
            maxLength: 50,
            placeholder: "Attribute Name",
            mainInput: false
        }
    ];

    const configurationColumns = [
        { title: 'Vendor ID', dataIndex: 'vendorId', key: 'vendorId', render: formatValue },
        { title: 'Vendor Name', dataIndex: 'vendorName', key: 'vendorName', render: formatValue },
        { title: 'Attribute ID', dataIndex: 'attributeId', key: 'attributeId', render: formatValue,numericOnly: true },
        { title: 'Attribute Name', dataIndex: 'attributeName', key: 'attributeName', render: formatValue },
        { title: 'Value Path', dataIndex: 'valuePath', key: 'valuePath', render: formatValue },
        { title: 'Created Date', dataIndex: 'createdDate', key: 'createdDate', render: formatValue },
        { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy', render: formatValue },
        { title: 'Last Updated Date', dataIndex: 'lastUpdatedDate', key: 'lastUpdatedDate', render: formatValue },
        { title: 'Last Updated By', dataIndex: 'lastUpdatedBy', key: 'lastUpdatedBy', render: formatValue },
        {
            title: "Action",
            key: "action",
            width: 140,
            fixed: "right",
            align: "center",
            render: (_: any, record: ConfigurationManagementModel) => (
                <div className="action-button-group">
                    
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.VIEW}
                            onClick={() => {
                                const tabKey = `view-${record.vendorId}`;
                                const tabLabel = "Configuration Management";

                                setTabDataMap(prev => ({
                                    ...prev,
                                    [tabKey]: record
                                }));

                                tabBarRef.current?.openTab({ key: tabKey, label: tabLabel });
                                setActiveTab(tabKey);
                            }}
                        />
                    
                    <ActionPermission action={ACTION_PERMISSION.UPDATE_VENDOR_CONFIG}>
                    <CommonSquareButtonPreDefined
                        type={ButtonTypeEnum.EDIT}
                        onClick={() => openEditDrawer(record)}
                    />
                    </ActionPermission>
                    <ActionPermission action={ACTION_PERMISSION.DELETE_VENDOR_CONFIG}>
                    <CommonSquareButtonPreDefined
                        type={ButtonTypeEnum.DELETE}
                        onClick={() => handleDelete(record)}
                    />
                    </ActionPermission>
                </div>
            )
        }
    ];


   

    const onSearchFormSubmit = (values?: {
        vendorId: string | null;
        attributeId: string | null;
        vendorName: string | null;
        attributeName: string | null;
    }) => {
        setFormValues(values ?? { vendorId: null, attributeId: null, vendorName: null, attributeName: null });
        setSearchForm(values as any ?? {});
        setPaginationDetails((current) => ({ ...current, currentPage: 1 }));
    };

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize,
            total: paginationDetails.total
        });
        searchConfiguration(page, pageSize);
    };

    const openCreateDrawer = () => {
        drawerForm.resetFields();
        drawerForm.setFieldsValue({
            vendorId: null,
            attributeId: null,
            vendorName: null,
            attributeName: null,

        });
        updateDrawerState(setDrawerData, {
            isDrawerOpen: true,
            operation: OperationActionsEnum.NEW,
            drawerData: null

        });
    }

    const openEditDrawer = (record: ConfigurationManagementModel) => {
        updateDrawerState(setDrawerData, {
            isDrawerOpen: true,
            operation: OperationActionsEnum.EDIT,
            drawerData: record
        });
    };

    const handleDelete = (record: ConfigurationManagementModel) => {
        setSelectedRecord(record);
        setIsDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (selectedRecord?.id) {
            try {
                const response = await deleteConfigurationRequest(selectedRecord.id);
                if (response?.success) {
                    showNotification("SUCCESS", response.message ?? 'Configuration deleted successfully');
                    searchConfiguration();
                    closeDeleteModal();
                }
            } catch (error) {
                console.error("Delete failed:", error);
                showNotification("ERROR", "Failed to delete configuration");
            }
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalVisible(false);
        setSelectedRecord(null);
    };

    const searchConfiguration = async (page?: number, size?: number) => {
        const params: ConfigurationQueryParams = {
            page: page || paginationDetails.currentPage,
            size: size || paginationDetails.currentItemPerPage,
            vendorId: formValues?.vendorId || undefined,
            attributeId: formValues?.attributeId || undefined,
            vendorName: formValues?.vendorName || undefined,
            attributeName: formValues?.attributeName || undefined
        };
        try {
            const response = await getConfigurationsRequest(params);
            if (response && response.data) {
                setConfigurationData(response.data.VendorConfigData || []);
                setPaginationDetails(prev => ({
                    ...prev,
                    total: response.data.pageDetails?.totalRecords || 0
                }));
            }
        } catch (error) {
            console.error("Error searching configurations:", error);
        }
    };


    useEffect(() => {
        searchConfiguration();
    }, [formValues, paginationDetails.currentPage, paginationDetails.currentItemPerPage]);

    const closeDrawer = () => {
        setDrawerData({
            isDrawerOpen: false,
            operation: OperationActionsEnum.NONE,
            drawerData: null
        })
        searchConfiguration(); // Refresh table
    }

    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_VENDOR_CONFIG}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Configuration Management</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Vendor Specific Configuration</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    ref={tabBarRef}
                    initialTabs={[{ key: "search", label: "Vendor Specific Configuration" }]}
                    initialActiveKey="search"
                    onTabClick={setActiveTab}
                />

                {activeTab === "search" && (
                    <div className="common-page-margin configuration-search-container">
                        <CommonSearchPanel
                            inputs={searchPanelInputs}
                            title="Search Conditions"
                            isExpandBtnVisible={true}
                            onSubmit={onSearchFormSubmit}
                            onClear={() => onSearchFormSubmit({ vendorId: null, attributeId: null, vendorName: null, attributeName: null })}
                            initialValues={searchForm}
                        />

                        <div className="common-button-bar">
                            <ActionPermission action={ACTION_PERMISSION.ADD_VENDOR_CONFIG}>
                            <div className="mt-2 configuration-action-bar">
                                <Button
                                    type="primary"
                                    size="small"
                                    className="add-template-btn"
                                    onClick={openCreateDrawer}
                                >
                                    Add New
                                </Button>
                            </div>
                            </ActionPermission>
                        </div>

                        <div>
                            <DynamicTable
                                columns={configurationColumns}
                                data={configurationData || []}
                                pagination={{
                                    current: paginationDetails.currentPage,
                                    pageSize: paginationDetails.currentItemPerPage,
                                    total: paginationDetails.total || 0,
                                    onChange: onTableChange

                                }}
                                scroll={{ x: 0 }}
                            />
                        </div>
                    </div>
                )}

                {(() => {
                    return activeTab.startsWith("view-") && tabDataMap[activeTab] && (
                        <ViewConfiguration record={tabDataMap[activeTab]} />
                    );
                })()}
                <Drawer
                    className="common-drawer"
                    width={500}
                    closeIcon={<CommonSquareButtonPreDefined type={ButtonTypeEnum.CLOSE} />}
                    title={
                        <div className="drawer-title-box">
                            <span className="font-2xl-semi-bold">
                                {drawerData.operation === OperationActionsEnum.NEW && "Create New Configuration Management"}
                                {drawerData.operation === OperationActionsEnum.EDIT && "Edit Configuration Management"}
                            </span>
                        </div>
                    }
                    open={drawerData.isDrawerOpen}
                    onClose={closeDrawer}
                    destroyOnClose={true}
                >
                    {drawerData.operation === OperationActionsEnum.NEW && (
                        <CreateConfiguration
                            drawerData={drawerData}
                            onClose={closeDrawer}
                            existingData={configurationData}
                        />
                    )}
                    {drawerData.operation === OperationActionsEnum.EDIT && (
                        <CreateConfiguration
                            drawerData={drawerData}
                            onClose={closeDrawer}
                            record={drawerData.drawerData}
                            existingData={configurationData}
                        />
                    )}
                </Drawer>

                <CommonConfirmModal
                    isOpen={isDeleteModalVisible}
                    onOk={confirmDelete}
                    onCancel={closeDeleteModal}
                    title="Are you sure you want to delete this record ?"
                    okText="Yes, Delete"
                    btnDanger={true}
                />
            </>
        </ActionPermission>
    )
}

export default ConfigurationManagement;

