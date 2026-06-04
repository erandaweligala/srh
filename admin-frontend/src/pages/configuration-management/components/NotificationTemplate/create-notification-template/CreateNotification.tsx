import { FC, useEffect } from "react";
import { Form, Button, Input, Select, Card } from "antd";
import { MinusSquareOutlined, PlusCircleOutlined } from "@ant-design/icons";
import OperationActionsEnum from "../../../../../model/operationsActionsEnum.model.ts";
import showNotification from "../../../../../services/notification.service.tsx";
import { createNotificationTemplateRequest, updateNotificationTemplateRequest } from "../../../services/notification.template.service.ts";
import { NotificationTemplateFormModel } from "../../../models/notification-template.creation.model.ts";
import { NotificationTemplateUpdateModel } from "../../../models/notification-template.update.model.ts";
import { DrawerState } from "../../../../../helpers/helperFunctions.tsx";
import { NotificationTemplateModel, SubTemplateModel } from "../../../models/notification-template.model.ts";
import "../NotificationTemplate.css";
import { useAppSelector } from "../../../../../stores/mainStore.ts";

interface CreateNotificationProps {
    drawerData: DrawerState;
    onClose: () => void;
    record?: NotificationTemplateModel;
    existingTemplates?: NotificationTemplateModel[];
}

