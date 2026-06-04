import {FC, useEffect, useRef, useState} from "react";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission";
import ACTION_PERMISSION from "../../../../constants/actionPermissions";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb";
import "./Users.css";
import "./../../../../styles/styles.css";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel";
import {InputsProps} from "../../../../components/common-search-panel/models/InputsProps.model";
import {Button, Drawer, Form, Input, Select, Table, TablePaginationConfig} from "antd";
import OperationActionsEnum from "../../../../model/operationsActionsEnum.model.ts";
import {formatValue} from "../../../../helpers/stringValidators";
import {UsersTableColumns} from "../../models/user/UsersTableColumns.tsx";
import {
    DrawerState, renderStatusTag,
    updateDrawerState,
    updatePaginationDetails
} from "../../../../helpers/helperFunctions.tsx";
import {UsersSearchRequestModel} from "../../models/user/usersSearchRequest.model.ts";
import {UsersModel} from "../../models/user/users.model.ts";
import {useAppDispatch, useAppSelector} from "../../../../stores/mainStore.ts";
import {getAllRoles, getStatusMetaData} from "../../../../services/metadata.service.ts";
import {metadataAction} from "../../../../stores/metadataStore.ts";
import {CloseOutlined} from "@ant-design/icons";
import DropdownValue from "../../../../model/dropdownValue.ts";
import {
    createNewUserRequest,getSingleUserData,
    searchAllUsers,
    updateUserRequest
} from "../../services/user.management.service.ts";
import {MetaDataModel} from "../../models/roles/roles.model.ts";
// import {RolesSearchRequestModel} from "../../models/roles/rolesSearchRequest.model.ts";
import showNotification from "../../../../services/notification.service.tsx";
import CommonConfirmModal from "../../../../components/common-confirm-modal/CommonConfirmModal.tsx";
import CommonTabBar, {CommonTabBarRef} from "../../../../components/common-tab-bar/CommonTabBar.tsx";
import {UserUpdateModel} from "../../models/user/user.update.model.ts";

type UsersProps = object

