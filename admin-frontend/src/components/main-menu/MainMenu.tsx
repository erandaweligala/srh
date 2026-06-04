import {FC, useEffect, useState} from "react";
import "./MainMenu.css";
import "./../../styles/styles.css";
import { Badge, Button, Drawer, Dropdown, Form, Menu, MenuProps, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { CloseOutlined, BellOutlined } from '@ant-design/icons';
import {hasPermissionToTheAction, hasPermissionToTheMenu} from "../../services/permission.service";
import MENU_PERMISSION from "../../constants/menuPermission";
import INTERNAL_ROUTES from "../../constants/internalRoutes";
import { useAppSelector } from "../../stores/mainStore";
import 'react-quill/dist/quill.snow.css';
import OperationActionsEnum from "../../model/operationsActionsEnum.model.ts";
import { FormInputErrorMessages } from "../../constants/formInputErrorMessages.ts";
import DropdownValue from "../../model/dropdownValue.ts";
import { DrawerState, updateDrawerState } from "../../helpers/helperFunctions.tsx";
import { getDefaultSettings, updateOTPConfigurations } from "../../services/metadata.service.ts";
import CommonApiRequest from "../../model/commonApiRequest.ts";
import showNotification from "../../services/notification.service.tsx";
import { SettingsModel } from "../../model/settings.model.ts";
import {
    DEFAULT_OTP_LENGTH_LIST,
    DEFAULT_OTP_RETRY_COUNT_LIST,
    DEFAULT_OTP_VALIDITY_LIST
} from "../../constants/validationConditions.ts";
import { ConfigNamesEnumModel } from "../../constants/configNamesEnum.model.ts";
import logo from '../../assets/images/AAA logo.png';
import { logoutAndRedirectToSessionExpirePage } from "../../services/authenticationLogic.service.ts";
import {getPendingApprovals} from "../../pages/product-catalog/services/product.catalog.service.ts";
import ACTION_PERMISSION from "../../constants/actionPermissions.ts";

type MainMenuProps = object

const MainMenu: FC<MainMenuProps> = () => {

    const authData = useAppSelector(state => state.auth);

    const navigate = useNavigate();
    const [current, setCurrent] = useState('HOME');
    const loggedInUserName = authData.decodedToken?.name;
    const items: MenuProps['items'] = [];

    const [drawerForm] = Form.useForm();
    const [drawerData, setDrawerData] = useState<DrawerState>({
        isDrawerOpen: false,
        operation: OperationActionsEnum.NEW,
        drawerData: null
    });

    const [validityList, setValidityList] = useState<DropdownValue[]>([]);
    const [lengthList, setLengthList] = useState<DropdownValue[]>([]);
    const [retryCountList, setRetryCountList] = useState<DropdownValue[]>([]);
    const [notificationCount, setNotificationCount] = useState<number>(0);

    useEffect(() => {
        fetchPendingApprovalsCount();
        console.log('authData',authData,authData.roles)
    }, []);

    const fetchPendingApprovalsCount = async () => {
        const response = await getPendingApprovals({});

        if (response?.success) {
            setNotificationCount(
                response.data?.pageDetails?.totalRecords ?? 0
            );
        }
    };


    if (hasPermissionToTheMenu(MENU_PERMISSION.DASHBOARD, authData.roles)) {
        items.push(
            {
                label: 'Home',
                key: 'HOME',
            },
        )
    }

    if (hasPermissionToTheMenu(MENU_PERMISSION.SUBSCRIBER_MANAGEMENT_INDIVIDUAL, authData.roles) || hasPermissionToTheMenu(MENU_PERMISSION.SUBSCRIBER_MANAGEMENT_GROUP, authData.roles)) {
        const subscriberManagement: {
            label: string;
            key: string;
            children: MenuProps['items']
        } = {
            label: 'Subscriber Management',
            key: 'SUBSCRIBER_MANAGEMENT',
            children: []
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.SUBSCRIBER_MANAGEMENT_INDIVIDUAL, authData.roles)) {
            subscriberManagement.children!.push(
                {
                    label: 'Subscriber Management - Individual',
                    key: 'SUBS_MGMT_INDIVIDUAL',
                }
            )
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.SUBSCRIBER_MANAGEMENT_GROUP, authData.roles)) {
            subscriberManagement.children!.push(
                {
                    label: 'Subscriber Management - Group',
                    key: 'SUBS_MGMT_GROUP',
                }
            )
        }

        items.push(subscriberManagement);
    }

    if (hasPermissionToTheMenu(MENU_PERMISSION.SEARCH_PLAN_MENU, authData.roles) || hasPermissionToTheMenu(MENU_PERMISSION.QOS_MANAGEMENT, authData.roles) || hasPermissionToTheMenu(MENU_PERMISSION.BUCKET_MANAGEMENT, authData.roles) || hasPermissionToTheAction(ACTION_PERMISSION.PENDING_APPROVALS_COMPONENT)) {
        const productCatalog: {
            label: string;
            key: string;
            children: MenuProps['items']
        } = {
            label: 'Product Catalog',
            key: 'PRODUCT_CATALOG',
            children: []
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.SEARCH_PLAN_MENU, authData.roles)) {
            productCatalog.children!.push(
                {
                    label: 'Search Plans',
                    key: 'SEARCH_PLANS',
                }
            )
        }
        if (hasPermissionToTheMenu(MENU_PERMISSION.QOS_MANAGEMENT, authData.roles)) {
            productCatalog.children!.push(
                {
                    label: 'QoS Management',
                    key: 'QOS_MANAGEMENT',
                }
            )
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.BUCKET_MANAGEMENT, authData.roles)) {
            productCatalog.children!.push(
                {
                    label: 'Bucket Management',
                    key: 'BUCKET_MANAGEMENT',
                }
            )
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.PENDING_APPROVALS, authData.roles) || hasPermissionToTheAction(ACTION_PERMISSION.PENDING_APPROVALS_COMPONENT)) {
            productCatalog.children!.push(
                {
                    label: 'Pending Approvals',
                    key: 'PENDING_APPROVALS',
                }
            )
        }

        items.push(productCatalog);
    }


   if (hasPermissionToTheMenu(MENU_PERMISSION.SESSION_HISTORY, authData.roles) || hasPermissionToTheAction(ACTION_PERMISSION.SEARCH_SESSION_ACTION)) {
        const sessionHistory: {
            label: string;
            key: string;
            children: MenuProps['items']
        } = {
            label: 'Session Details',
            key: 'SESSION_DETAILS',
            children: []
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.SESSION_HISTORY, authData.roles) || hasPermissionToTheAction(ACTION_PERMISSION.SEARCH_SESSION_ACTION)) {
            sessionHistory.children!.push(
                {
                    label: 'Session History',
                    key: 'SESSION_HISTORY',
                }
            )
        }

        items.push(sessionHistory);
    }

    if (hasPermissionToTheMenu(MENU_PERMISSION.USER, authData.roles) || hasPermissionToTheMenu(MENU_PERMISSION.ROLE, authData.roles) || hasPermissionToTheMenu(MENU_PERMISSION.PERMISSION, authData.roles)) {
        const userManagement: {
            label: string;
            key: string;
            children: MenuProps['items']
        } = {
            label: 'User Management',
            key: 'USER_MANAGEMENT',
            children: []
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.USER, authData.roles)) {
            userManagement.children!.push(
                {
                    label: 'Users',
                    key: 'USERS',
                }
            )
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.ROLE, authData.roles)) {
            userManagement.children!.push(
                {
                    label: 'Roles',
                    key: 'ROLES',
                }
            )
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.PERMISSION, authData.roles)) {
            userManagement.children!.push(
                {
                    label: 'Permissions',
                    key: 'PERMISSIONS',
                }
            )
        }

        items.push(userManagement);
    }

    if (hasPermissionToTheMenu(MENU_PERMISSION.VENDOR_SPECIFIC_CONFIGURATION, authData.roles) || hasPermissionToTheMenu(MENU_PERMISSION.NOTIFICATION_TEMPLATE, authData.roles)) {
        const configurationManagement: {
            label: string;
            key: string;
            children: MenuProps['items']
        } = {
            label: 'Configuration Management',
            key: 'CONFIGURATION_MANAGEMENT',
            children: []
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.VENDOR_SPECIFIC_CONFIGURATION, authData.roles)) {
            configurationManagement.children!.push(
                {
                    label: 'Vendor Specific Configuration',
                    key: 'VENDOR_SPECIFIC_CONFIGURATION',
                }
            )
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.NOTIFICATION_TEMPLATE, authData.roles)) {
            configurationManagement.children!.push(
                {
                    label: 'Notification Configuration',
                    key: 'NOTIFICATION_CONFIGURATION',
                }
            )
        }

        items.push(configurationManagement);
    }

    if (hasPermissionToTheMenu(MENU_PERMISSION.BNG, authData.roles)) {
        const nasBng: {
            label: string;
            key: string;
            children: MenuProps['items']
        } = {
            label: 'BNG Management',
            key: 'BNG_MANAGEMENT',
            children: []
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.BNG, authData.roles)) {
            nasBng.children!.push(
                {
                    label: 'NAS/BNG',
                    key: 'NAS_BNG',
                }
            )
        }

        items.push(nasBng);
    }


   if (hasPermissionToTheMenu(MENU_PERMISSION.MESSAGE_LOGS, authData.roles) || hasPermissionToTheMenu(MENU_PERMISSION.AUDIT_LOGS, authData.roles) || hasPermissionToTheMenu(MENU_PERMISSION.ERROR_LOGS, authData.roles)) {
        const logs: {
            label: string;
            key: string;
            children: MenuProps['items']
        } = {
            label: 'Logs',
            key: 'LOGS',
            children: []
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.MESSAGE_LOGS, authData.roles)) {
            logs.children!.push(
                {
                    label: 'Message Logs',
                    key: 'MESSAGE_LOGS',
                }
            )
        }

        if (hasPermissionToTheMenu(MENU_PERMISSION.AUDIT_LOGS, authData.roles)) {
            logs.children!.push(
                {
                    label: 'Audit Logs',
                    key: 'AUDIT_LOGS',
                }
            )
        }
        // since no bulk transactions are performed up to now
        //         if (hasPermissionToTheMenu(MENU_PERMISSION.ROLES, authData.roles)) {
        //             logs.children!.push(
        //                 {
        //                     label: 'Bulk Transactions',
        //                     key: 'BULK_TRANSACTIONS',
        //                 }
        //             )
        //         }

        if (hasPermissionToTheMenu(MENU_PERMISSION.ERROR_LOGS, authData.roles)) {
            logs.children!.push(
                {
                    label: 'Error Logs',
                    key: 'ERROR_LOGS',
                }
            )
        }

        items.push(logs);
    }

    if (hasPermissionToTheMenu(MENU_PERMISSION.REPORTS, authData.roles)) {
        items.push(
            {
                label: 'Reports',
                key: 'REPORTS',
            },
        )
    }

    const onClick = (selectedMenuDetails: { key: string }) => {
        switch (selectedMenuDetails.key) {
            case 'HOME':
                navigate(INTERNAL_ROUTES.HOME_PAGE);
                break;
            case 'VENDOR_SPECIFIC_CONFIGURATION':
                navigate(INTERNAL_ROUTES.VENDOR_SPECIFIC_CONFIGURATION);
                break;
            case 'USERS':
                navigate(INTERNAL_ROUTES.USERS);
                break;
            case 'FAQS':
                navigate(INTERNAL_ROUTES.FAQS);
                break;
            case 'MANAGE_CATEGORIES':
                navigate(INTERNAL_ROUTES.FAQ_CATEGORIES);
                break;
            case 'BLOCK_UNBLOCK_USERS':
                navigate(INTERNAL_ROUTES.BLOCK_UNBLOCK_USERS);
                break;
            case 'TERMS_AND_CONDITIONS':
                navigate(INTERNAL_ROUTES.TERMS_AND_CONDITIONS);
                break;
            case 'USER_APPROVALS':
                navigate(INTERNAL_ROUTES.USER_APPROVALS);
                break;
            case 'OTP_CONFIGURATIONS':
                onClickOTPConfiguration();
                break;
            case 'ROLES':
                navigate(INTERNAL_ROUTES.ROLES);
                break;
            case 'PERMISSIONS':
                navigate(INTERNAL_ROUTES.PERMISSIONS);
                break;
            case 'SUBS_MGMT_INDIVIDUAL':
                navigate(INTERNAL_ROUTES.SUBSCRIBERS);
                break;
            case 'SUBS_MGMT_GROUP':
                navigate(INTERNAL_ROUTES.SUBSCRIBERS_GROUP);
                break;
            case 'SESSION_HISTORY':
                navigate(INTERNAL_ROUTES.SESSION_HISTORY);
                break;
            case 'NAS_BNG':
                navigate(INTERNAL_ROUTES.NAS_BNG);
                break;
            case 'SEARCH_PLANS':
                navigate(INTERNAL_ROUTES.PRODUCT_CATALOG);
                break;
            case 'QOS_MANAGEMENT':
                navigate(INTERNAL_ROUTES.QOS_MANAGEMENT);
                break;
            case 'PENDING_APPROVALS':
                navigate(INTERNAL_ROUTES.PENDING_APPROVALS);
                break;
            case 'NOTIFICATION_CONFIGURATION':
                navigate(INTERNAL_ROUTES.NOTIFICATION_CONFIGURATION);
                break;
            case 'BUCKET_MANAGEMENT':
                navigate(INTERNAL_ROUTES.BUCKET_MANAGEMENT);
                break;
            case 'MESSAGE_LOGS':
                navigate(INTERNAL_ROUTES.MESSAGE_LOGS);
                break;
            case 'AUDIT_LOGS':
                navigate(INTERNAL_ROUTES.AUDIT_LOGS);
                break;
            case 'BULK_TRANSACTIONS':
                navigate(INTERNAL_ROUTES.BULK_TRANSACTIONS);
                break;
            case 'ERROR_LOGS':
                navigate(INTERNAL_ROUTES.ERROR_LOGS);
                break;
            case 'REPORTS':
                navigate(INTERNAL_ROUTES.REPORTS_PAGE);
                break;
            default:
                navigate(INTERNAL_ROUTES.ROLES);
                break;
        }
        setCurrent(selectedMenuDetails.key);
    };


    const nameLabels: MenuProps['items'] = [
        {
            key: '3',
            label: (
                <button
                    type="button"
                    onClick={logoutAndRedirectToSessionExpirePage}
                    style={{
                        maxWidth: 60,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left"
                    }}
                >
                    Logout
                </button>
            )
        }
    ]

    const onClickOTPConfiguration = () => {
        getOTPConfigs();
    }

    const closeDrawer = () => {
        updateDrawerState(setDrawerData, {
            isDrawerOpen: false,
            operation: OperationActionsEnum.NEW,
            drawerData: null
        });
    }

    const getOTPConfigs = async () => {
        const request: CommonApiRequest<{ category: string[] }> = {
            requestHeader: null,
            requestBody: {
                category: ["OTP"]
            }
        }

        const response = await getDefaultSettings(request);

        if (response) {
            drawerForm.setFieldsValue(
                {
                    OTPLength: response.configList.find((config) => {
                        return config.configKey === ConfigNamesEnumModel.OTPLength
                    })?.configValue,
                    OTPValidity: response.configList.find((config) => {
                        return config.configKey === ConfigNamesEnumModel.OTPValidity
                    })?.configValue,
                    OTPRetryCount: response.configList.find((config) => {
                        return config.configKey === ConfigNamesEnumModel.OTPRetryCount
                    })?.configValue
                }
            );
            setValidityList(createConfigDropdownList(response, ConfigNamesEnumModel.OTPValidityList, DEFAULT_OTP_VALIDITY_LIST, '', true));
            setLengthList(createConfigDropdownList(response, ConfigNamesEnumModel.OTPLengthList, DEFAULT_OTP_LENGTH_LIST, '-Digit', false));
            setRetryCountList(createConfigDropdownList(response, ConfigNamesEnumModel.OTPRetryCountList, DEFAULT_OTP_RETRY_COUNT_LIST, '', false));
            updateDrawerState(setDrawerData, {
                isDrawerOpen: true,
                operation: OperationActionsEnum.NEW,
                drawerData: response
            });
        }
    }

    const createConfigDropdownList = (
        settingsList: SettingsModel,
        key: string,
        defaultValues: string,
        unit: string,
        isSeconds: boolean
    ): DropdownValue[] => {
        const configList = settingsList.configList.find((config) => {
            return config.configKey === key
        })?.configValue;

        const updatedList: string[] = configList ? configList.split(',') : defaultValues.split(',');

        if (isSeconds) {
            return updatedList.map((item) => {
                if (Number(item) < 60) {
                    return { label: item + ' seconds', value: item }
                } else {
                    return { label: (Number(item) / 60) + ' minutes', value: item }
                }
            })
        } else {
            return updatedList.map((item) => {
                return { label: item + unit, value: item }
            })
        }

    }

    const updateOTPConfigs = async () => {
        const updatedConfigurations: { configKey: string; configValue: string; }[] = [
            {
                configKey: ConfigNamesEnumModel.OTPLength,
                configValue: drawerForm.getFieldValue(ConfigNamesEnumModel.OTPLength)
            },
            {
                configKey: ConfigNamesEnumModel.OTPRetryCount,
                configValue: drawerForm.getFieldValue(ConfigNamesEnumModel.OTPRetryCount)
            },
            {
                configKey: ConfigNamesEnumModel.OTPValidity,
                configValue: drawerForm.getFieldValue(ConfigNamesEnumModel.OTPValidity)
            }
        ];

        const request: CommonApiRequest<{ configList: { configKey: string; configValue: string; }[] }> = {
            requestHeader: null,
            requestBody: {
                configList: updatedConfigurations
            }
        }

        const response = await updateOTPConfigurations(request);

        if (response) {
            showNotification('SUCCESS', 'OTP Configurations updated');
            closeDrawer();
        }
    }

    const handleBellClick = () => {
        navigate(INTERNAL_ROUTES.PENDING_APPROVALS);
    };

    return (
        <div className="main-menu-container">
            <div className="logo-container content-center-all-side mx-3">
                <img src={logo} alt="AAA" className="logo-img" />
                <div className="logo-sub-text">ADMIN CONSOLE</div>
            </div>
            <Menu
                onClick={onClick}
                selectedKeys={[current]}
                mode="horizontal"
                items={items}
                style={{ width: 900 }}
            />
            <div className="logout-notification-settings content-center-all-side me-3">

                <div
                    className="notification-bell"
                    onClick={handleBellClick}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => { if ((e as React.KeyboardEvent).key === 'Enter') handleBellClick(); }}
                    style={{ cursor: 'pointer' }}
                >
                    {notificationCount && notificationCount > 0 ? (
                        <Badge count={notificationCount} size="small">
                            <BellOutlined style={{ fontSize: '16px', color: '#FFFFFF' }} />
                        </Badge>
                    ) : (
                        <BellOutlined style={{ fontSize: '16px', color: '#FFFFFF' }} />
                    )}
                </div>

                <Dropdown
                    menu={{ items: nameLabels }}
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <button
                        type="button"
                        className="name-label user-menu-trigger"
                        aria-label="User menu"
                        title={loggedInUserName}
                    >
                        {loggedInUserName}
                    </button>
                </Dropdown>
            </div>

            <Drawer
                className="common-drawer"
                width={500}
                title={'OTP Configurations'}
                open={drawerData.isDrawerOpen}
                onClose={closeDrawer}
                destroyOnClose={true}
                closeIcon={<CloseOutlined className="custom-close-icon" />}
            >
                <div className="drawer-body">
                    <Form
                        form={drawerForm}
                        layout="vertical"
                    >
                        <Form.Item
                            label="OTP Validity"
                            name="OTPValidity"
                            className="no-star"
                            rules={[{ required: true, message: FormInputErrorMessages.REQUIRED }]}
                        >
                            <Select
                                allowClear
                                showSearch
                                className="w-100"
                                placeholder="Select OTP Validity"
                            >
                                {
                                    validityList &&
                                    validityList.length > 0 &&
                                    validityList?.map((item: DropdownValue) => (
                                        <Select.Option
                                            value={item.value}
                                            key={item.value}
                                        >
                                            {item.label}
                                        </Select.Option>
                                    ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="OTP Length"
                            name="OTPLength"
                            className="no-star"
                            rules={[{ required: true, message: FormInputErrorMessages.REQUIRED }]}
                        >
                            <Select
                                allowClear
                                showSearch
                                className="w-100"
                                placeholder="Select OTP Length"
                            >
                                {
                                    lengthList &&
                                    lengthList.length > 0 &&
                                    lengthList?.map((item: DropdownValue) => (
                                        <Select.Option
                                            value={item.value}
                                            key={item.value}
                                        >
                                            {item.label}
                                        </Select.Option>
                                    ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="OTP Retry Count"
                            name="OTPRetryCount"
                            className="no-star"
                            rules={[{ required: true, message: FormInputErrorMessages.REQUIRED }]}
                        >
                            <Select
                                allowClear
                                showSearch
                                className="w-100"
                                placeholder="Select OTP Retry Count"
                            >
                                {
                                    retryCountList &&
                                    retryCountList.length > 0 &&
                                    retryCountList?.map((item: DropdownValue) => (
                                        <Select.Option
                                            value={item.value}
                                            key={item.value}
                                        >
                                            {item.label}
                                        </Select.Option>
                                    ))}
                            </Select>
                        </Form.Item>
                    </Form>
                    <div className="drawer-btn-section">
                        <Button onClick={updateOTPConfigs}>
                            Save Configurations
                        </Button>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}

export default MainMenu;