const CreateNotification: FC<CreateNotificationProps> = ({ drawerData, onClose, record, existingTemplates = [] }) => {
    const [drawerForm] = Form.useForm<NotificationTemplateFormModel>();
    const loggedInUserName = useAppSelector(state => state.auth.decodedToken?.preferred_username);
    const quotaPercentageOptions = Array.from({ length: 100 }, (_, i) => i + 1);

    //const [quotaPercentages, setQuotaPercentages] = useState<number[]>([]);

    // useEffect(() => {
    //     const fetchQuotaPercentages = async () => {
    //         try {
    //             const response = await getQuotaPercentagesRequest();
    //             if (response?.data?.data) {
    //                 setQuotaPercentages(response.data.data);
    //             }
    //         } catch (error) {
    //             console.error("Failed to fetch quota percentages", error);
    //         }
    //     };
    //     fetchQuotaPercentages();
    // }, []);


    useEffect(() => {
        if (drawerData.operation === OperationActionsEnum.EDIT && record) {
            const usageTemplates = record.templates?.filter((t: SubTemplateModel) => t.messageType === "USAGE") || [];
            const expireTemplates = record.templates?.filter((t: SubTemplateModel) => t.messageType === "EXPIRED") || [];
            const userCreationTemplates = record.templates?.filter((t: SubTemplateModel) => t.messageType === "USER_CREATION") || [];
            const userUpdateTemplates = record.templates?.filter((t: SubTemplateModel) => t.messageType === "USER_UPDATE") || [];

            drawerForm.setFieldsValue({
                templateName: record.templateName,
                status: record.status,
                isDefault: record.isDefault,
                usageTemplates: usageTemplates,
                expireTemplates: expireTemplates,
                userCreationTemplates: userCreationTemplates,
                userUpdateTemplates: userUpdateTemplates
            });
        } else if (drawerData.operation === OperationActionsEnum.NEW) {
            drawerForm.setFieldsValue({
                templateName: undefined,
                status: undefined,
                isDefault: false,
                usageTemplates: [{ messageType: 'USAGE', messageContent: '' }],
                expireTemplates: [{ messageType: 'EXPIRED', messageContent: '' }],
                userCreationTemplates: [{ messageType: 'USER_CREATION', messageContent: '' }],
                userUpdateTemplates: [{ messageType: 'USER_UPDATE', messageContent: '' }]
            });
        }
    }, [drawerData, drawerForm, record]);

    const createNotificationTemplate = async () => {
        console.log("createNotificationTemplate", drawerForm.getFieldsValue());
        try {
            await drawerForm.validateFields();

            const values = drawerForm.getFieldsValue();
            const allTemplates = [
                ...(values.usageTemplates || []).map((t: any) => ({
                    ...t,
                    messageType: t.messageType,
                    daysToExpire: null,
                    quotaPercentage: t.quotaPercentage ? Number(t.quotaPercentage) : 0,
                })),
                ...(values.expireTemplates || []).map((t: any) => ({
                    ...t,
                    messageType: t.messageType,
                    daysToExpire: t.daysToExpire ? Number(t.daysToExpire) : null,
                    quotaPercentage: 0,
                })),
                ...(values.userCreationTemplates || []).map((t: any) => ({
                    ...t,
                    messageType: 'USER_CREATION',
                    daysToExpire: null,
                    quotaPercentage: 0,
                })),
                ...(values.userUpdateTemplates || []).map((t: any) => ({
                    ...t,
                    messageType: 'USER_UPDATE',
                    daysToExpire: null,
                    quotaPercentage: 0,
                }))
            ];

            const reqBody = {
                templateName: values.templateName,
                status: values.status,
                templates: allTemplates
            };
            let response = null;
            if (drawerData.operation === OperationActionsEnum.NEW) {
                response = await createNotificationTemplateRequest({ ...reqBody, isDefault: false, createdBy: loggedInUserName ?? "Admin" });
            } else {
                response = await updateNotificationTemplateRequest(drawerData.drawerData?.superTemplateId, { ...reqBody, updatedBy: loggedInUserName ?? "Admin" });
            }

            if (response) {
                showNotification("SUCCESS", 'Notification Template created successfully');
                drawerForm.resetFields();
                onClose();
            }
        } catch (err) {
            console.log("ERROR in creating Notification Template:", err);
        }
    }

    const updateNotificationTemplate = async () => {
        try {
            await drawerForm.validateFields();
            const values = drawerForm.getFieldsValue(true);

            const templateId = drawerData.drawerData?.superTemplateId || drawerData.drawerData?.id;

            if (!templateId) {
                showNotification("ERROR", "Template id is missing");
                return;
            }

            const allTemplates = [
                ...(values.usageTemplates || []).map((t: any) => ({
                    ...t,
                    messageType: t.messageType,
                    daysToExpire: null,
                    quotaPercentage: t.quotaPercentage ? Number(t.quotaPercentage) : 0,
                })),
                ...(values.expireTemplates || []).map((t: any) => ({
                    ...t,
                    messageType: t.messageType,
                    daysToExpire: t.daysToExpire ? Number(t.daysToExpire) : null,
                    quotaPercentage: 0,
                })),
                ...(values.userCreationTemplates || []).map((t: any) => ({
                    ...t,
                    messageType: 'USER_CREATION',
                    daysToExpire: null,
                    quotaPercentage: 0,
                })),
                ...(values.userUpdateTemplates || []).map((t: any) => ({
                    ...t,
                    messageType: 'USER_UPDATE',
                    daysToExpire: null,
                    quotaPercentage: 0,
                }))
            ];

            const reqBody: NotificationTemplateUpdateModel = {
                templateName: values.templateName,
                status: values.status,
                updatedBy: loggedInUserName ?? "Admin",
                templates: allTemplates
            };

            const response = await updateNotificationTemplateRequest(templateId, reqBody);

            if (response) {
                showNotification("SUCCESS", 'Notification Template updated successfully');
                drawerForm.resetFields();
                onClose();
            }
        } catch (err) {
            console.log("ERROR in updating Notification Template:", err);
        }
    }

    return (
        <div className="drawer-body">
            <div className="drawer-form-content">
                <Form
                    form={drawerForm}
                    layout="horizontal"
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 17 }}
                    colon={false}
                    labelAlign="right"
                    className="notification-form-wrapper"
                    onFinish={createNotificationTemplate}
                >
                    <Form.Item
                        label="Template Name"
                        name="templateName"
                        rules={[
                            { required: true, message: 'Please enter Template Name' },
                            { max: 500, message: 'Template name cannot exceed 500 characters' },
                            {
                                validator: (_, value) => {
                                    if (!value) {
                                        return Promise.resolve();
                                    }
                                    // For NEW operation, check if template name already exists
                                    if (drawerData.operation === OperationActionsEnum.NEW) {
                                        const isDuplicate = existingTemplates.some(
                                            (template) => template.templateName?.toLowerCase() === value.toLowerCase()
                                        );
                                        if (isDuplicate) {
                                            return Promise.reject(new Error('A template with this name already exists'));
                                        }
                                    }
                                    // For EDIT operation, check if the new name conflicts with other templates (excluding current one)
                                    else if (drawerData.operation === OperationActionsEnum.EDIT && record) {
                                        const isDuplicate = existingTemplates.some(
                                            (template) =>
                                                template.templateName?.toLowerCase() === value.toLowerCase() &&
                                                template.superTemplateId !== record.superTemplateId
                                        );
                                        if (isDuplicate) {
                                            return Promise.reject(new Error('A template with this name already exists'));
                                        }
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input placeholder="Template Name" maxLength={500} showCount={true} disabled={drawerData.operation === OperationActionsEnum.EDIT} />
                    </Form.Item>

                    <Form.Item
                        label="Status"
                        name="status"
                    >
                        <Select placeholder="Select Status">
                            {drawerData.operation === OperationActionsEnum.NEW ? (
                                <>
                                    <Select.Option value="Active">Active</Select.Option>
                                    <Select.Option value="Draft">Draft</Select.Option>
                                </>
                            ) : (
                                <>
                                    {record?.status?.toUpperCase() === 'ACTIVE' && <Select.Option value="Inactive">Inactive</Select.Option>}
                                    {record?.status?.toUpperCase() === 'DRAFT' && <Select.Option value="Active">Active</Select.Option>}
                                    {record?.status?.toUpperCase() === 'INACTIVE' && <Select.Option value="Active">Active</Select.Option>}
                                </>
                            )}
                        </Select>
                    </Form.Item>

                    {/* Usage Notification Section */}
                    <Card
                        title="Usage Notification"
                        size="small"
                        bordered={true}
                        className="notification-card-section"
                    >
                        <Form.List name="usageTemplates">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (

                                        <div key={key} className="template-item-box mb-2">
                                            <MinusSquareOutlined
                                                className="delete-item-icon"
                                                onClick={() => remove(name)}
                                            />

                                            <div className="item-row-flex">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'messageType']}
                                                    initialValue="USAGE"
                                                    hidden
                                                >
                                                    <Input />
                                                </Form.Item>

                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'quotaPercentage']}
                                                    className="stretch-item"
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <Select
                                                        placeholder="Quota % to Expire"
                                                        showSearch
                                                        dropdownStyle={{ maxHeight: 200, overflow: "auto" }} // scroll enabled
                                                    >
                                                        {quotaPercentageOptions.map((percent) => (
                                                            <Select.Option key={percent} value={percent}>
                                                                {percent}%
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </div>

                                            <Card
                                                title="Message Content"
                                                size="small"
                                                bordered={true}
                                                headStyle={{ backgroundColor: '#fafafa', fontWeight: 600, fontSize: '13px' }}
                                                bodyStyle={{ padding: '16px' }}
                                                style={{ marginTop: '16px' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                                                    <div style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>Message Type</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Form.Item name={[name, 'dynamicParameter']} noStyle>
                                                            <Select
                                                                placeholder="Select Message Type"
                                                                className="param-select-dropdown"
                                                                options={[
                                                                    { label: 'User Name', value: 'UserName' },
                                                                    { label: 'Percentage', value: 'Percentage' },
                                                                    { label: 'Service Name', value: 'ServiceName' },

                                                                ]}
                                                            />
                                                        </Form.Item>
                                                        <Button
                                                            type="primary"
                                                            style={{ backgroundColor: '#0050b3', fontSize: '12px' }}
                                                            size="small"
                                                            onClick={() => {
                                                                const currentTemplates = drawerForm.getFieldValue('usageTemplates');
                                                                const currentMsg = currentTemplates[name]?.messageContent || '';
                                                                const param = currentTemplates[name]?.dynamicParameter;
                                                                if (param) {
                                                                    currentTemplates[name].messageContent = currentMsg + param;
                                                                    // Reset the dropdown after insertion if desired, though not strictly required by prompt
                                                                    // currentTemplates[name].dynamicParameter = undefined; 
                                                                    drawerForm.setFieldsValue({ usageTemplates: currentTemplates });
                                                                }
                                                            }}
                                                        >
                                                            Insert Inline
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'messageContent']}
                                                    style={{ marginBottom: 0 }}
                                                    rules={[{ required: true, message: 'Content required' }]}
                                                >
                                                    <Input.TextArea placeholder="Enter Message Content" rows={4} />
                                                </Form.Item>
                                            </Card>
                                        </div>
                                    ))}
                                    <Button
                                        type="link"
                                        onClick={() => add()}
                                        block
                                    >
                                        + Add Template
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>


                    {/* Expire Notification Section */}
                    <Card title="Expire Notification" size="small" bordered={true} className="notification-card-section">

                        <Form.List name="expireTemplates">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <div key={key} className="template-item-box mb-2">
                                            <MinusSquareOutlined
                                                className="delete-item-icon"
                                                onClick={() => remove(name)}
                                            />

                                            <div className="item-row-flex">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'messageType']}
                                                    initialValue="EXPIRED"
                                                    hidden
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'daysToExpire']}
                                                    className="stretch-item"
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <Input type="number" placeholder="Days to Expire" />
                                                </Form.Item>

                                            </div>

                                            <Card
                                                title="Message Content"
                                                size="small"
                                                bordered={true}
                                                className="message-content-section"
                                            >
                                                <div className="dynamic-params-bar">
                                                    <div className="dynamic-params-label">Message Type</div>
                                                    <div className="dynamic-params-actions">
                                                        <Form.Item name={[name, 'dynamicParameter']} noStyle>
                                                            <Select
                                                                placeholder="Select Message Type"
                                                                style={{ width: '150px' }}
                                                                options={[
                                                                    { label: 'User Name', value: 'UserName' },
                                                                    { label: 'Expiry Date', value: 'ExpiryDate' },
                                                                    { label: 'Service Name', value: 'ServiceName' },
                                                                ]}
                                                            />
                                                        </Form.Item>
                                                        <Button
                                                            type="primary"
                                                            style={{ backgroundColor: '#0050b3', fontSize: '12px' }}
                                                            size="small"
                                                            onClick={() => {
                                                                const currentTemplates = drawerForm.getFieldValue('expireTemplates');
                                                                const currentMsg = currentTemplates[name]?.messageContent || '';
                                                                const param = currentTemplates[name]?.dynamicParameter;
                                                                if (param) {
                                                                    currentTemplates[name].messageContent = currentMsg + param;
                                                                    drawerForm.setFieldsValue({ expireTemplates: currentTemplates });
                                                                }
                                                            }}
                                                        >
                                                            Insert Inline
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'messageContent']}
                                                    className="no-margin-bottom"
                                                    rules={[{ required: true, message: 'Content required' }]}
                                                >
                                                    <Input.TextArea placeholder="Enter Message Content" rows={4} />
                                                </Form.Item>
                                            </Card>
                                        </div>
                                    ))}
                                    <Button
                                        type="link"
                                        onClick={() => add()}
                                        block
                                    >
                                        + Add Template
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>
                    {/* User Creation Section */}
                    <Card
                        title="User Creation"
                        size="small"
                        bordered={true}
                        className="notification-card-section"
                    >
                        <Form.List name="userCreationTemplates">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (

                                        <div key={key} className="template-item-box mb-2">
                                            <MinusSquareOutlined
                                                className="delete-item-icon"
                                                onClick={() => remove(name)}
                                            />

                                            <div className="item-row-flex">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'messageType']}
                                                    initialValue="USER_CREATION"
                                                    hidden
                                                >
                                                    <Input />
                                                </Form.Item>


                                            </div>

                                            <Card
                                                title="Message Content"
                                                size="small"
                                                bordered={true}
                                                headStyle={{ backgroundColor: '#fafafa', fontWeight: 600, fontSize: '13px' }}
                                                bodyStyle={{ padding: '16px' }}
                                                style={{ marginTop: '16px' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                                                    <div style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>Message Type</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Form.Item name={[name, 'dynamicParameter']} noStyle>
                                                            <Select
                                                                placeholder="Select Message Type"
                                                                className="param-select-dropdown"
                                                                options={[
                                                                    { label: 'USER_CREATION', value: 'User {userName} created successfully' },
                                                                ]}
                                                            />
                                                        </Form.Item>
                                                        <Button
                                                            type="primary"
                                                            style={{ backgroundColor: '#0050b3', fontSize: '12px' }}
                                                            size="small"
                                                            onClick={() => {
                                                                const currentTemplates = drawerForm.getFieldValue('userCreationTemplates');
                                                                const currentMsg = currentTemplates[name]?.messageContent || '';
                                                                const param = currentTemplates[name]?.dynamicParameter;
                                                                if (param) {
                                                                    currentTemplates[name].messageContent = currentMsg + param;
                                                                    drawerForm.setFieldsValue({ userCreationTemplates: currentTemplates });
                                                                }
                                                            }}
                                                        >
                                                            Insert Inline
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'messageContent']}
                                                    style={{ marginBottom: 0 }}
                                                    rules={[{ required: true, message: 'Content required' }]}
                                                >
                                                    <Input.TextArea placeholder="Enter Message Content" rows={4} />
                                                </Form.Item>
                                            </Card>
                                        </div>
                                    ))}
                                    {fields.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            <PlusCircleOutlined
                                                style={{ fontSize: '24px', color: '#1890ff', cursor: 'pointer' }}
                                                onClick={() => add({ messageType: 'USER_CREATION', messageContent: '' })}
                                            />
                                            <div style={{ marginTop: '8px', color: '#8c8c8c' }}>Add User Creation Template</div>
                                        </div>
                                    )}
                                </>
                            )}
                        </Form.List>
                    </Card>

                    {/* User Update Section */}
                    <Card
                        title="User Update"
                        size="small"
                        bordered={true}
                        className="notification-card-section"
                    >
                        <Form.List name="userUpdateTemplates">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (

                                        <div key={key} className="template-item-box mb-2">
                                            <MinusSquareOutlined
                                                className="delete-item-icon"
                                                onClick={() => remove(name)}
                                            />

                                            <div className="item-row-flex">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'messageType']}
                                                    initialValue="USER_UPDATE"
                                                    hidden
                                                >
                                                    <Input />
                                                </Form.Item>


                                            </div>

                                            <Card
                                                title="Message Content"
                                                size="small"
                                                bordered={true}
                                                headStyle={{ backgroundColor: '#fafafa', fontWeight: 600, fontSize: '13px' }}
                                                bodyStyle={{ padding: '16px' }}
                                                style={{ marginTop: '16px' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                                                    <div style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>Message Type</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Form.Item name={[name, 'dynamicParameter']} noStyle>
                                                            <Select
                                                                placeholder="Select Message Type"
                                                                className="param-select-dropdown"
                                                                options={[
                                                                    { label: 'USER_UPDATE', value: 'User {userName} updated successfully' },
                                                                ]}
                                                            />
                                                        </Form.Item>
                                                        <Button
                                                            type="primary"
                                                            style={{ backgroundColor: '#0050b3', fontSize: '12px' }}
                                                            size="small"
                                                            onClick={() => {
                                                                const currentTemplates = drawerForm.getFieldValue('userUpdateTemplates');
                                                                const currentMsg = currentTemplates[name]?.messageContent || '';
                                                                const param = currentTemplates[name]?.dynamicParameter;
                                                                if (param) {
                                                                    currentTemplates[name].messageContent = currentMsg + param;
                                                                    drawerForm.setFieldsValue({ userUpdateTemplates: currentTemplates });
                                                                }
                                                            }}
                                                        >
                                                            Insert Inline
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'messageContent']}
                                                    style={{ marginBottom: 0 }}
                                                    rules={[{ required: true, message: 'Content required' }]}
                                                >
                                                    <Input.TextArea placeholder="Enter Message Content" rows={4} />
                                                </Form.Item>
                                            </Card>
                                        </div>
                                    ))}
                                    {fields.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            <PlusCircleOutlined
                                                style={{ fontSize: '24px', color: '#1890ff', cursor: 'pointer' }}
                                                onClick={() => add({ messageType: 'USER_UPDATE', messageContent: '' })}
                                            />
                                            <div style={{ marginTop: '8px', color: '#8c8c8c' }}>Add User Update Template</div>
                                        </div>
                                    )}
                                </>
                            )}
                        </Form.List>
                    </Card>
                    <div className="drawer-btn-section">
                        {
                            drawerData.operation === OperationActionsEnum.NEW &&
                            <Button type="primary" className="submit-btn-primary" onClick={() => createNotificationTemplate()}>
                                Add
                            </Button>
                        }
                        {
                            drawerData.operation === OperationActionsEnum.EDIT &&
                            <Button type="primary" className="submit-btn-primary" onClick={() => updateNotificationTemplate()}>
                                Update
                            </Button>
                        }
                    </div>

                </Form>
            </div>

        </div>
    );
}

export default CreateNotification;