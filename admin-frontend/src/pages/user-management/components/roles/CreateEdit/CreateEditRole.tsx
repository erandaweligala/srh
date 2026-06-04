import { FC, useEffect, useState } from "react";
import OperationActionsEnum from "../../../../../model/operationsActionsEnum.model.ts";
import {
    Button,
    Collapse,
    Drawer,
    Form,
    FormInstance,
    Input, Select,
    Table
} from "antd";
import { DrawerState } from "../../../../../helpers/helperFunctions.tsx";
import { CloseOutlined } from "@ant-design/icons";
import CommonSquareButtonPreDefined
    from "../../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import { ButtonTypeEnum } from "../../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import { PermissionModelRoles } from "../../../models/permissions/permission.model.ts";
import { ColumnsType } from "antd/es/table";
import { RoleCreateModel } from "../../../models/roles/roleCreate.model.ts";
import { createNewRole, getSingleRoleData, updateExistingRole, searchAllRoles } from "../../../services/role.management.service.ts";
import { getMenuToComponentData } from "../../../services/permission.management.service.ts";
import { ComponentModel, MenuToComponentModel, PermissionModel } from "../../../models/permissions/permission.model.ts";
import { RoleViewModel } from "../../../models/roles/roles.model.ts";
import { RoleUpdateModel } from "../../../models/roles/roleUpdate.model.ts";
import showNotification from "../../../../../services/notification.service.tsx";

interface RolesProps {
    drawerData: DrawerState;
    drawerForm: FormInstance;
    drawerActionSubmission?: (action: OperationActionsEnum, selectedPermissionsList: PermissionModel[]) => void;
    permissionsDropdownList?: PermissionModelRoles[];
    onClose: () => void;
}

const {Panel} = Collapse;

