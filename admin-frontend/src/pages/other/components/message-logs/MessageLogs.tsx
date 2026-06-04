import { FC, useEffect, useRef, useState } from "react";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
import { InputsProps } from "../../../../components/common-search-panel/models/InputsProps.model.ts";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
import { Button, Table } from "antd";
import { formatValue } from "../../../../helpers/stringValidators.ts";
import CommonTabBar, { CommonTabBarRef } from "../../../../components/common-tab-bar/CommonTabBar.tsx";
import "./MessageLogs.css";
import { ColumnsType } from "antd/es/table";
import { ActionInfoResponseModel } from "../../../subscriber-management/models/subscriber/action.info.model.ts";
import {
    getMessageLogs,
    reportDownloadRequestMessageLogs
} from "../../service/logs.management.service.ts";
import { FilterValues } from "../../models/message-logs.model.ts";
import { useAppSelector } from "../../../../stores/mainStore.ts";
import CommonStatusTagPredefined from "../../../../components/common-status-tag/CommonStatusTagPredefined.tsx";
import { formatDateTime } from "../../../../helpers/helperFunctions.tsx";
import dayjs from "dayjs";

type UsersProps = object;
const initialSearchFormValues = {
    group_id: '',
    user_name: '',
    result_code: '',
    request_id: '',
    start_time: '',
    end_time: ''
};

const initialFormValues = {
    userName: '',
    groupId: '',
    result_code: '',
    requestId: '',
    start_time: '',
    end_time: ''
};

