import { FC, useEffect, useState } from "react";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
import { InputsProps } from "../../../../components/common-search-panel/models/InputsProps.model.ts";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
import { Button } from "antd";
import { formatValue } from "../../../../helpers/stringValidators.ts";
import dayjs from "dayjs";
import CommonTabBar from "../../../../components/common-tab-bar/CommonTabBar.tsx";
import { getAuditLogs, reportDownloadRequestCreate } from "../../service/logs.management.service.ts";
import { AuditLogsQueryModel, FilterValues } from "../../models/audit-logs.model.ts";
import DropdownValue from "../../../../model/dropdownValue.ts";
import { useAppSelector } from "../../../../stores/mainStore.ts";
import showNotification from "../../../../services/notification.service.tsx";
import { ReportDownloadRequestModel } from "../../models/message-logs.model.ts";

type UsersProps = object;

const AuditLogs: FC<UsersProps> = () => {

    const activityTypes: DropdownValue[] = [
        { label: 'Filter', value: 'Filter' },
        { label: 'View', value: 'View' },
        { label: 'Add', value: 'Add' },
        { label: 'Update', value: 'Update' },
        { label: 'Delete', value: 'Delete' },
        { label: 'Export', value: 'Export' },
    ];

    const searchPanelInputs: InputsProps[] = [
        {
            type: "INPUT",
            valueName: "user",
            label: "Admin User",
            required: false,
            mainInput: true,
            maxLength: 50,
            placeholder: "Enter Admin User"
        },
        {
            type: "DROPDOWN",
            valueName: "activityType",
            label: "Activity Type",
            required: false,
            mainInput: true,
            placeholder: "Select Activity Type",
            values: activityTypes,
            showSearch: false
        },
        {
            type: "DATEPICKER",
            valueName: "startDate",
            label: "Start Date",
            required: false,
            mainInput: false,
            placeholder: "Select Start Date"
        },
        {
            type: "DATEPICKER",
            valueName: "endDate",
            label: "End Date",
            required: false,
            mainInput: false,
            placeholder: "Select End Date"
        }
    ];

    const columns = [
        { title: 'Admin/System User', dataIndex: 'user', key: 'user', render: formatValue },
        { title: 'Activity Name', dataIndex: 'activity', key: 'activity', render: formatValue },
        { title: 'Activity Type', dataIndex: 'activityType', key: 'activityType', render: formatValue },
        { title: 'Date and Time', dataIndex: 'createdDateTime', key: 'createdDateTime', render: formatValue },
        { title: 'Status', dataIndex: 'status', key: 'status', render: formatValue },
        { title: 'Details', dataIndex: 'description', key: 'description', render: formatValue }
    ];

    const [tableData, setTableData] = useState<any>(null);
    const [paginationDetails, setPaginationDetails] = useState<{ currentPage: number; currentItemPerPage: number; }>({ currentPage: 1, currentItemPerPage: 10 });
    const [searchForm, setSearchForm] = useState<Record<string, string>>({});
    const loggedInUserName = useAppSelector(state => state.auth.decodedToken?.preferred_username);


    useEffect(() => {
        fetchTableData(paginationDetails.currentPage, paginationDetails.currentItemPerPage, searchForm);
    }, [paginationDetails, searchForm]);

    const buildFilterValues = (values: Record<string, string>): FilterValues[] => {
        const filters: FilterValues[] = [];

        if (values.user) {
            filters.push({
                columnName: "user",
                operation: "equal",
                value: [values.user]
            });
        }

        if (values.activityType) {
            filters.push({
                columnName: "activityType",
                operation: "equal",
                value: [values.activityType]
            });
        }

        const start = values.startDate ? dayjs(values.startDate).format("YYYY-MM-DD") : undefined;
        const end = values.endDate ? dayjs(values.endDate).format("YYYY-MM-DD") : undefined;
        if (start || end) {
            filters.push({
                columnName: "createdDateTime",
                operation: "between",
                value: [start ?? end!, end ?? start!]
            });
        }

        return filters;
    };

    const fetchTableData = async (page: number, pageSize: number, values?: Record<string, string>) => {
        const offset = (page - 1) * pageSize;
        const query: AuditLogsQueryModel = {
            filterValues: buildFilterValues(values || {}),
            offset,
            limit: pageSize
        };

        try {
            const res = await getAuditLogs(query as any);
            setTableData(res);
        } catch (err) {
            setTableData(null);
            console.log('Error fetching audit logs:', err);
        }
    };

    const onSubmitSearchPanel = (values: Record<string, string>) => {
        setSearchForm(values);
        setPaginationDetails({ currentPage: 1, currentItemPerPage: paginationDetails.currentItemPerPage });
    };

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
    };


    const tableRows = tableData?.responseData || [];

    const totalRecords = Number(
        (tableData)?.result?.pageDetail?.totalRecords ??
        (tableData)?.totalRecords ??
        tableData?.total ??
        tableRows?.length ??
        0
    );

    const handleExport = async () => {
        try {
            if (!searchForm || Object.keys(searchForm).length === 0) {
                showNotification("ERROR", "Please apply search filters before exporting");
                return;
            }

            // const filteredData = Object.entries(searchForm)
            //     .filter(([, value]) => value !== undefined && value !== null && value !== "")
            //     .map(([columnName, value]) => ({
            //         columnName,
            //         value: value as string | number
            //     }));
            //
            // if (filteredData.length === 0) {
            //     showNotification("ERROR", "Please apply search filters before exporting");
            //     return;
            // }
            //
            // const requestData: ReportDownloadRequestModel = {
            //     createdBy: loggedInUserName ?? "",
            //     reportType: "AUDIT_LOGS",
            //     filterValues: filteredData
            // };
            const filters = buildFilterValues(searchForm);
            if (filters.length === 0) {
                showNotification("ERROR", "Please apply search filters before exporting");
                return;
            }

            const requestData: ReportDownloadRequestModel = {
                createdBy: loggedInUserName ?? "",
                reportType: "AUDIT_LOGS",
                filterValues: filters as any
            };

            await reportDownloadRequestCreate(requestData);

        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                "Failed to export logs.";

            showNotification("ERROR", errorMessage);
        }
    };



    return (
        <ActionPermission action={ACTION_PERMISSION.SEARCH_AUDIT_LOGS}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Audit Log</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    initialTabs={[{ key: "search", label: "Audit Log" }]}
                    initialActiveKey="search"
                />

                <div className="common-page-margin" style={{ marginTop: "0px" }}>
                    <CommonSearchPanel
                        inputs={searchPanelInputs}
                        title="Search Conditions"
                        isExpandBtnVisible={true}
                        onSubmit={onSubmitSearchPanel}
                        onClear={() => {
                            setSearchForm({});
                            setPaginationDetails({ currentPage: 1, currentItemPerPage: paginationDetails.currentItemPerPage });
                        }}
                        initialValues={searchForm}
                    />
                    <div className="common-button-bar">
                        <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <ActionPermission action={ACTION_PERMISSION.EXPORT_AUDIT_LOGS}>
                            <Button
                                type="default"
                                size="small"
                                onClick={() => { handleExport() }}
                            >
                                Export
                            </Button>
                            </ActionPermission>
                        </div>
                    </div>

                    <div>
                        <DynamicTable
                            columns={columns}
                            data={tableRows}
                            pagination={{
                                current: paginationDetails.currentPage,
                                pageSize: paginationDetails.currentItemPerPage,
                                total: totalRecords,
                                onChange: onTableChange
                            }}
                        />
                    </div>
                </div>
            </>
        </ActionPermission>
    );
};


export default AuditLogs;