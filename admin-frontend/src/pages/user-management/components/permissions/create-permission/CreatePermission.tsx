import { FC, useEffect, useRef, useState } from "react";
import { Button, Form, Input, Select } from "antd";
import {
    CheckedValuesObject,
    ComponentModel,
    MainActions,
    MenuToComponentModel, PermissionByComponentIdAndMenuId, PermissionsEditModel, PermissionViewModel
} from "../../../models/permissions/permission.model.ts";
import MainActionsPermissions from "../main-actions-permissions/MainActionsPermissions.tsx";
import {
    editPermissionData,
    getPermissionByComponentId,
    getSinglePermissionData,
    postCreatePermissionData
} from "../../../services/permission.management.service.ts";

interface CreateProps {
    onClose: () => void;
    menuToComponentList: MenuToComponentModel[];
    action: string;
    permissionId?: string;
}

const CreatePermission: FC<CreateProps> = ({ onClose, menuToComponentList, action, permissionId }) => {
    const [drawerForm] = Form.useForm();
    const [componentDropdownList, setComponentDropdownList] = useState<ComponentModel[]>()
    const [mainActionsData, setMainActionsData] = useState<MainActions[]>();
    const [checkedValues, setCheckedValues] = useState<CheckedValuesObject>();
    const [singlePermissionDetails, setSinglePermissionDetails] = useState<PermissionViewModel>();
    const originalMainActionsRef = useRef<MainActions[] | null>(null);

    useEffect(() => {
        if (action === 'EDIT' && permissionId) {
            getSinglePermissionDetails(permissionId);
        }
    }, [permissionId]);

    const getSinglePermissionDetails = async (permissionId: string) => {
        const res = await getSinglePermissionData(permissionId);
        if (res) {
            // Pre-populate component dropdown based on menuId before setting form values
            if (res.menuId && menuToComponentList) {
                const menus = menuToComponentList.filter(item => item.menuId === res.menuId);
                if (menus.length > 0) {
                    setComponentDropdownList(menus[0].components);
                }
            }
            setSinglePermissionDetails(res);
            // Deep copy to snapshot original state before any checkbox mutations
            originalMainActionsRef.current = JSON.parse(JSON.stringify(res.mainActions));
            setMainActionsData(res.mainActions);
        }
    }

    const isDataModified = (payload: PermissionsEditModel) => {
        if (!singlePermissionDetails) return true;

        const isNameChanged = payload.name !== singlePermissionDetails.permissionName;
        const isDescriptionChanged = payload.description !== singlePermissionDetails.description;
        const isMenuChanged = payload.menuId !== singlePermissionDetails.menuId;
        const isComponentChanged = payload.componentId !== singlePermissionDetails.componentId;

        const initialActions: string[] = [];
        const initialAttributes: string[] = [];

        const extractIds = (actions: MainActions[]) => {
            actions.forEach(action => {
                if (action.isSelected) {
                    initialActions.push(action.actionId);
                    action.attributes?.forEach(attr => {
                        if (attr.isSelected) initialAttributes.push(attr.attributeId);
                    });
                    action.subActions?.forEach(sub => {
                        if (sub.isSelected) {
                            initialActions.push(sub.actionId);
                            sub.attributes?.forEach(attr => {
                                if (attr.isSelected) initialAttributes.push(attr.attributeId);
                            });
                        }
                    });
                }
            });
        };

        // Use the original snapshot (not singlePermissionDetails.mainActions which gets mutated by checkbox changes)
        if (originalMainActionsRef.current) {
            extractIds(originalMainActionsRef.current);
        } else if (singlePermissionDetails.mainActions) {
            extractIds(singlePermissionDetails.mainActions);
        }

        const isActionsChanged =
            payload.actions.length !== initialActions.length ||
            !payload.actions.every(id => initialActions.includes(id));

        const isAttributesChanged =
            payload.attributes.length !== initialAttributes.length ||
            !payload.attributes.every(id => initialAttributes.includes(id));

        return isNameChanged || isDescriptionChanged || isMenuChanged || isComponentChanged || isActionsChanged || isAttributesChanged;
    };

    const onCreatePermissionClick = async (action: string) => {
        await drawerForm.validateFields();
        if (checkedValues?.checkedActions && (checkedValues?.checkedActions.length > 0 || checkedValues?.checkedAttributes.length > 0)) {
            const payload: PermissionsEditModel = {
                permissionId: singlePermissionDetails?.permissionId,
                name: drawerForm.getFieldValue('permissionName'),
                menuId: drawerForm.getFieldValue('menuId'),
                description: drawerForm.getFieldValue('description'),
                componentId: drawerForm.getFieldValue('componentId'),
                actions: (checkedValues?.checkedActions || []) as string[],
                attributes: (checkedValues?.checkedAttributes || []) as string[],
            }
            if (action === "NEW") {
                await postCreatePermissionData(payload);
            }
            if (action === "EDIT") {
                if (isDataModified(payload)) {
                    await editPermissionData(payload);
                }
            }
            onClose();
        } else {
            const payload: PermissionsEditModel = {
                permissionId: singlePermissionDetails?.permissionId,
                name: drawerForm.getFieldValue('permissionName'),
                menuId: drawerForm.getFieldValue('menuId'),
                description: drawerForm.getFieldValue('description'),
                componentId: drawerForm.getFieldValue('componentId'),
                actions: [],
                attributes: [],
            }
            if (action === "NEW") {
                await postCreatePermissionData(payload);
            }
            if (action === "EDIT") {
                if (isDataModified(payload)) {
                    await editPermissionData(payload);
                }
            }
            onClose();
        }
    };

    const handleMenuChange = (menuId: string) => {
        if (menuId && menuToComponentList) {
            const menus = menuToComponentList.filter(item => item.menuId === menuId);
            if (menus.length > 0) {
                // Clear component only if menu actually changed
                drawerForm.setFieldsValue({ componentId: null });
                setMainActionsData([]);
                setComponentDropdownList(menus[0].components);
            }
        }
    };

    const handleComponentChange = async (componentId: string) => {
        // const menuId = drawerForm.getFieldValue('menuId');
        const queryParams: PermissionByComponentIdAndMenuId = {
            componentId: componentId
        }
        const response = await getPermissionByComponentId(queryParams);
        setMainActionsData(response.mainActions)
    }

    return (
        <div className="drawer-body">
            <div>
                {((action === 'EDIT' && singlePermissionDetails) || (action === 'NEW')) && (
                    <Form
                        form={drawerForm}
                        layout="horizontal"
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 17 }}
                        colon={false}
                        initialValues={singlePermissionDetails}
                    >
                        <Form.Item
                            name="permissionName"
                            label="Permission Name"
                            rules={[
                                { required: true, message: 'Permission name is mandatory' },
                                { max: 24, message: "Permission Name cannot exceed 24 characters" },
                                {
                                    validator: (_, value) => {
                                        if (!value) return Promise.resolve();
                                        if (/^\d+$/.test(value.trim())) {
                                            return Promise.reject(
                                                new Error('Permission Name cannot contain only numbers')
                                            );
                                        }
                                        return Promise.resolve();
                                    }
                                }

                            ]}
                        >
                            <Input maxLength={24} placeholder="Enter Permission Name" />
                        </Form.Item>
                        <Form.Item name="menuId" label="Menu" rules={[{ required: true, message: 'Menu is mandatory' }]}>
                            <Select
                                placeholder="Menu"
                                onChange={handleMenuChange}
                            >
                                {menuToComponentList &&
                                    menuToComponentList.length > 0 &&
                                    menuToComponentList.map(
                                        (item: MenuToComponentModel) => (
                                            <Select.Option key={item.menuId}
                                                value={item.menuId}>{item.menuName}</Select.Option>
                                        )
                                    )}
                            </Select>
                        </Form.Item>

                        <Form.Item name="componentId" label="Component" rules={[{
                            required: (componentDropdownList && componentDropdownList.length > 0),
                            message: 'Component is mandatory'
                        }]}>
                            <Select
                                placeholder="Component"
                                onChange={handleComponentChange}
                                disabled={
                                    !(componentDropdownList && componentDropdownList.length > 0)
                                }
                            >
                                {componentDropdownList &&
                                    componentDropdownList.length > 0 &&
                                    componentDropdownList.map((item: ComponentModel) => (
                                        <Select.Option key={item.componentId} value={item.componentId}>
                                            {item.componentName}
                                        </Select.Option>
                                    ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[
                                { required: true, message: 'Description is mandatory' },
                                { max: 50, message: "Description cannot exceed 50 characters" },
                                {
                                    validator: (_, value) => {
                                        if (!value) return Promise.resolve();
                                        if (/^\d+$/.test(value.trim())) {
                                            return Promise.reject(
                                                new Error('Description cannot contain only numbers')
                                            );
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Input maxLength={50} placeholder="Enter Description" />
                        </Form.Item>
                    </Form>)}
            </div>
            <div >
                {mainActionsData && mainActionsData.length > 0 &&
                    <MainActionsPermissions
                        isEditable={true}
                        onChange={(e) => setCheckedValues(e)}
                        mainActions={mainActionsData} />
                }
            </div>


            <div className="drawer-btn-section text-align-right">
                <Button
                    type="primary"
                    onClick={() => onCreatePermissionClick(action)}
                    className="primary-bg-color"
                >
                    Save Permission
                </Button>
            </div>
        </div>
    )
}

export default CreatePermission;