const CreateEditRole: FC<RolesProps> = ({
    drawerData,
    permissionsDropdownList,
    onClose
}) => {

    const [searchPermissionValue, setSearchPermissionValue] = useState('');
    const [form] = Form.useForm();
    const [roleData, setRoleData] = useState<RoleViewModel>();
    const [filteredPermissionsList, setFilteredPermissionsList] = useState<PermissionModelRoles[]>([]);

    useEffect(() => {initData();},
        [])

    const initData = async () => {
        const permissions = await getPermissionsDetails();

        if (drawerData.operation === OperationActionsEnum.EDIT) {
            const role = await getRoleDetails(); // Fetch role data

            if (role && permissions) {
                // Merge role permissions into the main list
                const mergedPermissions = permissions.map(comp => {
                    const existing = role.permissions.find(p => p.componentId === comp.componentId && p.menuId === comp.menuId);
                    if (existing) {
                        return {
                            ...comp,
                            permissionId: existing.permissionId,
                            permissionName: existing.permissionName,
                            permissionDescription: existing.permissionDescription
                        };
                    }
                    return comp;
                });

                setPermissionsList(mergedPermissions);
                setFilteredPermissionsList(mergedPermissions);
            }
        } else {
            setPermissionsList(permissions || []);
            setFilteredPermissionsList(permissions || []);
        }
    };

    const getRoleDetails = async () => {
        if (!drawerData?.drawerData?.role?.roleId) {
            return null;
        }
        const response = await getSingleRoleData(drawerData.drawerData.role.roleId);
        if (response) {
            setRoleData(response);
            return response;
        }
        return null;
    };

    const getPermissionsDetails = async () => {
        const response = await getMenuToComponentData();

        const permissions = response?.filter((menu) => menu.menuName !== "Mapping Configuration").flatMap((item: MenuToComponentModel) => (
            item.components.map((component: ComponentModel) => {
                const element: PermissionModelRoles = {
                    menuId: item.menuId,
                    menuName: item.menuName,
                    componentId: component.componentId,
                    componentName: component.componentName,
                }
                return element;
            })
        ))
        // setPermissionsList(permissions); // Do not set here to avoid double render/overwrite
        // setFilteredPermissionsList(permissions);
        return permissions;
    }

    const submitDrawerData = async (operation: OperationActionsEnum) => {
        await form.validateFields();

        const roleDataIds: number[] = [];

        permissionsList.forEach(item => {
            if (item.permissionId) {
                const pId: number = parseInt(item.permissionId);
                roleDataIds.push(pId);
            }
        })

        if (roleDataIds.length === 0) {
            showNotification("ERROR", "Please select at least one permission");
            return;
        }

        if (operation === OperationActionsEnum.EDIT) {
            if (!drawerData?.drawerData?.role?.roleId) {
                showNotification("ERROR", "Role ID is missing for update");
                return;
            }
            const reqBody: RoleUpdateModel = {
                roleId: drawerData.drawerData.role.roleId,
                roleName: form.getFieldValue('roleName'),
                description: form.getFieldValue('description'),
                permissionIdList: roleDataIds

            }
            await updateExistingRole(reqBody);
            onClose();
        }

        if (roleDataIds.length > 0 && operation === OperationActionsEnum.NEW) {
            const reqBody: RoleCreateModel = {
                roleName: form.getFieldValue('roleName'),
                description: form.getFieldValue('description'),
                permissionIdList: roleDataIds

            }
            await createNewRole(reqBody);
            onClose();
        }
    }

    const searchPermissions = () => {
        const searchValue = searchPermissionValue.toLowerCase();
        if (searchValue === '') {
            setFilteredPermissionsList(permissionsList);
        } else {
            const filteredList = permissionsList.filter(permission =>
                permission.permissionName?.toLowerCase().includes(searchValue) ||
                permission.permissionId?.toLowerCase().includes(searchValue)
            );
            setFilteredPermissionsList(filteredList);
        }
    };

    const [permissionsList, setPermissionsList] = useState<PermissionModelRoles[]>([]);

    const permissionColumns: ColumnsType<PermissionModelRoles> = [
        {
            title: "Menu",
            dataIndex: "menuName",
            key: "menuName",
        },
        {
            title: "Component",
            dataIndex: "componentName",
            key: "componentName",
        },
        {
            title: "Permission Name",
            dataIndex: "permissionName",
            key: "permissionName",
            width: '220px',
            render: (_, record) => (
                <Select
                    size="small"
                    style={{ width: '220px' }}
                    defaultValue={record.permissionId}
                    onChange={(newPermissionId) => handleChange(newPermissionId, record)}
                    allowClear
                >
                    {permissionsDropdownList &&
                        permissionsDropdownList.length > 0 &&
                        permissionsDropdownList.map((item: PermissionModelRoles) => {
                            if (item.menuId === record.menuId && item.componentId === record.componentId) {
                                return <Select.Option key={item.permissionId}
                                    value={item.permissionId}>{item.permissionName}</Select.Option>
                            }
                        })
                    }
                </Select>
            ),
        },
        {
            title: "Description",
            dataIndex: "permissionDescription",
            key: "permissionDescription"
        }
    ];

    const handleChange = (newPermissionId: string, record: PermissionModelRoles) => {

        const permissionsDescription = permissionsDropdownList?.find(element => element.permissionId === newPermissionId)?.permissionDescription;

        if (permissionsList) {
            const updatePermission: PermissionModelRoles[] = permissionsList.map((element) => {
                if (element.componentId === record.componentId) {
                    return {...element, permissionId: newPermissionId, permissionDescription: permissionsDescription}
                }
                return element;
            })
            setPermissionsList(updatePermission);

            if (filteredPermissionsList) {
                const updateFiltered = filteredPermissionsList.map((element) => {
                    if (element.componentId === record.componentId) {
                        return { ...element, permissionId: newPermissionId, permissionDescription: permissionsDescription }
                    }
                    return element;
                });
                setFilteredPermissionsList(updateFiltered);
            }
        }

    };

    return (
        <Drawer
            className="common-drawer"
            width={1000}
            title={
                <span className="font-2xl-semi-bold">
                    {drawerData.operation === OperationActionsEnum.NEW && "Create New Role"}
                    {drawerData.operation === OperationActionsEnum.EDIT && "Edit Role"}
                </span>
            }
            open={drawerData.isDrawerOpen}
            onClose={onClose}
            destroyOnClose={true}
            closeIcon={<CloseOutlined className="custom-close-icon"/>}
        >
            <div className="drawer-body" >
                <div className="drawer-form-content">
                    {((drawerData.operation === 'EDIT' && roleData) || (drawerData.operation === 'NEW')) && (<Form
                        form={form}
                        layout="vertical"
                        initialValues={roleData}>

                        <>
                            <div className="mb-3">
                                <Form.Item
                                    label="Name"
                                    name="roleName"
                                    className={"mb-3"}
                                    rules={[
                                        { required: true, message: 'Name is mandatory' },
                                        {
                                            validator: async (_, value) => {
                                                if (!value) {
                                                    return Promise.resolve();
                                                }
                                                const trimmedValue = value.trim();
                                                if (drawerData.operation === OperationActionsEnum.EDIT && roleData?.roleName === trimmedValue) {
                                                    return Promise.resolve();
                                                }

                                                if (/^\d+$/.test(trimmedValue)) {
                                                    return Promise.reject(new Error('Role Name cannot contain only numbers'));
                                                }
                                                try {
                                                    const [response] = await searchAllRoles({
                                                        limit: 1000,
                                                        offset: 0,
                                                        roleName: trimmedValue
                                                    });

                                                    const isDuplicate = response.some((role: any) => {
                                                        const roleNameFromApi = (role.name || role.roleName || "").trim().toLowerCase();
                                                        return roleNameFromApi === trimmedValue.toLowerCase();
                                                    });

                                                    if (isDuplicate) {
                                                        return Promise.reject(new Error('Role name already exists.'));
                                                    }
                                                    return Promise.resolve();
                                                } catch (error) {
                                                    // If search fails, we might not want to block creation, or handle it differently.
                                                    // For now, resolving to avoid blocking if backend is down, or could generic error.
                                                    console.error("Error validating role name", error);
                                                    return Promise.resolve();
                                                }
                                            }
                                        }
                                    ]}
                                >
                                    <Input maxLength={24} placeholder={"Enter Role Name"} />
                                </Form.Item>
                                <Form.Item
                                    label="Description"
                                    name="description"
                                    rules={[
                                            {required: true, message: 'Description is mandatory'},
                                            {max: 50, message: 'Description cannot exceed 50 characters'},
                                        {
                                            validator: (_, value) => {
                                                if (!value) return Promise.resolve();

                                                const trimmed = value.trim();

                                                if (/^\d+$/.test(trimmed)) {
                                                    return Promise.reject(new Error('Description cannot contain only numbers'));
                                                }

                                                // Enforce trimmed length limit
                                                if (trimmed.length > 50) {
                                                    return Promise.reject(
                                                        new Error('Description cannot exceed 50 characters')
                                                    );
                                                }

                                                // Only special characters
                                                if (/^[^a-zA-Z0-9]+$/.test(trimmed)) {
                                                    return Promise.reject(
                                                        new Error('Description cannot contain only special characters')
                                                    );
                                                }

                                                return Promise.resolve();
                                            }
                                        }
                                    ]}
                                >
                                    <Input.TextArea maxLength={50} placeholder={"Enter Role Description"}
                                        rows={3} />
                                </Form.Item>
                            </div>
                            <div className="mt-2">
                                <Collapse
                                    defaultActiveKey={'1'}
                                    expandIconPosition="start"
                                    collapsible="icon"
                                    expandIcon={({ isActive }) => isActive ?
                                        <CommonSquareButtonPreDefined type={ButtonTypeEnum.DOWN_ARROW} /> :
                                        <CommonSquareButtonPreDefined type={ButtonTypeEnum.RIGHT_ARROW} />}
                                >
                                    <Panel header={"Permissions"} key={"1"}>
                                        <div className="mb-3" style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            gap: '12px'
                                        }}>
                                            {/* <label style={{ fontWeight: '500', whiteSpace: 'nowrap' }}>
                                                Permission Name or Permission ID
                                            </label>
                                            <Input
                                                style={{ width: '220px' }}
                                                maxLength={100}
                                                value={searchPermissionValue}
                                                onChange={(e) => setSearchPermissionValue(e.target.value)}
                                                placeholder={'Permission Name or Permission ID'}
                                                allowClear
                                            />
                                            <Button
                                                type="primary"
                                                size="small"
                                                onClick={() => searchPermissions()}
                                            >
                                                Search
                                            </Button> */}
                                        </div>
                                        {drawerData.operation === 'NEW' && filteredPermissionsList && filteredPermissionsList.length > 0 &&
                                            <Table
                                                columns={permissionColumns}
                                                dataSource={filteredPermissionsList}
                                                rowKey="id"
                                                className="common-basic-table scrollable-table"
                                                pagination={false}
                                                scroll={{ y: 250 }}
                                                tableLayout="fixed"
                                            />
                                        }
                                        {drawerData.operation === 'EDIT' && filteredPermissionsList && filteredPermissionsList.length > 0 &&
                                            <Table
                                                columns={permissionColumns}
                                                dataSource={filteredPermissionsList}
                                                rowKey="id"
                                                className="common-basic-table scrollable-table"
                                                pagination={false}
                                                scroll={{ y: 250 }}
                                                tableLayout="fixed"
                                            />
                                        }
                                    </Panel>
                                </Collapse>
                            </div>
                        </>

                    </Form>)}
                </div>
                <div className="drawer-btn-section">
                    {
                        drawerData.operation === OperationActionsEnum.EDIT &&
                        <Button type="primary" onClick={() => submitDrawerData(OperationActionsEnum.EDIT)}>
                            Update
                        </Button>
                    }
                    {
                        drawerData.operation === OperationActionsEnum.NEW &&
                        <Button type="primary" onClick={() => submitDrawerData(OperationActionsEnum.NEW)}>
                            Create
                        </Button>
                    }
                </div>
            </div>
        </Drawer>
    )
}

export default CreateEditRole;