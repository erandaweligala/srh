import { FC, useEffect, useState, useRef } from "react";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
import { InputsProps } from "../../../../components/common-search-panel/models/InputsProps.model.ts";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
import { formatValue } from "../../../../helpers/stringValidators.ts";
import CommonTabBar, { CommonTabBarRef } from "../../../../components/common-tab-bar/CommonTabBar.tsx";
import { Button, Drawer, Form } from "antd";
import CommonSquareButtonPreDefined
    from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import { ButtonTypeEnum } from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import { debounce, DrawerState, renderStatusTag, updateDrawerState } from "../../../../helpers/helperFunctions.tsx";
import OperationActionsEnum from "../../../../model/operationsActionsEnum.model.ts";
import { DEBOUNCE_TIME_IN_MS } from "../../../../constants/validationConditions.ts";
import { getNotificationTemplateRequest, getNotificationTemplates } from "../../services/notification.template.service.ts";
import { NotificationTemplateModel, NotificationTemplatesQueryParams } from "../../models/notification-template.model.ts";
import CreateNotification from "./create-notification-template/CreateNotification.tsx";
import ViewNotification from "./view-notification-template/ViewNotification.tsx";
import "./NotificationTemplate.css";

type NotificationTemplateProps = object;

const NotificationTemplate: FC<NotificationTemplateProps> = () => {
    const tabBarRef = useRef<CommonTabBarRef>(null);
    const [activeTab, setActiveTab] = useState("search");
    const [tabDataMap, setTabDataMap] = useState<Record<string, any>>({});
    const [searchForm, setSearchForm] = useState<Record<string, string>>({});
    const [singleTemplateDetails, setSingleTemplateDetails] = useState<NotificationTemplateModel>();

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

    const [formValues, setFormValues] = useState<{
        templateName: string | null;
        status: string | null;
        isDefault: boolean | undefined;
    }>({ templateName: null, status: null, isDefault: undefined });

    const [notificationTemplateData, setNotificationTemplateData] = useState<NotificationTemplateModel[]>([]);

    const [drawerForm] = Form.useForm();

    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Draft', value: 'Draft' }
    ];

    const searchPanelInputs: InputsProps[] = [
        {
            type: "INPUT",
            valueName: "templateName",
            label: "Template Name",
            required: false,
            mainInput: true,
            placeholder: "Template Name",
            maxLength: 500
        },
        {
            type: "DROPDOWN",
            valueName: "status",
            label: "Status",
            required: false,
            placeholder: "Status",
            values: statusOptions,
            mainInput: true
        },
        {
            type: "DROPDOWN",
            valueName: "isDefault",
            label: "Is Default",
            required: false,
            placeholder: "Is Default",
            values: [
                { label: 'True', value: true },
                { label: 'False', value: false }
            ],
            mainInput: true
        }
    ];

    const notificationColumns = [
        { title: 'Template Name', dataIndex: 'templateName', key: 'templateName', render: formatValue },
        { title: 'Status', dataIndex: 'status', key: 'status', render: renderStatusTag },
        { title: 'Is Default', dataIndex: 'isDefault', key: 'isDefault', render: (val: boolean) => val ? 'True' : 'False' },
        { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy', render: formatValue },
        { title: 'Create Date', dataIndex: 'createdAt', key: 'createdAt', render: formatValue },
        { title: 'Last Updated Date', dataIndex: 'updatedAt', key: 'updatedAt', render: formatValue },
        {
            title: "Action",
            key: "action",
            align: "center",
            width: 100,
            render: (_: any, record: NotificationTemplateModel) => (
                <div>
                    <ActionPermission action={ACTION_PERMISSION.VIEW_NOTIFICATION_TEMPLATE}>
                    <CommonSquareButtonPreDefined
                        type={ButtonTypeEnum.VIEW}
                        onClick={() => {
                            singleTemplateData(record.superTemplateId);
                            const tabKey = `view-${record.superTemplateId}`;
                            const tabLabel = "Notification Template Details";

                            setTabDataMap(prev => ({
                                ...prev,
                                [tabKey]: record
                            }));

                            tabBarRef.current?.openTab({ key: tabKey, label: tabLabel });
                            setActiveTab(tabKey);
                        }}
                    />
                    </ActionPermission>
                    <ActionPermission action={ACTION_PERMISSION.UPDATE_NOTIFICATION_TEMPLATE}>
                    <CommonSquareButtonPreDefined
                        type={ButtonTypeEnum.EDIT}
                        onClick={() => {
                            singleTemplateData(record.superTemplateId, ButtonTypeEnum.EDIT);
                        }}
                    />
                    </ActionPermission>
                </div>
            )
        }
    ];

    const singleTemplateData = async (id: number, action?: string) => {
        const response = await getNotificationTemplateRequest(id);
        if (response) {
            setSingleTemplateDetails(response.data);
            if (action === "EDIT") {
                openEditDrawer(response.data);
            }
        }
    }

    useEffect(() => {
        searchNotificationTemplates();
    }, [formValues]);

    const searchNotificationTemplates = async (page?: number, size?: number) => {

        const params: NotificationTemplatesQueryParams = {
            page: page || paginationDetails.currentPage,
            size: size || paginationDetails.currentItemPerPage,
            templateName: formValues?.templateName || undefined,
            status: formValues?.status || undefined,
            isDefault: formValues?.isDefault ?? undefined
        };
        const response = await getNotificationTemplates(params);

        if (response) {
            setNotificationTemplateData(response.data.TemplateData);
            setPaginationDetails((current) => ({ ...current, total: response.data.pageDetails.totalRecords }));
            console.log("data", response.data);
        }
    }

    const onSearchFormSubmit = (values?: {
        templateName: string | null;
        status: string | null;
        isDefault: boolean | undefined;
    }) => {
        setFormValues(values ?? { templateName: null, status: null, isDefault: undefined });
        setSearchForm(values as any ?? {});
        setPaginationDetails((current) => ({ ...current, currentPage: 1 }));
    };

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
        searchNotificationTemplates(page, pageSize);
    };

    const openCreateDrawer = () => {
        drawerForm.resetFields();
        drawerForm.setFieldsValue({
            status: 'Inactive',
            usageTemplates: [],
            expireTemplates: []
        });
        updateDrawerState(setDrawerData, {
            isDrawerOpen: true,
            operation: OperationActionsEnum.NEW,
            drawerData: null
        });
    }

    const openEditDrawer = (record: NotificationTemplateModel) => {
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
        debouncedSearchTemplates();
    }



    const debouncedSearchTemplates = debounce(searchNotificationTemplates, DEBOUNCE_TIME_IN_MS);


    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_NOTIFICATION_TEMPLATE}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Configuration Management</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Notification Configuration</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    ref={tabBarRef}
                    initialTabs={[{ key: "search", label: "Notification Configuration" }]}
                    initialActiveKey="search"
                    onTabClick={setActiveTab}
                />

                {activeTab === "search" && (
                    <div className="common-page-margin notification-search-container">
                        <CommonSearchPanel
                            inputs={searchPanelInputs}
                            title="Search Conditions"
                            isExpandBtnVisible={false}
                            onSubmit={onSearchFormSubmit}
                            onClear={() => onSearchFormSubmit({ templateName: null, status: null, isDefault: undefined })}
                            initialValues={searchForm}
                        />

                        <div className="common-button-bar">
                            <ActionPermission action={ACTION_PERMISSION.ADD_NOTIFICATION_TEMPLATE}>
                            <div className="mt-2 notification-action-bar">
                                <Button
                                    type="primary"
                                    size="small"
                                    className="add-template-btn"
                                    onClick={openCreateDrawer}
                                >
                                    Add Template
                                </Button>
                            </div>
                            </ActionPermission>
                        </div>

                        <div>
                            <DynamicTable
                                columns={notificationColumns}
                                data={notificationTemplateData || []}
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
                    return activeTab.startsWith("view-") && singleTemplateDetails && (
                        <ViewNotification record={singleTemplateDetails} />
                    );
                })()}
                <Drawer
                    className="common-drawer"
                    width={500}
                    title={
                        <div className="drawer-title-box">
                            <span className="font-2xl-semi-bold">
                                {drawerData.operation === OperationActionsEnum.NEW && "Add Notification Template"}
                                {drawerData.operation === OperationActionsEnum.EDIT && "Edit Notification Template"}
                            </span>
                        </div>
                    }
                    open={drawerData.isDrawerOpen}
                    onClose={closeDrawer}
                    destroyOnClose={true}
                >
                    {drawerData.operation === OperationActionsEnum.NEW && (
                        <CreateNotification
                            drawerData={drawerData}
                            onClose={closeDrawer}
                            existingTemplates={notificationTemplateData}
                        />
                    )}
                    {drawerData.operation === OperationActionsEnum.EDIT && (
                        <CreateNotification
                            drawerData={drawerData}
                            onClose={closeDrawer}
                            record={drawerData.drawerData}
                            existingTemplates={notificationTemplateData}
                        />
                    )}
                </Drawer>
            </>
        </ActionPermission>
    )
}

export default NotificationTemplate;
