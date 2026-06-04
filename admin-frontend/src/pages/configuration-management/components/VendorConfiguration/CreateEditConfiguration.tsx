import { FC, useEffect, useState } from "react";
import { Form, Button, Input, Select } from "antd";
import OperationActionsEnum from "../../../../model/operationsActionsEnum.model";
import showNotification from "../../../../services/notification.service";
import { createConfigurationRequest, updateConfigurationRequest, getEntityMetadataRequest, getConfigurationsRequest } from "../../services/configuration.service";
import { ConfigurationFormModel, ConfigurationManagementModel, VendorConfigData } from "../../models/configuration.model";
import { DrawerState } from "../../../../helpers/helperFunctions";
import { useAppSelector, RootState } from "../../../../stores/mainStore";
import "./Configuration.css";

interface CreateEditConfigurationProps {
    drawerData: DrawerState;
    onClose: () => void;
    record?: ConfigurationManagementModel;
    existingData?: ConfigurationManagementModel[];
}

const CreateEditConfiguration: FC<CreateEditConfigurationProps> = ({ drawerData, onClose, record }) => {
    const [drawerForm] = Form.useForm<ConfigurationFormModel>();
    const loggedInUserName = useAppSelector((state: RootState) => state.auth.decodedToken?.preferred_username);
    const [parameterOptions, setParameterOptions] = useState<string[]>([]);

    useEffect(() => {
        if (drawerData.operation === OperationActionsEnum.EDIT && record) {
            drawerForm.setFieldsValue({
                id: record.id,
                vendorId: record.vendorId,
                vendorName: record.vendorName,
                attributeId: record.attributeId,
                attributeName: record.attributeName,
                valuePath: record.valuePath,
                entity: record.entity,
                parameter: record.parameter,
                dataType: record.dataType,
                isActive: record.isActive,
                attributePrefix: record.attributePrefix
            });
            if (record.entity) {
                fetchParameters(record.entity);
            }
        } else if (drawerData.operation === OperationActionsEnum.NEW) {
            drawerForm.resetFields();
            setParameterOptions([]);
        }
    }, [drawerData, drawerForm, record]);

    const fetchParameters = async (entity: string) => {
        try {
            // Entity names are now direct matches to API expected values
            const response = await getEntityMetadataRequest(entity);
            if (response && response.success && response.data) {
                setParameterOptions(response.data);
            } else {
                setParameterOptions([]);
            }
        } catch (error) {
            console.error("Failed to fetch parameters:", error);
            setParameterOptions([]);
        }
    };

    const handleEntityChange = (value: string) => {
        drawerForm.setFieldValue('parameter', null); // Reset parameter when entity changes
        fetchParameters(value);
    };

    const handleParameterChange = (value: string) => {
        const entity = drawerForm.getFieldValue('entity');
        if (entity) {
            drawerForm.setFieldValue('valuePath', `${entity}.${value}`);
        }
    };

    const handleSubmit = async () => {
        await drawerForm.validateFields();
        try {
            const values = drawerForm.getFieldsValue();

            let response;
            if (drawerData.operation === OperationActionsEnum.NEW) {
                response = await createConfigurationRequest({
                    ...values,
                    createdBy: loggedInUserName ?? "Admin",
                    isActive: !!values.isActive
                });
                if (response) {
                    showNotification("SUCCESS", 'Configuration created successfully');
                }
            } else if (drawerData.operation === OperationActionsEnum.EDIT && record?.id) {
                response = await updateConfigurationRequest({
                    ...values,
                    id: record.id,
                    vendorId: record.vendorId, // Ensure vendorId is included in the payload but non-editable in UI
                    updatedBy: loggedInUserName ?? "Admin",
                    isActive: !!values.isActive
                });
                if (response) {
                    showNotification("SUCCESS", 'Configuration updated successfully');
                }
            }

            if (response) {
                drawerForm.resetFields();
                setParameterOptions([]);
                onClose();
            }
        } catch (err) {
            console.error("Error in Configuration Management operation:", err);
            showNotification("ERROR", 'Operation failed');
        }
    }

    return (
        <div className="drawer-body">
            <div className="drawer-form-content">
                <Form
                    form={drawerForm}
                    layout="horizontal"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    colon={false}
                    labelAlign="left"
                    className="configuration-form-wrapper"
                >
                    <Form.Item
                        label="Vendor ID"
                        name="vendorId"
                        rules={[
                            { required: true, message: 'Please enter Vendor ID' },
                            {
                                pattern: /^[A-Za-z0-9]+$/,
                                message: 'Vendor ID must contain only letters and numbers',
                            },
                            () => ({
                                async validator(_, value) {
                                    if (!value || drawerData.operation !== OperationActionsEnum.NEW) {
                                        return Promise.resolve();
                                    }
                                    try {
                                        const response = await getConfigurationsRequest({
                                            vendorId: value,
                                            page: 1,
                                            size: 10 // Checking a few to be safe, though 1 should suffice if exact
                                        });
                                        if (response && response.data && response.data.VendorConfigData) {
                                            const isDuplicate = response.data.VendorConfigData.some(
                                                (item: VendorConfigData) => item.vendorId.toLowerCase() === value.toLowerCase()
                                            );
                                            if (isDuplicate) {
                                                return Promise.reject(new Error('Vendor ID already exists'));
                                            }
                                        }
                                        return Promise.resolve();
                                    } catch (error) {
                                        console.error("Validation error:", error);
                                        return Promise.resolve();
                                    }
                                },
                            }),
                        ]}
                    >
                        <Input
                            placeholder="Enter Vendor ID"
                            disabled={drawerData.operation === OperationActionsEnum.EDIT}
                            maxLength={12}
                            allowClear
                        />
                    </Form.Item>

                    <Form.Item
                        label="Vendor Name"
                        name="vendorName"
                        rules={[{ required: true, message: 'Please enter Vendor Name' }]}
                    >
                        <Input placeholder="Enter Vendor Name" maxLength={12}
                            allowClear />
                    </Form.Item>

                    <Form.Item
                        label="Attribute ID"
                        name="attributeId"
                        rules={[{ required: true, message: 'Please enter Attribute ID' },
                        {
                            pattern: /^[0-9]+$/,
                            message: 'Numbers only',
                        }]}
                    >
                        <Input placeholder="Enter Attribute ID" maxLength={12}
                            allowClear />
                    </Form.Item>

                    <Form.Item
                        label="Attribute Name"
                        name="attributeName"
                        rules={[
                            { required: true, message: 'Please enter Attribute Name' },
                            {
                                pattern: /^[A-Za-z0-9]+$/,
                                message: 'Attribute Name must contain only letters and numbers',
                            }
                        ]}
                    >
                        <Input placeholder="Enter Attribute Name" maxLength={12}
                            allowClear />
                    </Form.Item>

                    <Form.Item
                        label="Entity"
                        name="entity"
                        rules={[{ required: true, message: 'Please select Entity' }]}
                    >
                        <Select placeholder="Select Entity" onChange={handleEntityChange}>
                            <Select.Option value="AAA_USER">AAA_USER</Select.Option>
                            <Select.Option value="SERVICE_INSTANCE">SERVICE_INSTANCE</Select.Option>
                            <Select.Option value="BUCKET_INSTANCE">BUCKET_INSTANCE</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Parameter"
                        name="parameter"
                        rules={[{ required: true, message: 'Please select Parameter' }]}
                    >
                        <Select placeholder="Select Parameter" onChange={handleParameterChange}>
                            {parameterOptions.map(param => (
                                <Select.Option key={param} value={param}>{param}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Value Path"
                        name="valuePath"
                        rules={[{ required: true, message: 'Please enter Value Path' }]}
                    >
                        <Input placeholder="Enter Value Path" />
                    </Form.Item>

                    <Form.Item
                        label="Data Type"
                        name="dataType"
                        rules={[{ required: true, message: 'Please enter Data Type' }]}
                    >
                        <Select placeholder="Select Data Type" >
                            <Select.Option value="String">String</Select.Option>
                            <Select.Option value="Numeric">Numeric</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Is Active"
                        name="isActive"
                        rules={[{ required: true, message: 'Please select Is Active' }]}
                    >
                        <Select placeholder="Select Is Active">
                            <Select.Option value={true}>Yes</Select.Option>
                            <Select.Option value={false}>No</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Attribute Prefix"
                        name="attributePrefix"
                        rules={[{ required: true, message: 'Please enter Attribute Prefix' }]}
                    >
                        <Input placeholder="Enter Attribute Prefix" maxLength={24}/>
                    </Form.Item>
                </Form>
            </div>
            <div className="drawer-btn-section">
                <Button type="primary" onClick={handleSubmit} className="submit-btn-primary">
                    {drawerData.operation === OperationActionsEnum.EDIT ? "Update" : "Add"}
                </Button>
            </div>
        </div>
    );
}

export default CreateEditConfiguration;