const MessageLogs: FC<UsersProps> = () => {

    const [activeTab, setActiveTab] = useState("search");
    const tabBarRef = useRef<CommonTabBarRef>(null);
    const [searchForm, setSearchForm] = useState<{
        group_id: string;
        user_name: string;
        result_code: string;
        request_id: string;
        start_time: string;
        end_time: string;
    }>(initialSearchFormValues)
    const searchCriteriaRef = useRef(initialSearchFormValues);
    const searchFormValuesRef = useRef<Record<string, any>>(initialFormValues);
    const loggedInUserName = useAppSelector(state => state.auth.decodedToken?.preferred_username);
    const [tabDataMap] = useState<Record<string, MessageRow>>({});
    const [tableData, setTableData] = useState<ActionInfoResponseModel | null>(null);

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
    }>({ currentPage: 1, currentItemPerPage: 10 });

    useEffect(() => {
        getTableData(
            paginationDetails.currentPage,
            paginationDetails.currentItemPerPage,
            searchCriteriaRef.current
        );
    }, [paginationDetails]);


    const getTableData = async (page: number, pageSize: number, otherData?: {
        group_id: string;
        user_name: string;
        result_code: string;
        request_id: string;
        start_time: string;
        end_time: string;
    }) => {
        const criteria = otherData ?? searchCriteriaRef.current;
        searchCriteriaRef.current = criteria;
        setSearchForm(criteria);

        const start = criteria?.start_time ? dayjs(criteria.start_time as any).format('YYYY-MM-DDTHH:mm:ss') : undefined;
        const end = criteria?.end_time ? dayjs(criteria.end_time as any).format('YYYY-MM-DDTHH:mm:ss') : undefined;

        const queryParams = {
            page: page,
            page_size: pageSize,
            group_id: criteria?.group_id,
            user_name: criteria?.user_name,
            result_code: criteria?.result_code,
            request_id: criteria?.request_id,
            ...(start ? { start_time: start } : {}),
            ...(end ? { end_time: end } : {})
        }
        const data = await getMessageLogs(queryParams)
        setTableData(data)
    }

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
            type: "INPUT",
            valueName: "groupId",
            label: "Group ID",
            required: false,
            mainInput: true,
            placeholder: "Enter Group ID"
        },
        {
            type: "INPUT",
            valueName: "result_code",
            label: "Result Code",
            required: false,
            mainInput: false,
            placeholder: "Enter Result Code"
        },
        {
            type: "INPUT",
            valueName: "requestId",
            label: "Request ID",
            required: false,
            mainInput: false,
            placeholder: "Enter Request ID"
        },
        {
            type: "DATEPICKER",
            valueName: "start_time",
            label: "Start Date",
            required: false,
            mainInput: false,
            placeholder: "Select Start Date"
        },
        {
            type: "DATEPICKER",
            valueName: "end_time",
            label: "End Date",
            required: false,
            mainInput: false,
            placeholder: "Select End Date"
        }
    ];

    const columns = [
        { title: 'Username', dataIndex: 'userName', key: 'userName', render: formatValue },
        { title: 'Action', dataIndex: 'action', key: 'action', render: formatValue },
        { title: 'Group ID', dataIndex: 'groupId', key: 'groupId', render: formatValue },
        { title: 'Request ID', dataIndex: 'requestId', key: 'requestId', render: formatValue },
        { title: 'Date and Time', dataIndex: 'dateTime', key: 'dateTime', render: (v: any) => formatDateTime(v) },
        {
            title: 'Result Code',
            dataIndex: 'resultCode',
            key: 'resultCode',
            render: (value: string | number) => {
                const text = String(value ?? '').trim();
                if (!text) return null;
                const normalized = text.toUpperCase();
                if (normalized === 'SUCCESS') {
                    return <CommonStatusTagPredefined type="success" labelName={text} />;
                }
                return formatValue(value);
            }
        },

        {
            title: 'HTTP Status',
            dataIndex: 'httpStatus',
            key: 'httpStatus',
            render: (value: number | string) => {
                const code = typeof value === 'string' ? Number.parseInt(value, 10) : value;
                const isOk = code === 200 || code === 201;
                const color = isOk ? '#52c41a' : '#ff4d4f';

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CommonStatusTagPredefined type="custom" labelName={String(value)} backgroundColor={color} />
                    </div>
                );
            }
        },
        { title: 'Description', dataIndex: 'description', key: 'description', render: formatValue },
        { title: 'Channel', dataIndex: 'channel', key: 'channel', render: formatValue },
        { title: 'Response Time (ms)', dataIndex: 'responseTime', key: 'responseTime', render: formatValue },
        { title: 'Application', dataIndex: 'application', key: 'application', render: formatValue },
        { title: 'OPCO', dataIndex: 'opco', key: 'opco', render: formatValue },
    ];


    // Data array (15 items)
    type MessageRow = {
        key: number;
        userId: string;
        userName: string;
        messageType: string;
        sessionId: string;
        messageId: string;
        dateTime: string;
        bng: string;
        resultCode: string;
        startDate: string;
        endDate: string;
        successDetails: string;
        errorReason: string;
        errorCodes: string;
        [key: string]: string | number; // for dynamic access
    };

    const onSubmitSearchPanel = (values: Record<string, string>) => {
        console.log('values', values)
        const searchForm = {
            group_id: values.groupId,
            user_name: values.userName,
            result_code: values.result_code,
            request_id: values.requestId,
            start_time: values.start_time,
            end_time: values.end_time
        }
        searchFormValuesRef.current = values;
        searchCriteriaRef.current = searchForm;
        setPaginationDetails(prev => ({ ...prev, currentPage: 1 }));
        getTableData(1, paginationDetails.currentItemPerPage, searchForm)
    };

    const columnsViewMore: ColumnsType<any> = [
        { title: 'Field', dataIndex: 'field1', key: 'field1', width: '12%', onCell: () => ({ style: { backgroundColor: '#f5f5f5', fontWeight: '500' } }) },
        {
            title: 'Value',
            dataIndex: 'value1',
            key: 'value1',
            width: '21.3%',
            onCell: () => ({ style: { wordBreak: 'break-word', whiteSpace: 'pre-wrap' } })
        },
        { title: 'Field', dataIndex: 'field2', key: 'field2', width: '12%', onCell: () => ({ style: { backgroundColor: '#f5f5f5', fontWeight: '500' } }) },
        {
            title: 'Value',
            dataIndex: 'value2',
            key: 'value2',
            width: '21.3%',
            onCell: () => ({ style: { wordBreak: 'break-word', whiteSpace: 'pre-wrap' } })
        },
        { title: 'Field', dataIndex: 'field3', key: 'field3', width: '12%', onCell: () => ({ style: { backgroundColor: '#f5f5f5', fontWeight: '500' } }) },
        {
            title: 'Value',
            dataIndex: 'value3',
            key: 'value3',
            width: '21.3%',
            onCell: () => ({ style: { wordBreak: 'break-word', whiteSpace: 'pre-wrap' } })
        }
    ];

    const dataViewMore = [
        {
            field1: "Success Details",
            value1: tabDataMap[activeTab]?.successDetails || "N/A",
            field2: "Error Reason",
            value2: tabDataMap[activeTab]?.errorReason || "N/A",
            field3: "Error Codes",
            value3: tabDataMap[activeTab]?.errorCodes || "N/A"
        }
    ];

    const handleExport = async () => {
        const filteredData: FilterValues[] = Object.entries(searchForm)
            .filter(([value]) =>
                value !== undefined &&
                value !== null &&
                value !== ""
            ).map(([columnName, value]) => ({ columnName, value }));

        const requestData = {
            createdBy: loggedInUserName ?? "",
            reportType: "MESSAGE_LOGS",
            filterValues: filteredData
        }

        const res = await reportDownloadRequestMessageLogs(requestData);
        console.log('res', res)
    }

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
    };

    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_MESSAGE_LOGS}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Message Log</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    ref={tabBarRef}
                    initialTabs={[{ key: "search", label: "Message Log" }]}
                    initialActiveKey="search"
                    onTabClick={setActiveTab}
                />

                {activeTab === "search" && (
                    <div className="common-page-margin search-container">
                        <CommonSearchPanel
                            inputs={searchPanelInputs}
                            title="Search Conditions"
                            isExpandBtnVisible={true}
                            onSubmit={onSubmitSearchPanel}
                            initialValues={searchFormValuesRef.current}
                            onClear={() => {
                                searchFormValuesRef.current = initialFormValues;
                                searchCriteriaRef.current = initialSearchFormValues;
                                setSearchForm(initialSearchFormValues);
                                setPaginationDetails(prev => ({ ...prev, currentPage: 1 }));
                                getTableData(1, paginationDetails.currentItemPerPage, initialSearchFormValues);
                            }}
                        />
                        {tableData?.logs && (
                            <div className="message-header">
                                <div className="message-count-badge">
                                    <div className="count-indicator" />
                                    <span>
                                        Message Count : <span className="count-number">{tableData?.logs.length}</span>
                                    </span>
                                    {/*<span className="success-icon">*/}
                                    {/*  <svg*/}
                                    {/*      xmlns="http://www.w3.org/2000/svg"*/}
                                    {/*      width="14"*/}
                                    {/*      height="14"*/}
                                    {/*      viewBox="0 0 24 24"*/}
                                    {/*      fill="none"*/}
                                    {/*      stroke="#fff"*/}
                                    {/*      strokeWidth="4"*/}
                                    {/*      strokeLinecap="round"*/}
                                    {/*      strokeLinejoin="round"*/}
                                    {/*  >*/}
                                    {/*    <polyline points="20 6 9 17 4 12"/>*/}
                                    {/*  </svg>*/}
                                    {/*</span>*/}
                                </div>
                                <ActionPermission action={ACTION_PERMISSION.EXPORT_MESSAGE_LOG_REPORT}>
                                    <Button
                                        type="default"
                                        size="small"
                                        onClick={() => { handleExport() }}
                                    >
                                        Export
                                    </Button>
                                </ActionPermission>
                            </div>
                        )}

                        {tableData?.logs && (
                            <div>
                                <DynamicTable
                                    columns={columns}
                                    data={tableData?.logs || []}
                                    pagination={{
                                        current: paginationDetails.currentPage,
                                        pageSize: paginationDetails.currentItemPerPage,
                                        total: Number(
                                            (tableData as any)?.totalRecords ??
                                            tableData?.logs?.length ??
                                            0
                                        ),
                                        onChange: onTableChange
                                    }}
                                />
                            </div>)}
                    </div>
                )}

                {activeTab.startsWith("view-") && (
                    <div className="common-page-margin bordered-container">
                        <Table
                            columns={columnsViewMore}
                            dataSource={dataViewMore}
                            pagination={false}
                            showHeader={false}
                            className="custom-bordered-table"
                        />
                    </div>
                )}

            </>
        </ActionPermission>
    )
}

export default MessageLogs;