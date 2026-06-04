import { FC, useEffect, useRef, useState } from "react";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import CommonTabBar, { CommonTabBarRef } from "../../../../components/common-tab-bar/CommonTabBar.tsx";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
import { Button, Form, Table, TablePaginationConfig } from "antd";
import OperationActionsEnum from "../../../../model/operationsActionsEnum.model.ts";
import { InputsProps } from "../../../../components/common-search-panel/models/InputsProps.model.ts";
import { getAllRoles, getPermissionMetaData } from "../../../../services/metadata.service.ts";
import { RolesSearchRequestModel } from "../../models/roles/rolesSearchRequest.model.ts";
import { getSingleRoleData, searchAllRoles } from "../../services/role.management.service.ts";
import { RoleResponse, RolesModel, RoleViewModel } from "../../models/roles/roles.model.ts";
import { DrawerState, updateDrawerState, updatePaginationDetails } from "../../../../helpers/helperFunctions.tsx";
import RoleView from "./View/RoleView.tsx";
import CreateEditRole from "./CreateEdit/CreateEditRole.tsx";
import { PermissionModelRoles } from "../../models/permissions/permission.model.ts";
import { ColumnsType } from "antd/es/table";
import { formatValue } from "../../../../helpers/stringValidators.ts";
import CommonSquareButtonPreDefined
    from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import { ButtonTypeEnum } from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";

