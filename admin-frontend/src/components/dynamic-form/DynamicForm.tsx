import React, { useState } from 'react';
import { Form, Input, Select, Button } from 'antd';
import type { FormInstance } from 'antd';
import DynamicTable from "../dynamic-table/DynamicTable.tsx";

interface FieldConfig {
    type: "INPUT" | "DROPDOWN" | "CHECKBOX" | "DATEPICKER" | "DATERANGEPICKER" | "NUMBER";
    valueName: string;
    label: string | React.ReactNode;
    required?: boolean;
    mainInput?: boolean;
    placeholder?: string;
    values?: { label: string; value: string }[];
    maxLength?: number;
    numericOnly?: boolean;
    alphanumericOnly?: boolean;
    lettersOnly?: boolean;
    ipOnly?: boolean;
    form?: FormInstance;
}


interface DynamicFormProps {
    fieldConfigs: FieldConfig[];
    initialData?: any[]; // optional when used as form
    columns?: any[];
    mode?: 'search' | 'form';
    onSubmit?: (values: any) => void;
    form?: FormInstance;
    labelCol?: any;
    wrapperCol?: any;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ fieldConfigs, initialData = [], columns = [], mode = 'search', onSubmit, form, labelCol, wrapperCol }) => {
    const [internalForm] = Form.useForm();
    const formToUse = form || internalForm;
    const [tableData, setTableData] = useState(initialData);

    const onFinish = (values: any) => {
        if (mode === 'search') {
            let filtered = initialData;
            fieldConfigs.forEach(field => {
                if (values[field.valueName]) {
                    if (field.type === 'INPUT') {
                        filtered = filtered.filter(row =>
                            row[field.valueName]?.toLowerCase().includes(values[field.valueName].toLowerCase())
                        );
                    } else if (field.type === 'DROPDOWN') {
                        filtered = filtered.filter(row => row[field.valueName] === values[field.valueName]);
                    }
                }
            });
            setTableData(filtered);
        } else {
            // form mode -> create or update
            if (onSubmit) onSubmit(values);
        }
    };

    const renderField = (field: FieldConfig) => {
        if (field.type === 'INPUT') {
            const inputProps: any = {
                placeholder: field.placeholder,
                maxLength: field.maxLength
            };

            if (field.numericOnly) {
                inputProps.onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (!/\d/.test(e.key)) {
                        e.preventDefault();
                    }
                };
                inputProps.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const formToUpdate = field.form || formToUse;
                    if (value !== e.target.value) {
                        formToUpdate.setFieldsValue({ [field.valueName]: value });
                    }
                };
            } else if (field.lettersOnly) {
                inputProps.onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (!/^[a-zA-Z]$/.test(e.key)) {
                        e.preventDefault();
                    }
                };
                inputProps.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.replace(/[^a-zA-Z]/g, '');
                    const formToUpdate = field.form || formToUse;
                    if (value !== e.target.value) {
                        formToUpdate.setFieldsValue({ [field.valueName]: value });
                    }
                };
            } else if (field.alphanumericOnly) {
                inputProps.onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (!/^[a-zA-Z0-9]$/.test(e.key)) {
                        e.preventDefault();
                    }
                };
                inputProps.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    const formToUpdate = field.form || formToUse;
                    if (value !== e.target.value) {
                        formToUpdate.setFieldsValue({ [field.valueName]: value });
                    }
                };
            } else if (field.ipOnly) {
                inputProps.onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (!/^[0-9.]$/.test(e.key)) {
                        e.preventDefault();
                    }
                };
                inputProps.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    const formToUpdate = field.form || formToUse;
                    if (value !== e.target.value) {
                        formToUpdate.setFieldsValue({ [field.valueName]: value });
                    }
                };
            }

            return <Input {...inputProps} />;
        }
        if (field.type === 'DROPDOWN') return (
            <Select placeholder={field.placeholder} allowClear>
                {field.values?.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                    </Select.Option>
                ))}
            </Select>
        );
        // fallback
        return <Input placeholder={field.placeholder} />;
    };

    const formProps: any = {
        form: formToUse,
        onFinish,
        layout: mode === 'search' ? 'inline' : 'horizontal',
        labelAlign: mode === 'form' ? 'right' : undefined,
    };

    if (mode === 'form' && labelCol) formProps.labelCol = labelCol;
    if (mode === 'form' && wrapperCol) formProps.wrapperCol = wrapperCol;

    return (
        <div>
            <Form {...formProps}>
                {fieldConfigs.map(field => {
                    const rules: any[] = [];
                    if (field.required) {
                        rules.push({ required: true });
                    }
                    if (field.maxLength) {
                        rules.push({
                            validator: (_rule: any, value: any) => {
                                if (value !== undefined && value !== null && String(value).length > field.maxLength!) {
                                    return Promise.reject(`Maximum ${field.maxLength} characters allowed`);
                                }
                                return Promise.resolve();
                            }
                        });
                    }
                    if (field.lettersOnly) {
                        rules.push({
                            validator: (_rule: any, value: string) => {
                                if (value && !/^[a-zA-Z]+$/.test(value)) {
                                    return Promise.reject('Please enter alphabetic characters only (no numbers or special characters).');
                                }
                                return Promise.resolve();
                            }
                        });
                    }
                    if (field.alphanumericOnly) {
                        rules.push({
                            validator: (_rule: any, value: string) => {
                                if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
                                    return Promise.reject('Please enter alphanumeric values only.');
                                }
                                return Promise.resolve();
                            }
                        });
                    }
                    if (field.ipOnly) {
                        rules.push({
                            validator: (_rule: any, value: string) => {
                                if (value && !/^[0-9.]+$/.test(value)) {
                                    return Promise.reject('Please enter numeric values and dots only.');
                                }
                                return Promise.resolve();
                            }
                        });
                    }
                    return (
                        <Form.Item
                            key={field.valueName}
                            name={field.valueName}
                            label={field.label}
                            colon={false}
                            rules={rules}
                            style={{ marginBottom: mode === 'form' ? 18 : undefined }}
                        >
                            {renderField(field)}
                        </Form.Item>
                    );
                })}
                {mode === 'search' && (
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className={mode === 'search' ? 'custom-search-btn' : undefined}>
                            Search
                        </Button>
                    </Form.Item>
                )}
            </Form>
            {mode === 'search' && (
                <DynamicTable
                    columns={columns}
                    data={tableData}
                />
            )}
        </div>
    );
};

export default DynamicForm;
