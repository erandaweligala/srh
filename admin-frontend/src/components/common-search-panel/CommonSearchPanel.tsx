import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Button, Checkbox, Col, Collapse, DatePicker, DatePickerProps, Divider, Form, Input, Row, Select } from "antd";
import { InputsProps } from "./models/InputsProps.model";
import { DropdownProps } from "./models/dropdownsProps.model.ts";
import CommonSquareButtonPreDefined from "../common-square-button-pre-defined/CommonSquareButtonPreDefined";
import dayjs from 'dayjs';
import { ButtonTypeEnum } from "../common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import showNotification from "../../services/notification.service.tsx";

const { RangePicker } = DatePicker;

const { Panel } = Collapse;

interface CommonSearchPanelProps {
    children?: React.ReactNode;
    inputs?: InputsProps[];
    title: string;
    isExpandBtnVisible: boolean;
    onSubmit: (formValues: any) => void;
    extraHeader?: React.ReactNode;
    onClear?: () => void;
    initialValues?: Record<string, any>;
}

export interface CommonSearchPanelForwardRefProps {
    getCurrentFormValues: () => { [key: string]: string; }
}

const CommonSearchPanel = forwardRef<CommonSearchPanelForwardRefProps | undefined, CommonSearchPanelProps>(({
    inputs = [],
    children,
    title = "Search Conditions",
    isExpandBtnVisible = false,
    onSubmit,
    extraHeader,
    onClear,
    initialValues
}, ref) => {

    const [mainInputForm] = Form.useForm();
    const [secondaryInputForm] = Form.useForm();

    // Restore saved filter values when the panel remounts or the initial values change
    React.useEffect(() => {
        if (initialValues) {
            mainInputForm.setFieldsValue(initialValues);
            secondaryInputForm.setFieldsValue(initialValues);
        }
    }, [initialValues]);
    const [activeKey, setActiveKey] = useState<string[]>([]); // Controlled collapse state
    const isCollapsed = activeKey.length === 0; // Derived state for backward compatibility

    // Track whether any Select dropdown is currently open
    const selectOpenRef = useRef<boolean>(false);

    const handleCollapseChange = (key: string | string[]) => {
        // Only expand/collapse when arrow icon is clicked
        // Convert key to array format
        const newActiveKey = Array.isArray(key) ? key : [key];
        setActiveKey(newActiveKey);
    };



    const getRequiredMessage = (item: InputsProps) => item.required ? `${item.label} is required` : '';

    //main inputs provided by parent component are filtered out below
    const mainInputs: InputsProps[] | undefined = inputs!.filter(input => input.mainInput);

    //secondary inputs provided by parent component are filtered out below
    const secondaryInputs: InputsProps[] | undefined = inputs!.filter(input => !input.mainInput);

    useImperativeHandle(ref, () => {

        return {
            getCurrentFormValues: () => {

                let allFormInputValues = {}

                if (mainInputForm && mainInputForm.getFieldsValue()) {
                    allFormInputValues = { ...mainInputForm.getFieldsValue() }
                }

                if (secondaryInputForm && secondaryInputForm.getFieldsValue()) {
                    allFormInputValues = { ...allFormInputValues, ...secondaryInputForm.getFieldsValue() }
                }

                return allFormInputValues

            },
        };
    }, []);

    const onClickClearAllButtonHandler = () => {
        if (mainInputForm) {
            mainInputForm.resetFields();
        }
        if (secondaryInputForm) {
            secondaryInputForm.resetFields();
        }
        if (onClear) {
            onClear();
        }
    }

    const hasAnySearchCriteria = (values: any): boolean => {
        if (!values) return false;

        const isPresent = (v: any): boolean => {
            if (v == null) return false;
            if (v === '') return false;
            if (Array.isArray(v)) return v.length > 0;
            if (typeof v === 'object') {
                if (typeof v.isValid === 'function') return v.isValid();
                return Object.keys(v).length > 0;
            }
            if (typeof v === 'boolean') return true;
            return true;
        };

        return Object.values(values).some(isPresent);
    };

    const onClickSearchButtonHandler = async () => {

        let allFormInputValues = {}

        try {
            await mainInputForm.validateFields();
            await secondaryInputForm.validateFields();
        } catch (error) {
            showNotification("ERROR", "Please fill in all required search fields before continuing.");
            return;
        }

        if (mainInputForm && mainInputForm.getFieldsValue()) {
            allFormInputValues = { ...mainInputForm.getFieldsValue() }
        }

        if (secondaryInputForm && secondaryInputForm.getFieldsValue()) {
            allFormInputValues = { ...allFormInputValues, ...secondaryInputForm.getFieldsValue() }
        }

        if (!hasAnySearchCriteria(allFormInputValues)) {
            showNotification("WARNING", "Please select at least one search criteria");
            return;
        }

        onSubmit(allFormInputValues);

    }

    const disabledToDate: DatePickerProps["disabledDate"] = (current) => {

        const fromDate = mainInputForm.getFieldValue('fromDate');

        return (fromDate !== undefined) && current && current < dayjs(fromDate);

    };

    const disabledFromDate: DatePickerProps["disabledDate"] = (current) => {

        const toDate = mainInputForm.getFieldValue('toDate');

        return (toDate !== undefined) && current && current > dayjs(toDate);

    };

    const disabledSecondaryToDate: DatePickerProps["disabledDate"] = (current) => {

        const fromDate = secondaryInputForm.getFieldValue('fromDate');

        return (fromDate !== undefined) && current && current < dayjs(fromDate);

    };

    const disabledSecondaryFromDate: DatePickerProps["disabledDate"] = (current) => {

        const toDate = secondaryInputForm.getFieldValue('toDate');

        return (toDate !== undefined) && current && current > dayjs(toDate);

    };

    return (
        <>
            <div className="search-panel">

                <>
                    <Collapse
                        activeKey={activeKey}
                        expandIconPosition="start"
                        collapsible="icon"
                        onChange={handleCollapseChange}
                        className={!isExpandBtnVisible ? "hide-collapse-icon" : ""}
                        expandIcon={({ isActive }) => isActive ?
                            <CommonSquareButtonPreDefined type={ButtonTypeEnum.DOWN_ARROW} /> :
                            <CommonSquareButtonPreDefined type={ButtonTypeEnum.RIGHT_ARROW} />}
                    >
                        <Panel
                            header={title}
                            key="1"
                            extra={
                                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                    <Form
                                        name="mainInputForm"
                                        onFinish={onClickSearchButtonHandler}
                                        form={mainInputForm}
                                        layout="inline"
                                        colon={false}
                                        size={"small"}
                                        style={{ gap: "2px 0px" }}
                                    >

                                        {
                                            mainInputs &&
                                            mainInputs.length > 0 &&
                                            mainInputs.map((item) => {

                                                if (item.type === "INPUT") {

                                                    return (
                                                        <Form.Item
                                                            key={item.valueName}
                                                            name={item.valueName}
                                                            label={item.label}
                                                            rules={[{
                                                                required: item.required,
                                                                message: getRequiredMessage(item)
                                                            }, { min: item.minLength, message: '' }, { max: item.maxLength, message: '' }]}
                                                        >
                                                            <Input
                                                                placeholder={item.placeholder}
                                                                maxLength={item.maxLength}
                                                                showCount={!!item.maxLength}
                                                            />
                                                        </Form.Item>
                                                    )

                                                } else if (item.type === "DROPDOWN") {

                                                    return (
                                                        <Form.Item
                                                            key={item.valueName}
                                                            name={item.valueName}
                                                            label={item.label}
                                                            rules={[{ required: item.required, message: getRequiredMessage(item) }]}>
                                                            <Select
                                                                allowClear
                                                                showSearch={item.showSearch ?? true}
                                                                // className="w-100"
                                                                placeholder={item.placeholder}
                                                                onChange={item.onChange}
                                                                style={{ minWidth: "80%" }}
                                                                disabled={item.disabled}
                                                                onDropdownVisibleChange={(open) => { selectOpenRef.current = open; }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !selectOpenRef.current) {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        mainInputForm.submit();
                                                                    }
                                                                }}
                                                            >
                                                                {item.values &&
                                                                    item.values?.map((item: DropdownProps) => (
                                                                        <Select.Option
                                                                            value={item.value}
                                                                            key={String(item.value)}
                                                                        >
                                                                            {item.label}
                                                                        </Select.Option>
                                                                    ))}
                                                            </Select>
                                                        </Form.Item>
                                                    )

                                                } else if (item.type === 'CHECKBOX') {

                                                    return (
                                                        <Form.Item
                                                            key={item.valueName}
                                                            name={item.valueName}
                                                            label={item.label}
                                                            valuePropName="checked"
                                                            rules={[{ required: item.required, message: getRequiredMessage(item) }]}>
                                                            <Checkbox />
                                                        </Form.Item>
                                                    )

                                                } else if (item.type === 'DATEPICKER') {

                                                    if (item.dateType === "FROM_DATE") {
                                                        return (
                                                            <Form.Item
                                                                key={item.valueName}
                                                                name={item.valueName}
                                                                label={item.label}
                                                                rules={[{ required: item.required, message: getRequiredMessage(item) }]}>
                                                                <DatePicker
                                                                    placeholder={item.placeholder}
                                                                    disabledDate={disabledFromDate}
                                                                    className="w-100" />
                                                            </Form.Item>
                                                        )
                                                    } else if (item.dateType === "TO_DATE") {
                                                        return (
                                                            <Form.Item
                                                                key={item.valueName}
                                                                name={item.valueName}
                                                                label={item.label}
                                                                rules={[{ required: item.required, message: getRequiredMessage(item) }]}>
                                                                <DatePicker
                                                                    placeholder={item.placeholder}
                                                                    disabledDate={disabledToDate}
                                                                    className="w-100" />
                                                            </Form.Item>
                                                        )
                                                    } else {
                                                        // default date is below
                                                        return (
                                                            <Form.Item
                                                                key={item.valueName}
                                                                name={item.valueName}
                                                                label={item.label}
                                                                rules={[{ required: item.required, message: getRequiredMessage(item) }]}>
                                                                <DatePicker placeholder={item.placeholder}
                                                                    className="w-100" />
                                                            </Form.Item>
                                                        )

                                                    }

                                                }
                                            })
                                        }

                                        {
                                            isCollapsed &&
                                            <Form.Item style={{ marginRight: "2px" }}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    Search
                                                </Button>
                                            </Form.Item>
                                        }

                                        {extraHeader}

                                        {
                                            isCollapsed &&
                                            <CommonSquareButtonPreDefined
                                                onClick={onClickClearAllButtonHandler}
                                                type={ButtonTypeEnum.REFRESH} />
                                        }

                                    </Form>

                                </div>
                            }
                        >

                            <Form
                                name="secondaryInputForm"
                                onFinish={onClickSearchButtonHandler}
                                form={secondaryInputForm}
                                colon={false}
                                size="small"
                            >

                                {inputs &&

                                    <Row gutter={[8, 8]}>

                                        {
                                            secondaryInputs &&
                                            secondaryInputs.length > 0 &&
                                            secondaryInputs.map((item) => {

                                                if (item.type === "INPUT") {

                                                    return (
                                                        <Col span={6}>
                                                            <Form.Item
                                                                key={item.valueName}
                                                                name={item.valueName}
                                                                label={item.label}
                                                                rules={[{ required: item.required, message: getRequiredMessage(item) }, { max: item.maxLength }]}
                                                                style={{ marginBottom: '16px' }}
                                                            >
                                                                <Input
                                                                    maxLength={item.maxLength}
                                                                    showCount={!!item.maxLength}
                                                                    placeholder={item.placeholder}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    )

                                                } else if (item.type === 'DROPDOWN') {

                                                    return (
                                                        <Col span={6}>
                                                            <Form.Item
                                                                key={item.valueName}
                                                                name={item.valueName}
                                                                label={item.label}
                                                                style={{ minWidth: 150, marginBottom: '16px' }}
                                                                rules={[{ required: item.required, message: getRequiredMessage(item) }]}>
                                                                <Select
                                                                    allowClear
                                                                    showSearch={item.showSearch ?? true}
                                                                    className="w-100"
                                                                    placeholder={item.placeholder}
                                                                    onDropdownVisibleChange={(open) => { selectOpenRef.current = open; }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' && !selectOpenRef.current) {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            secondaryInputForm.submit();
                                                                        }
                                                                    }}
                                                                >
                                                                    {item.values &&
                                                                        item.values?.map((item: DropdownProps) => (
                                                                            <Select.Option
                                                                                value={item.value}
                                                                                key={String(item.value)}
                                                                            >
                                                                                {item.label}
                                                                            </Select.Option>
                                                                        ))}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    )

                                                } else if (item.type === 'CHECKBOX') {

                                                    return (
                                                        <Col span={6}>
                                                            <Form.Item
                                                                key={item.valueName}
                                                                name={item.valueName}
                                                                label={item.label}
                                                                valuePropName="checked"
                                                                rules={[{ required: item.required, message: getRequiredMessage(item) }]}
                                                                style={{ marginBottom: '16px' }}>
                                                                <Checkbox />
                                                            </Form.Item>
                                                        </Col>
                                                    )

                                                } else if (item.type === 'DATEPICKER') {

                                                    if (item.dateType === "FROM_DATE") {
                                                        return (
                                                            <Col span={6}>
                                                                <Form.Item
                                                                    key={item.valueName}
                                                                    name={item.valueName}
                                                                    label={item.label}
                                                                    rules={[{ required: item.required, message: getRequiredMessage(item) }]}
                                                                    style={{ marginBottom: '16px' }}>
                                                                    <DatePicker
                                                                        placeholder={item.placeholder}
                                                                        disabledDate={disabledSecondaryFromDate}
                                                                        className="w-100" />
                                                                </Form.Item>
                                                            </Col>
                                                        )
                                                    } else if (item.dateType === "TO_DATE") {
                                                        return (
                                                            <Col span={6}>
                                                                <Form.Item
                                                                    key={item.valueName}
                                                                    name={item.valueName}
                                                                    label={item.label}
                                                                    rules={[{ required: item.required, message: getRequiredMessage(item) }]}
                                                                    style={{ marginBottom: '16px' }}>
                                                                    <DatePicker
                                                                        placeholder={item.placeholder}
                                                                        disabledDate={disabledSecondaryToDate}
                                                                        className="w-100" />
                                                                </Form.Item>
                                                            </Col>
                                                        )
                                                    } else {
                                                        // default date is below
                                                        return (
                                                            <Col span={6}>
                                                                <Form.Item
                                                                    key={item.valueName}
                                                                    name={item.valueName}
                                                                    label={item.label}
                                                                    rules={[{ required: item.required, message: getRequiredMessage(item) }]}
                                                                    style={{ marginBottom: '16px' }}>
                                                                    <DatePicker placeholder={item.placeholder}
                                                                        className="w-100" />
                                                                </Form.Item>
                                                            </Col>
                                                        )

                                                    }

                                                } else if (item.type === 'DATERANGEPICKER') {

                                                    return (
                                                        <Col span={6}>
                                                            <Form.Item
                                                                key={item.valueName}
                                                                name={item.valueName}
                                                                label={item.label}
                                                                rules={[{ required: item.required }]}
                                                                style={{ marginBottom: '16px' }}>
                                                                <RangePicker
                                                                    className="w-100"
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    )
                                                }

                                            })
                                        }
                                    </Row>

                                }

                                <Divider />

                                <div className="search-footer">
                                    <Form.Item style={{ marginBottom: 0 }}>
                                        <Button onClick={onClickClearAllButtonHandler} style={{ fontSize: 12 }}>Clear All</Button>
                                    </Form.Item>

                                    <Form.Item style={{ marginBottom: 0 }}>
                                        <Button type="primary" htmlType="submit" style={{ fontSize: 12 }}>Search</Button>
                                    </Form.Item>
                                </div>


                                {children}

                            </Form>

                        </Panel>

                    </Collapse>
                </>
            </div>
        </>
    );
});

export default CommonSearchPanel;