const RoleTableView: FC = () => {
    const tabBarRef = useRef<CommonTabBarRef>(null);
    const [activeTab, setActiveTab] = useState("search");
    const [rolesList, setRolesList] = useState<{ label: string; value: string; name: string; }[]>([]);
    const [formValues, setFormValues] = useState<RolesSearchRequestModel>();
    const [tableData, setTableData] = useState<RoleResponse[]>([]);
    const [paginationDetails, setPaginationDetails] = useState<{ currentPage: number; currentItemPerPage: number; totalCount?: number; }>({ currentPage: 1, currentItemPerPage: 10, totalCount: 0 });
    const [tabDataMap, setTabDataMap] = useState<{ data: RoleViewModel, operation: string }>()
    const [drawerData, setDrawerData] = useState<DrawerState>({ isDrawerOpen: false, operation: OperationActionsEnum.NONE, drawerData: { role: null } });

    const [drawerForm] = Form.useForm();

    useEffect(() => {
        searchRoles({ roleName: undefined, limit: 10, offset: 0 })
        getMetaData();
    }, []);

    const getMetaData = async () => {
        const responseRoles = await getAllRoles();

        if (responseRoles) {
            const updatedRoleData = responseRoles.map((item) => {
                return { label: item.label, value: item.label, name: item.label }
            })
            setRolesList(updatedRoleData);
        }
    }

    const searchRoles = async (params: RolesSearchRequestModel) => {
        const queryParams = {
            roleName: params.roleName,
            limit: params.limit,
            offset: params.offset,
            
        }
        const response = await searchAllRoles(queryParams);
        console.log("Search Roles Response:", response);
        if (response) {
            setTableData(response[0]);
            setPaginationDetails((prev) => ({
                ...prev,
                currentPage: response[1].pageNumber,
                totalCount: response[1].totalRecords || 0
            }));
        }
    }

    const searchPanelInputs: InputsProps[] = [
        {
            type: "DROPDOWN",
            valueName: "roleName",
            label: "Role Name",
            required: false,
            mainInput: true,
            placeholder: "Enter Role Name",
            values: rolesList
        }
    ];

    const onSearchFormSubmit = (formValues?: RolesSearchRequestModel) => {
        const requestData: RolesSearchRequestModel = {
            roleName: formValues?.roleName,
            limit: paginationDetails.currentItemPerPage,
            offset: 0,
        }
        setFormValues(requestData);
        searchRoles(requestData);
    }

    const onTableChange = (pagination: TablePaginationConfig) => {
        setPaginationDetails((currentPagination) => updatePaginationDetails(pagination, currentPagination));
        searchRoles({
            roleName: formValues?.roleName,
            limit: pagination.pageSize!,
            offset: (pagination.current! - 1) * pagination.pageSize!,
        })
    }
    const [permissionsList, setPermissionsList] = useState<PermissionModelRoles[]>([]);

    const openViewEditRoleDrawer = async (operation: OperationActionsEnum, role: RolesModel | null) => {
        const permissionListRes = await getPermissionMetaData();
        setPermissionsList(permissionListRes);
        updateDrawerState(setDrawerData, {
            isDrawerOpen: true,
            operation: operation,
            drawerData: {
                role: role
            }
        });
    }



    const openViewMoreTab = async (rowData: any) => {
        const tabKey = `role-view-${rowData.roleId}`;
        const tabLabel = "Role_View More";
        const response = await getSingleRoleData(rowData.roleId);

        setTabDataMap(
            {
                data: response,
                operation: OperationActionsEnum.VIEW
            }
        );

        tabBarRef.current?.openTab({ key: tabKey, label: tabLabel });
        setActiveTab(tabKey);
    }

    const closeDrawer = () => {
        setDrawerData({
            isDrawerOpen: false,
            operation: OperationActionsEnum.NONE,
            drawerData: {
                role: null
            }
        });
        drawerForm.resetFields();
        setFormValues(undefined);
        searchRoles({ roleName: undefined, limit: paginationDetails.currentItemPerPage, offset: 0})
        setPaginationDetails(prev => ({ ...prev, currentPage: 1 }));
    }

    const renderActionButtons = (
        openViewMoreTab: (record: RolesModel | any) => void,
        openViewEditRoleDrawer: (operation: OperationActionsEnum, record: RolesModel | any) => void
    ) => (item: RoleResponse) => (
        <>
            <ActionPermission action={ACTION_PERMISSION.VIEW_ROLE_ACTION}>
                <CommonSquareButtonPreDefined onClick={() => openViewMoreTab(item)}
                                              type={ButtonTypeEnum.VIEW}/>
            </ActionPermission>

            <ActionPermission action={ACTION_PERMISSION.UPDATE_ROLE_ACTION}>
                <CommonSquareButtonPreDefined className="ms-1" onClick={() => openViewEditRoleDrawer(OperationActionsEnum.EDIT, item)}
                                              type={ButtonTypeEnum.EDIT}/>
            </ActionPermission>

        </>
    );

    const columns: ColumnsType<RoleResponse> = [
        {
            title: "ID",
            dataIndex: "roleId",
            key: "roleId",
            width: '25%',
            render: formatValue
        },
        {
            title: "Role Name",
            dataIndex: "name",
            key: "name",
            width: '35%',
            render: formatValue
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            width: '35%',
            render: formatValue
        },
        {
            title: "Action",
            key: "action",
            width: 130,
            align: "center",
            render: renderActionButtons(openViewMoreTab, openViewEditRoleDrawer)
        }
    ]


    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_ROLES_LIST}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>User Management</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Roles</CommonBreadcrumb.Section>
                </CommonBreadcrumb>
                <CommonTabBar
                    ref={tabBarRef}
                    initialTabs={[
                        { key: "search", label: "Roles" }
                    ]}
                    initialActiveKey="search"
                    onTabClick={setActiveTab} />

                {activeTab === "search" && (
                    <div className="common-page-margin" style={{ marginTop: "0px" }}>
                        <CommonSearchPanel
                            inputs={searchPanelInputs}
                            title="Search Conditions"
                            isExpandBtnVisible={false}
                            onSubmit={onSearchFormSubmit}
                            onClear={onSearchFormSubmit}
                            initialValues={formValues}
                        />

                        <div className="common-button-bar">
                            <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                <ActionPermission action={ACTION_PERMISSION.CREATE_NEW_ROLE_ACTION}>
                                    <Button
                                        type="primary"
                                        size="small"
                                        style={{fontSize: 12}}
                                        onClick={() => openViewEditRoleDrawer(OperationActionsEnum.NEW, null)}
                                    >
                                        Create New Role
                                    </Button>
                                </ActionPermission>
                            </div>
                        </div>

                        <div>
                            <Table
                                columns={columns}
                                dataSource={tableData}
                                className="common-basic-table"
                                onChange={onTableChange}
                                rowKey="roleId"
                                pagination={{
                                    total: paginationDetails.totalCount,
                                    current: paginationDetails.currentPage,
                                    pageSize: paginationDetails.currentItemPerPage,
                                    pageSizeOptions: [10, 25, 50],
                                    showSizeChanger: true
                                }}
                                tableLayout="fixed"
                            />
                        </div>
                    </div>
                )}

                {activeTab.startsWith("role-view-") && (
                    <div className="common-page-margin">
                        {tabDataMap?.data && (
                            <div>
                                <RoleView data={tabDataMap?.data} />
                            </div>
                        )}
                    </div>
                )}
                {
                    (drawerData.isDrawerOpen && drawerData.operation === OperationActionsEnum.NEW) &&
                    <CreateEditRole
                        drawerData={drawerData}
                        drawerForm={drawerForm}
                        permissionsDropdownList={permissionsList}
                        onClose={closeDrawer}
                    />
                }
                {
                    (drawerData.isDrawerOpen && drawerData.operation === OperationActionsEnum.EDIT) &&
                    <CreateEditRole
                        drawerData={drawerData}
                        drawerForm={drawerForm}
                        permissionsDropdownList={permissionsList}
                        onClose={closeDrawer}
                    />
                }

            </>
        </ActionPermission>
    )
}

export default RoleTableView;