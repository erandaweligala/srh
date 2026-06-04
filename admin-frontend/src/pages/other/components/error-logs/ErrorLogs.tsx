import {FC, useEffect, useState} from "react";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
import {InputsProps} from "../../../../components/common-search-panel/models/InputsProps.model.ts";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
import {formatValue} from "../../../../helpers/stringValidators.ts";
import CommonTabBar from "../../../../components/common-tab-bar/CommonTabBar.tsx";
import {ActionInfoResponseModel} from "../../../subscriber-management/models/subscriber/action.info.model.ts";
import {formatDateTime} from "../../../../helpers/helperFunctions.tsx";
import dayjs from "dayjs";
import {getErrorLogs} from "../../service/logs.management.service.ts";

type UsersProps = object;
const initialSearchFormValues = {
    success: false,
    group_id: '',
    user_name:  '',
    result_code:  '',
    request_id:  '',
    start_time:  '',
    end_time:  ''
};

const ErrorLogs: FC<UsersProps> = () => {
    const [tableData, setTableData] = useState<ActionInfoResponseModel|null>(null);
    const [searchForm, setSearchForm] = useState<{
        success: boolean;
        group_id: string ;
        user_name: string ;
        result_code: string ;
        request_id: string ;
        start_time: string;
        end_time: string;
    }>(initialSearchFormValues)

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
    }>({currentPage: 1, currentItemPerPage: 10});

    useEffect(() => {
        getTableData(
            paginationDetails.currentPage,
            paginationDetails.currentItemPerPage,
            searchForm
        );
    }, [paginationDetails, searchForm]);

    const  getTableData = async (page: number, pageSize: number, otherData?: {
        success: boolean;
        group_id: string;
        user_name: string;
        result_code: string;
        request_id: string;
        start_time: string;
        end_time: string;
    }) => {
        const now = dayjs();
        const start = otherData?.start_time
            ? dayjs(otherData.start_time).format('YYYY-MM-DDTHH:mm:ss')
            : now.subtract(24, 'hour').format('YYYY-MM-DDTHH:mm:ss');

        const end = otherData?.end_time
            ? dayjs(otherData.end_time).format('YYYY-MM-DDTHH:mm:ss')
            : now.format('YYYY-MM-DDTHH:mm:ss');


        const queryParams = {
            page: page,
            page_size: pageSize,
            success: false,
            group_id: otherData?.group_id,
            user_name: otherData?.user_name,
            result_code: otherData?.result_code,
            request_id: otherData?.request_id,
            start_time: start,
            end_time: end
        }
        const data = await getErrorLogs(queryParams)
        setTableData( data)
        console.log('searchForm',searchForm)
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
        }
    ];

    const columns = [
        { title: 'Username', dataIndex: 'userName', key: 'userName', render: formatValue },
        { title: 'Action', dataIndex: 'action', key: 'action', render: formatValue },
        { title: 'Group ID', dataIndex: 'groupId', key: 'groupId', render: formatValue },
        { title: 'Request ID', dataIndex: 'requestId', key: 'requestId', render: formatValue },
        { title: 'Date and Time', dataIndex: 'dateTime', key: 'dateTime', render: (v: any) => formatDateTime(v) },
        { title: 'Result Code', dataIndex: 'resultCode', key: 'resultCode', render: formatValue },
        { title: 'HTTP Status', dataIndex: 'httpStatus', key: 'httpStatus', render: formatValue },
        { title: 'Description', dataIndex: 'description', key: 'description', render: formatValue }
    ];


    const onSubmitSearchPanel = (values: Record<string, string>) => {
        console.log('values',values)
        const  newSearchForm = {
            success: false,
            group_id: values.groupId,
            user_name: values.userName,
            result_code: values.result_code,
            request_id: values.requestId,
            start_time: values.start_time,
            end_time: values.end_time
        }
        setSearchForm(newSearchForm);
        setPaginationDetails({ currentPage: 1, currentItemPerPage: 10 });
    };

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
    };

    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_ERROR_LOGS}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Error Logs</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    initialTabs={[{ key: "search", label: "Error Logs" }]}
                    initialActiveKey="search"
                />

                <div className="common-page-margin" style={{ marginTop: "0px" }}>
                    <CommonSearchPanel
                        inputs={searchPanelInputs}
                        title="Search Conditions"
                        isExpandBtnVisible={true}
                        onSubmit={onSubmitSearchPanel}
                        onClear={() => {
                            setSearchForm(initialSearchFormValues);
                            setPaginationDetails(prev => ({ ...prev, currentPage: 1 }));
                            getTableData(1, paginationDetails.currentItemPerPage, initialSearchFormValues);
                        }}
                    />

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
                    </div>
                </div>

            </>
        </ActionPermission>
    )
}

export default ErrorLogs;