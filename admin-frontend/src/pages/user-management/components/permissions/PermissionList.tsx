import {FC, useEffect, useState} from "react";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import CommonTabBar from "../../../../components/common-tab-bar/CommonTabBar.tsx";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
import {Button, Drawer} from "antd";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
import {InputsProps} from "../../../../components/common-search-panel/models/InputsProps.model.ts";
import {formatValue} from "../../../../helpers/stringValidators.ts";
import CommonSquareButtonPreDefined
    from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import {ButtonTypeEnum} from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import {getMenuToComponentData, searchAllPermissions} from "../../services/permission.management.service.ts";
import {
    MenuToComponentModel,
    PermissionListResponseModel,
    PermissionQueryParams
} from "../../models/permissions/permission.model.ts";
import showNotification from "../../../../services/notification.service.tsx";
import OperationActionsEnum from "../../../../model/operationsActionsEnum.model.ts";
import {DrawerState} from "../../../../helpers/helperFunctions.tsx";
import CreatePermission from "./create-permission/CreatePermission.tsx";
import {CloseOutlined} from "@ant-design/icons";
import ViewPermissions from "./view-permissions/ViewPermissions.tsx";

const PermissionList: FC = () => {

    const [formValues, setFormValues] = useState<PermissionQueryParams>({ limit: 10, offset: 0 });
    const [paginationDetails, setPaginationDetails] = useState<{ currentPage: number; currentItemPerPage: number; totalCount?: number; }>({ currentPage: 1, currentItemPerPage: 10, totalCount: 0 });
    const [menuToComponentList, setMenuToComponentList] = useState<MenuToComponentModel[]>();
    const [permissionListData, setPermissionListData] = useState<PermissionListResponseModel[]>([]);
    const [drawerData, setDrawerData] = useState<DrawerState>({isDrawerOpen: false, operation: OperationActionsEnum.NONE, drawerData: null});
    const [isEditable,setIsEditable] = useState<boolean>(false);
    const [menuList, setMenuList] = useState<{ label: string; value: string; }[]>([]);
    const [componentDropdownList, setComponentDropdownList] = useState<{ label: string; value: string; }[]>([]);
    const [selectedMenuId, setSelectedMenuId] = useState<string | undefined>(undefined);

    const searchPanelInputs: InputsProps[] = [
        {
            type: "INPUT",
            valueName: "permissionName",
            label: "Permission Name",
            required: false,
            mainInput: true,
            placeholder: "Enter Permission Name"
        }
        , {
            type: "DROPDOWN",
            valueName: "menuId",
            label: "Menu Name",
            required: false,
            mainInput: true,
            placeholder: "Select Menu Name",
            values:menuList,
            onChange: value => {handleMenuChange(value)},

        }, {
            type: "DROPDOWN",
            valueName: "componentId",
            label: "Component Name",
            required: false,
            mainInput: true,
            placeholder: "Select Component Name",
            values:componentDropdownList,
            disabled: !selectedMenuId
        }

    ];

    const permissionColumns = [
        { title: 'Permission ID', dataIndex: 'permissionId', key: 'permissionId', render: formatValue },
        { title: 'Permission Name', dataIndex: 'name', key: 'name', render: formatValue },
        { title: 'Description', dataIndex: 'description', key: 'description', render: formatValue },
        { title: 'Menu Name', dataIndex: 'menuName', key: 'menuName', render: formatValue },
        { title: 'Component Name', dataIndex: 'componentName', key: 'componentName', render: formatValue },
        {
            title: "Action",
            key: "action",
            align: "center",
            width: 140,
            render: (_: any, record: any) => (
                <div>
                    <ActionPermission action={ACTION_PERMISSION.VIEW_PERMISSION_DETAILS}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.VIEW}
                            onClick={() => handelView(record.permissionId)}
                            />
                    </ActionPermission>
                    <ActionPermission action={ACTION_PERMISSION.UPDATE_PERMISSION}>
                        <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.EDIT}
                            onClick={() => {openEditDrawer(record.permissionId)}}
                        />
                    </ActionPermission>
                    {/*<CommonSquareButtonPreDefined*/}
                    {/*    type={ButtonTypeEnum.DELETE}*/}
                    {/*    onClick={() => handleDeleteClick(record)}*/}
                    {/*/>*/}
                </div>
            )
        }
    ];

    useEffect(() => {
        searchPermission({ ...formValues});
        getMenuToComponentList();
    }, []);

    const getMenuToComponentList = async () => {
        const response = await getMenuToComponentData();
        const filteredResponse = response.filter((menu) => menu.menuName !== "Mapping Configuration" && menu.components.length > 0);
        setMenuToComponentList(filteredResponse);

        const dropDownMenuList = filteredResponse.map((item => ({
            label: item.menuName,
            value: item.menuId
        })
        ))
        setMenuList(dropDownMenuList);
    }

    const handleMenuChange = (menuId: string) => {
        setSelectedMenuId(menuId);
        setComponentDropdownList([])
        if (menuId && menuToComponentList) {
            const menus= menuToComponentList.filter(item => item.menuId === menuId);
            if (menus.length > 0) {
                const dropDownComponentList = menus[0].components.map((item => ({
                        label: item.componentName,
                        value: item.componentId
                    })
                ))
                setComponentDropdownList(dropDownComponentList);
            }
        }
    };
    const onCloseDrawer = async (updateTableDetails: boolean) => {
        setIsEditable(false);
        setDrawerData({
            isDrawerOpen: false,
            operation: OperationActionsEnum.NONE,
            drawerData: null
        })
        if (updateTableDetails) {
            const payload: PermissionQueryParams = {
                limit: paginationDetails.currentItemPerPage,
                offset: 0,
            }
            await searchPermission(payload);
            setPaginationDetails(prev => ({ ...prev, currentPage: 1 }));
        }
    };

    const openEditDrawer = (permissionId: string) => {
        setIsEditable(true);

        setDrawerData({
            isDrawerOpen: true,
            operation: OperationActionsEnum.EDIT,
            drawerData: permissionId
        })
    }

    const handelView = (permissionId: string) => {
        setIsEditable(false);

        setDrawerData({
            isDrawerOpen: true,
            operation: OperationActionsEnum.VIEW,
            drawerData: permissionId
        })
    }

    const searchPermission = async (formValues: PermissionQueryParams) => {
        const params = {
            permissionName: formValues.permissionName,
            menuId: formValues.menuId,
            componentId: formValues.componentId,
            offset: formValues.offset,
            limit: formValues.limit,
        }
        try {
            const response = await searchAllPermissions(params);

            if (response) {
                setPermissionListData(response[0]);
                setPaginationDetails((prev) => ({
                    ...prev,
                    currentPage: response[1].pageNumber,
                    totalCount: response[1].totalRecords
                }));
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Failed to retrieve data. Please try again.";
            showNotification("ERROR", errorMessage);
        }

    }

    const onSearchFormSubmit = (values?: any ) => {
        const queryParams = {
            permissionName: values.permissionName,
            menuId: values.menuId,
            componentId: values.componentId,
            limit: paginationDetails.currentItemPerPage,
            offset: 0,
            sortBy: 'created_date',
            order: 'desc'
        }
        setFormValues(queryParams);
        searchPermission(queryParams);
        setPaginationDetails((current) => ({ ...current, currentPage: 1 }));
    };

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
        const queryParams = {
            permissionName: formValues.permissionName,
            limit: pageSize,
            offset: (page! - 1) * pageSize!,
            sortBy: 'created_date',
            order: 'desc'
        }
        searchPermission(queryParams);
    };

    const openCreateDrawer = () => {
        setDrawerData({
            isDrawerOpen: true,
            operation: OperationActionsEnum.NEW,
            drawerData: null
        });
    }


    return(
        <ActionPermission action={ACTION_PERMISSION.PERMISSION_LIST}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>User Management</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Permissions</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    initialTabs={[{ key: "search", label: "Permissions" }]}
                    initialActiveKey="search"
                />

                <div className="common-page-margin" style={{ marginTop: "0px" }}>
                    <CommonSearchPanel
                        inputs={searchPanelInputs}
                        title="Search Conditions"
                        isExpandBtnVisible={false}
                        onSubmit={onSearchFormSubmit}
                        onClear={()=> {
                            setSelectedMenuId(undefined);
                            searchPermission({permissionName: undefined, limit: formValues.limit, offset: formValues.offset})
                        }}
                    />

                    <div className="common-button-bar">
                        <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <ActionPermission action={ACTION_PERMISSION.CREATE_NEW_PERMISSION}>
                            <Button
                                type="primary"
                                size="small"
                                style={{fontSize: 12}}
                                onClick={openCreateDrawer}
                            >
                                Create New Permission
                            </Button>
                            </ActionPermission>
                        </div>
                    </div>

                    <div>
                        <DynamicTable
                            columns={permissionColumns}
                            data={permissionListData || []}
                            pagination={{
                                current: paginationDetails.currentPage,
                                pageSize: paginationDetails.currentItemPerPage,
                                total: Number(paginationDetails.totalCount),
                                onChange: onTableChange
                            }}
                            scroll={{ x: 0 }}
                        />
                    </div>
                </div>
                <Drawer
                    title={
                        <span className="font-2xl-semi-bold">
                            {drawerData.operation === "NEW" && "Create New Permission"}
                            {drawerData.operation === "VIEW" && "View Permission"}
                            {drawerData.operation === "EDIT" && "Edit Permission"}
                        </span>
                    }
                    closeIcon={<Button className="custom-close-icon"><CloseOutlined/></Button>}
                    placement="right"
                    onClose={()=>onCloseDrawer(false)}
                    open={drawerData.isDrawerOpen}
                    width={600}
                    className="bss-ui-drawer"
                >
                    <>
                        {
                            drawerData.operation === "EDIT" &&
                            <CreatePermission
                                onClose={()=>onCloseDrawer(true)}
                                menuToComponentList={menuToComponentList ?? []}
                                action={drawerData.operation}
                                permissionId={drawerData.drawerData}
                            />
                        }
                        {
                            drawerData.operation === "VIEW" &&
                            <ViewPermissions
                                permissionsId={drawerData.drawerData}
                                onClose={()=>onCloseDrawer(false)}
                                // menuToComponentList={menuToComponentList ?? []}
                                isEditable={isEditable}
                            />
                        }

                        {
                            drawerData.operation === "NEW" &&
                            <CreatePermission
                                onClose={()=>onCloseDrawer(true)}
                                menuToComponentList={menuToComponentList ?? []}
                                action={drawerData.operation}
                            />
                        }
                    </>
                </Drawer>
            </>
        </ActionPermission>
    )
}

export default PermissionList;