const Users: FC<UsersProps> = () => {

    const userData = useAppSelector(state => state.auth);

    const [rolesList, setRolesList] = useState<{ label: string; value: string; name: string; }[]>([]);
    const [statusList, setStatusList] = useState<MetaDataModel[]>([]);
    const [tableData, setTableData] = useState<UsersModel[]>([]);
    const [userDetails, setUserDetails] = useState<UserUpdateModel| undefined>();
    const [drawerData, setDrawerData] = useState<DrawerState>({
        isDrawerOpen: false,
        operation: OperationActionsEnum.NONE,
        drawerData: null
    });

    // const [selectedRole, setSelectedRole] = useState<RolesRequestModel | null>(null);

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
        totalCount?: number
    }>({currentPage: 1, currentItemPerPage: 10, totalCount: 0});

    const [formValues, setFormValues] = useState<{
        userName: string | null;
        roleId: string | null;
        statusId: string | null;
    }>({
        userName: null,
        roleId: null,
        statusId: null
    });

    const dispatch = useAppDispatch();

    const metaData = useAppSelector(state => state.metadata);

    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    // const [deletingUser, setDeletingUser] = useState<UsersModel | null>(null);
    const [drawerOperation, setDrawerOperation] = useState<OperationActionsEnum>(OperationActionsEnum.BLOCK);

    const [activeTab, setActiveTab] = useState("search");
    const tabBarRef = useRef<CommonTabBarRef>(null);
    const [tabDataMap, setTabDataMap] = useState<Record<string, any>>({});

    const [drawerForm] = Form.useForm();

    const searchPanelInputs: InputsProps[] = [
        {
            type: "INPUT",
            valueName: "userName",
            label: "Username",
            required: false,
            mainInput: true,
            placeholder: "Enter Username"
        },
        {
            type: "DROPDOWN",
            valueName: "roleId",
            label: "Role",
            required: false,
            mainInput: true,
            placeholder: "Select Role",
            values: rolesList
        },
        {
            type: "DROPDOWN",
            valueName: "statusId",
            label: "Status",
            required: false,
            mainInput: true,
            placeholder: "Select Status",
            values: statusList
        }
    ];

    useEffect(() => {
        searchUsers(formValues, 10, 0);
        if (metaData.userRolesList.length > 0 && metaData.userStatusList.length > 0) {
            setRolesList(metaData.userRolesList);
            setStatusList(metaData.userStatusList);
        } else {
            getMetaData();
        }
    }, []);


    const getMetaData = async () => {
        const [responseRoles, responseStatus] = await Promise.all([
            getAllRoles(),
            getStatusMetaData()
        ]);

        if (responseStatus) {
            dispatch(metadataAction.setUserStatusList(responseStatus));
            setStatusList(responseStatus);
        }
        if (responseRoles) {
            const updatedRoleData = responseRoles.map((item) => {
                return {label: item.label, value: item.value, name: item.label}
            })
            dispatch(metadataAction.setUserRolesList(updatedRoleData));
            setRolesList(updatedRoleData);
        }
    }

    const searchUsers = async (formValues:{
        userName: string | null;
        roleId: string | null;
        statusId: string | null;
    }, limit: number, offset: number) => {

        const queryParams : UsersSearchRequestModel = {
            userName: formValues?.userName,
            roleId: formValues?.roleId,
            statusId: formValues?.statusId,
            limit: limit,
            offset: offset,
            
        }
        const response = await searchAllUsers(queryParams);

        if (response) {
            setTableData(response[0]);
            setPaginationDetails((prev) => ({
                ...prev,
                currentPage: response[1].pageNumber,
                totalCount: response[1].totalRecords
            }));
        }
    }

    const onTableChange = (pagination: TablePaginationConfig) => {
        setPaginationDetails((currentPagination) => updatePaginationDetails(pagination, currentPagination));
        searchUsers(formValues, pagination.pageSize!, (pagination.current! - 1) * pagination.pageSize!)

    };

    const openCreateUserDrawer = () => {
        updateDrawerState(setDrawerData, {
            isDrawerOpen: true,
            operation: OperationActionsEnum.NEW,
            drawerData: null
        });
        setUserDetails(undefined);
        drawerForm.resetFields();
    }

    // const closeDrawer = () => {
    //     setDrawerData({
    //         isDrawerOpen: false,
    //         operation: OperationActionsEnum.NONE,
    //         drawerData: null
    //     })
    //     drawerForm.resetFields();
    //     // setDescriptionItems([])
    //     // setSelectedRole(null);
    // }
    const closeDrawer = () => {
        setDrawerData(prev => ({
            ...prev,
            isDrawerOpen: false,
            operation: OperationActionsEnum.NONE,
            drawerData: null
        }));

        // reset after a tick to avoid race with unmount
        setTimeout(() => {
            drawerForm.resetFields();
        }, 0);
    }


    const openViewEditUserDrawer = async (operation: OperationActionsEnum, user: UsersModel) => {
        const response = await getSingleUserData(user.userId);
        setUserDetails(response)
        // setSelectedRole({name: user.roleName, id: user.roleId});
        if (operation !== OperationActionsEnum.BLOCK && operation !== OperationActionsEnum.UNBLOCK) {
            // drawerForm.setFieldsValue(response);
            const statusValue = statusList.find(
                s => s.label === response.status
            )?.value;

            drawerForm.setFieldsValue({
                ...response,
                status: statusValue
            });

            updateDrawerState(setDrawerData, {
                isDrawerOpen: true,
                operation: operation,
                drawerData: response
            });
        } else {
            setDrawerOperation(operation);
            setIsConfirmOpen(true);
            // setDeletingUser(response);
        }
    }

    const onSearchFormSubmit = (formValues: {
        userName: string | null;
        roleId: string | null;
        statusId: string | null;
    }) => {
        setFormValues(formValues);
        searchUsers(formValues, paginationDetails.currentItemPerPage, 0);
    }

    const onClear = () => {
        const clearedValues = {
            userName: null,
            roleId: null,
            statusId: null
        };
        setFormValues(clearedValues);
        searchUsers(clearedValues, paginationDetails.currentItemPerPage, 0);
    }

    const openViewMoreTab = async (rowData: any) => {
        const tabKey = `user-view-${rowData.userId}`;
        const tabLabel = "User Details";

        const response = await getSingleUserData(rowData.userId);

        setTabDataMap(prev => ({
            ...prev,
            [tabKey]: response
        }));

        tabBarRef.current?.openTab({ key: tabKey, label: tabLabel });
        setActiveTab(tabKey);
    };

    const createNewUser = async (operation: OperationActionsEnum) => {
        drawerForm.validateFields().then(async () => {

            const {name, roleId, email, mobileNumber, status} = drawerForm.getFieldsValue();

            if (operation === OperationActionsEnum.NEW) {
                const  requestBody = {
                    name: name,
                    status: status,
                    email: email,
                    mobileNumber: mobileNumber,
                    roleId: roleId
                }

                const response = await createNewUserRequest(requestBody).then(()=> {
                    reloadPage();
                });
                console.log('response',response)

            } else if (operation === OperationActionsEnum.EDIT) {
                if(userData.decodedToken?.email === drawerData.drawerData.email && status === 'INACTIVE'){
                    showNotification('WARNING', 'Cannot deactivate the logged in user');
                } else {
                    const requestBody = {
                        userId: drawerData.drawerData.userId,
                        name: name,
                        status: status,
                        mobileNumber: mobileNumber,
                        roleId: roleId,
                        email: email
                    }

                    try {
                        const response = await updateUserRequest(requestBody);
                        if (response) {
                            closeDrawer();
                            searchUsers(formValues, paginationDetails.currentItemPerPage, 0);
                        }

                    } catch (err: any) {
                        console.log('Error updating user:', err);
                        const errorMessage = err?.response?.result.resultDescription || "Failed to update user. Please try again.";
                        showNotification("ERROR", errorMessage)

                    }

                }
            }
        })
    }
    useEffect(() => {
        if (drawerData.operation === OperationActionsEnum.EDIT && userDetails) {
            const statusValue = statusList.find(s => s.label === userDetails.status)?.value;
            drawerForm.setFieldsValue({
                ...userDetails,
                status: statusValue
            });
        }
    }, [userDetails, drawerData.operation, statusList, drawerForm]);


    const reloadPage = () => {
        closeDrawer();
        searchUsers(formValues, paginationDetails.currentItemPerPage, 0);
        setPaginationDetails(prev => ({ ...prev, currentPage: 1 }));
    }


    // const onSelectRole = (roleId: string) => {
    //     const selectedRole = rolesList.find((role) => {
    //         return role.value === roleId
    //     })!
    //     setSelectedRole({name: selectedRole.name, id: selectedRole.value});
    // }



    const deleteUserConfirmation = async () => {
        //     if (deletingUser && deletingUser.userId) {
        //         if(drawerOperation === OperationActionsEnum.BLOCK){
        //             if(deletingUser.email !== userData.decodedToken?.email){
        //                 const reqBody: CommonApiRequest<{ userId: string }> = {
        //                     requestBody: {
        //                         userId: deletingUser.id
        //                     },
        //                     requestHeader: null
        //                 }
        //
        //                 const response = await deleteUserAccount(reqBody);
        //
        //                 if (response) {
        //                     showNotification('SUCCESS', 'User deleted successfully');
        //                     reloadPage();
        //                     cancelUserDeletion();
        //                 }
        //             } else {
        //                 showNotification('WARNING', 'Cannot delete the logged in user');
        //             }
        //         } else {
        //             // const reqBody: CommonApiRequest<UserUpdateModel> = {
        //             //     requestBody: {
        //             //         id: deletingUser.id,
        //             //         userId: deletingUser.userId,
        //             //         name: deletingUser.name,
        //             //         email: deletingUser.email,
        //             //         mobileNumber: deletingUser.mobileNumber,
        //             //         status: 'ACTIVE',
        //             //         roleId: deletingUser.roleId
        //             //     },
        //             //     requestHeader: null
        //             // }
        //             //
        //             // const response = await updateUserRequest(reqBody);
        //
        //             // if (response) {
        //                 showNotification("SUCCESS", 'User activated successfully');
        //                 reloadPage();
        //                 cancelUserDeletion();
        //             // }
        //         }
        //     } else {
        //         showNotification('ERROR', 'Something went wrong! Please try again shortly');
        //     }
    }

    const cancelUserDeletion = () => {
        setIsConfirmOpen(false);
        // setDeletingUser(null);
    }

    // const handleDeleteClick = (user: UsersModel) => {
    //     setDeletingUser(user);
    //     setIsConfirmOpen(true);
    //     setDrawerData(prev => ({
    //         ...prev,
    //         operation: OperationActionsEnum.DELETE
    //     }));
    // };

    const columnsUserViewMore = [
        { title: 'Field', dataIndex: 'field1', key: 'field1', width: '14%', onCell: () => ({ style: { backgroundColor: '#f5f5f5', fontWeight: '500' } }) },
        { title: 'Value', dataIndex: 'value1', key: 'value1', width: '19.3%' },
        { title: 'Field', dataIndex: 'field2', key: 'field2', width: '14%', onCell: () => ({ style: { backgroundColor: '#f5f5f5', fontWeight: '500' } }) },
        {
            title: 'Value', dataIndex: 'value2', key: 'value2', width: '19.3%',
            render: (text: any, record: any) => {
                if (record.field2 === 'Status') {
                    return renderStatusTag(text, "left-align-status");
                }
                return formatValue(text);
            }
        },
        { title: 'Field', dataIndex: 'field3', key: 'field3', width: '14%', onCell: () => ({ style: { backgroundColor: '#f5f5f5', fontWeight: '500' } }) },
        { title: 'Value', dataIndex: 'value3', key: 'value3', width: '19.3%' }
    ];

    //-----Mobile Number hidden due to requirements change-----
    const dataUserViewMore = [
        {
            field1: "User ID", value1: tabDataMap[activeTab]?.userId || "N/A",
            field2: "Username", value2: tabDataMap[activeTab]?.name || "N/A",
            field3: "User Role", value3: tabDataMap[activeTab]?.roleName || "N/A"
        },
        {
            field1: "Email Address", value1: tabDataMap[activeTab]?.email || "N/A",
            // field2: "Mobile Number", value2: tabDataMap[activeTab]?.mobileNumber || "N/A",
            field2: "Status", value2: tabDataMap[activeTab]?.status || "N/A",
            field3: "", value3: ""
        }
    ];

    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_USERS_ACTION}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>User Management</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Users</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    ref={tabBarRef}
                    initialTabs={[
                        { key: "search", label: "Users" }
                    ]}
                    initialActiveKey="search"
                    onTabClick={setActiveTab}
                />

                {activeTab === "search" && (
                    <div className="common-page-margin" style={{ marginTop: "0px" }}>
                        <ActionPermission action={ACTION_PERMISSION.SEARCH_USERS_ACTION}><CommonSearchPanel
                            inputs={searchPanelInputs}
                            title="Search Conditions"
                            isExpandBtnVisible={false}
                            onSubmit={onSearchFormSubmit}
                            onClear={onClear}
                            initialValues={formValues}
                        />
                        </ActionPermission>
                        <ActionPermission action={ACTION_PERMISSION.ADD_NEW_USER_ACTION}>
                        <div className="common-button-bar">
                            <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                {/*<Button*/}
                                {/*    type="default"*/}
                                {/*    size="small"*/}
                                {/*    onClick={() => /!* handle export action *!/}*/}
                                {/*>*/}
                                {/*    Upload*/}
                                {/*</Button>*/}
                                {/* <Button
                                    type="primary"
                                    size="small"
                                style={{fontSize: 12}}
                                    onClick={openCreateUserDrawer}
                                >
                                    Create New User
                                </Button>  //NOTE: Buttons removed from UI for current scope.Code preserved to support future feature expansion if required.*/}
                            </div>
                        </div>
                        </ActionPermission>

                        <div>
                            <Table
                                columns={UsersTableColumns(openViewMoreTab, openViewEditUserDrawer
                                    // , handleDeleteClick
                                )}
                                dataSource={tableData}
                                className="common-basic-table"
                                onChange={onTableChange}
                                rowKey="id"
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

                {activeTab.startsWith("user-view-") && (
                    <div className="common-page-margin">
                        <div className="bordered-container" style={{ marginTop: "10px" }}>
                            <Table
                                className="common-basic-table custom-bordered-table"
                                columns={columnsUserViewMore}
                                dataSource={dataUserViewMore}
                                pagination={false}
                                showHeader={false}
                            />
                        </div>
                    </div>
                )}

                <Drawer
                    className="common-drawer"
                    width={500}
                    title={
                        <span className="font-2xl-semi-bold">
                            {drawerData.operation === OperationActionsEnum.NEW && "Create New User"}
                            {drawerData.operation === OperationActionsEnum.VIEW && "View User"}
                            {drawerData.operation === OperationActionsEnum.EDIT && "Edit User"}
                        </span>
                    }
                    open={drawerData.isDrawerOpen}
                    onClose={closeDrawer}
                    destroyOnClose={true}
                    closeIcon={<CloseOutlined className="custom-close-icon"/>}
                >
                    <div className="drawer-body">
                        <Form
                            form={drawerForm}
                            layout="vertical"
                            initialValues={drawerData.operation === OperationActionsEnum.EDIT ? userDetails : undefined}
                            onFinish={createNewUser}
                        >
                            {
                                drawerData.operation !== OperationActionsEnum.VIEW &&
                                <>
                                    {
                                        drawerData.operation === OperationActionsEnum.EDIT &&
                                        <>
                                            <Form.Item
                                                label="User ID"
                                                name="userId"
                                            >
                                                <Input maxLength={50} disabled={true}/>
                                            </Form.Item>
                                        </>
                                    }

                                    {
                                        ((drawerData.operation === OperationActionsEnum.NEW) ||
                                            drawerData.operation === OperationActionsEnum.EDIT) &&
                                        <>
                                            <Form.Item
                                                label="Username"
                                                name="name"
                                                rules={[
                                                    { required: true, message: 'Required Field' }
                                                ]}
                                            >
                                                <Input maxLength={20} placeholder="Enter Username"/>
                                            </Form.Item>
                                            <Form.Item
                                                label="User Role"
                                                name="roleId"
                                                rules={[
                                                    { required: true, message: 'Required Field' }
                                                ]}
                                            >
                                                <Select
                                                    allowClear
                                                    showSearch
                                                    className="w-100"
                                                    placeholder="Select User Role"
                                                >
                                                    {
                                                        rolesList &&
                                                        rolesList.length > 0 &&
                                                        rolesList?.map((item: DropdownValue) => (
                                                            <Select.Option
                                                                value={item.value}
                                                                key={item.value}
                                                            >
                                                                {item.label}
                                                            </Select.Option>
                                                        ))}
                                                </Select>
                                            </Form.Item>
                                        </>
                                    }
                                    {
                                        (drawerData.operation === OperationActionsEnum.NEW ||
                                            drawerData.operation === OperationActionsEnum.EDIT) &&
                                        <>
                                            <Form.Item
                                                label="Email Address"
                                                name="email"
                                                rules={[
                                                    { required: true, message: 'Required Field' },
                                                    { type: 'email', message: 'Please enter a valid email address' },
                                                ]}

                                            >
                                                <Input maxLength={50} placeholder="Enter Email Address" disabled={drawerData.operation === OperationActionsEnum.EDIT} />
                                            </Form.Item>
                                        </>
                                    }
                                    {/*{*/}
                                    {/*    (drawerData.operation === OperationActionsEnum.NEW ||*/}
                                    {/*        drawerData.operation === OperationActionsEnum.EDIT) &&*/}
                                    {/*    <>*/}
                                    {/*        <Form.Item*/}
                                    {/*            label="Mobile Number"*/}
                                    {/*            name="mobileNumber"*/}
                                    {/*            rules={[*/}
                                    {/*                { required: true, message: 'Required Field' }*/}
                                    {/*            ]}*/}
                                    {/*        >*/}
                                    {/*            <Input maxLength={15} placeholder="Enter Mobile Number"/>*/}
                                    {/*        </Form.Item>*/}
                                    {/*    </>*/}
                                    {/*}*/}
                                    {
                                        (drawerData.operation == OperationActionsEnum.NEW ||
                                            drawerData.operation == OperationActionsEnum.EDIT) &&
                                        <Form.Item
                                            label="Status"
                                            name="status"
                                            rules={[
                                                { required: true, message: 'Required Field' }
                                            ]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                className="w-100"
                                                placeholder="Select Status"
                                            >
                                                {
                                                    statusList &&
                                                    statusList.length > 0 &&
                                                    statusList?.map((item: DropdownValue) => (
                                                        <Select.Option
                                                            value={item.value}
                                                            key={item.value}
                                                        >
                                                            {item.label}
                                                        </Select.Option>
                                                    ))}
                                            </Select>
                                        </Form.Item>
                                    }
                                </>
                            }
                        </Form>
                        <div className="drawer-btn-section">
                            {
                                drawerData.operation === OperationActionsEnum.NEW &&
                                <Button type="primary" onClick={() => createNewUser(OperationActionsEnum.NEW)}>
                                    Create User
                                </Button>
                            }
                            {
                                drawerData.operation === OperationActionsEnum.EDIT &&
                                <Button type="primary" onClick={() => createNewUser(OperationActionsEnum.EDIT)}>
                                    Update
                                </Button>
                            }
                        </div>
                    </div>
                </Drawer>

                {
                    drawerData.operation !== OperationActionsEnum.DELETE &&
                    <>
                        <CommonConfirmModal
                            isOpen={isConfirmOpen}
                            title={`Are you sure to ${drawerOperation === OperationActionsEnum.BLOCK? 'Deactivate':'Activate'} the user?`}
                            okText={'Confirm'}
                            cancelText={'Cancel'}
                            btnDanger={drawerOperation === OperationActionsEnum.BLOCK}
                            onOk={deleteUserConfirmation}
                            onCancel={cancelUserDeletion}
                        />
                    </>
                }

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

export default Users;