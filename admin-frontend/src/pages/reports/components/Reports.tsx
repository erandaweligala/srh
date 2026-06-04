import {FC, useEffect, useState} from "react";
import ACTION_PERMISSION from "../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../components/access-control/action-permission/ActionPermission.tsx";
import DynamicTable from "../../../components/dynamic-table/DynamicTable.tsx";
import {formatValue} from "../../../helpers/stringValidators.ts";
import CommonSquareButtonPreDefined
    from "../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import {ButtonTypeEnum} from "../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import {renderStatusTag} from "../../../helpers/helperFunctions.tsx";
import CommonTabBar from "../../../components/common-tab-bar/CommonTabBar.tsx";
import {
    AllReportsTableDataModel,
    downloadReportData,
    getAllReports
} from "../../other/service/logs.management.service.ts";
import * as XLSX from 'xlsx';
import {ReportModel} from "../model/report.model.ts";
import dayjs from "dayjs";
import {InputsProps} from "../../../components/common-search-panel/models/InputsProps.model.ts";
import CommonSearchPanel from "../../../components/common-search-panel/CommonSearchPanel.tsx";

type UsersProps = object;

const initialSearchFormValues = {
    reportType: '',
    reportStatus: '',
    startDate: '',
    endDate: ''
};

const Reports: FC<UsersProps> = () => {
    const [tableData, setTableData] = useState<AllReportsTableDataModel>();

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
    }>({currentPage: 1, currentItemPerPage: 10});

    const [searchForm, setSearchForm] = useState<{
        reportType: string;
        reportStatus: string;
        startDate: string;
        endDate: string;
    }>(initialSearchFormValues)

    const columns = [
        { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy', render: formatValue },
        { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', render: (v: any) => dayjs(v).format("YYYY-MM-DD HH:mm:ss") },
        { title: 'Report Type', dataIndex: 'reportType', key: 'reportType', render: formatValue },
        { title: 'Report Status', dataIndex: 'reportStatus', key: 'reportStatus', width: 380, align: 'center', render: renderStatusTag },
        { title: 'Last Updated At', dataIndex: 'lastUpdatedAt', key: 'lastUpdatedAt', render: (v: any) => dayjs(v).format("YYYY-MM-DD HH:mm:ss") },
        {
            title: "Action",
            key: "action",
            align: "center",
            width: 100,
            render: (item:ReportModel) => (
                <div>
                    {(item?.reportStatus?.toLowerCase() === 'complete' || item?.reportStatus?.toLowerCase() === 'completed') && (
                        <ActionPermission action={ACTION_PERMISSION.DOWNLOAD_REPORT}>
                            <CommonSquareButtonPreDefined
                            type={ButtonTypeEnum.DOWNLOAD}
                            onClick={() => {RequestedReportDownload(item)}}
                        />
                        </ActionPermission>
                    )}
                </div>
            )
        }
    ];

    const searchPanelInputs: InputsProps[] = [
        {
            type: "DROPDOWN",
            valueName: "reportType",
            label: "Report Type",
            required: false,
            mainInput: true,
            placeholder: "Select Report Type",
            values: [
                { label: 'Audit Logs', value: 'AUDIT_LOGS' },
                { label: 'Message Logs', value: 'MESSAGE_LOGS' },
                { label: 'Product Details', value: 'PRODUCT_DETAILS' },
                { label: 'Session History', value: 'SESSION_HISTORY' },
                { label: 'Subscriber Details', value: 'SUBSCRIBER_DETAILS' },
            ],
            showSearch: false
        },
        {
            type: "DROPDOWN",
            valueName: "reportStatus",
            label: "Report Status",
            required: false,
            mainInput: true,
            placeholder: "Select Report Status",
            values: [
                { label: 'Processing', value: 'Processing' },
                { label: 'Completed', value: 'Completed' },
            ],
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

    const onSubmitSearchPanel = (values: Record<string, string>) => {
        console.log('values',values)
        const  newSearchForm = {
            reportType: values.reportType,
            reportStatus: values.reportStatus,
            startDate: values.startDate,
            endDate: values.endDate
        }
        setSearchForm(newSearchForm);
        setPaginationDetails({ currentPage: 1, currentItemPerPage: 10 });
    };

    useEffect(() => {
        getReportsTableData(
            paginationDetails.currentPage,
            paginationDetails.currentItemPerPage,
            searchForm
        );
    }, [paginationDetails, searchForm]);

    const getReportsTableData = async (page: number, pageSize: number,
                                       searchValues?: {
                                           reportType: string;
                                           reportStatus: string;
                                           startDate: string;
                                           endDate: string;
                                       }) => {
        const payload = {
            page: page,
            pageSize: pageSize,
            createdBy: "Admin",
            reportType: searchValues?.reportType,
            reportStatus: searchValues?.reportStatus,
            startDate: searchValues?.startDate,
            endDate: searchValues?.endDate
        }
        const response = await getAllReports(payload);
        setTableData(response)
    }

    const RequestedReportDownload = async (reportDetails: ReportModel) => {
        const response = await downloadReportData(reportDetails.id);
        if(response) {
            const file = response;
            const binaryString = atob(file);
            const byteArray = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                byteArray[i] = binaryString.charCodeAt(i);
            }
            const workbook = XLSX.read(byteArray, { type: 'array' });

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

            const data = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = reportDetails.reportType +'_'+ reportDetails.createdAt +'_'+'.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

    }

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
    };

    return (
        <ActionPermission action={ACTION_PERMISSION.REPORTS_LIST_COMPONENT}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Reports</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    initialTabs={[{ key: "search", label: "Reports" }]}
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
                            getReportsTableData(1, paginationDetails.currentItemPerPage, initialSearchFormValues);
                        }}
                    />

                    <DynamicTable
                        columns={columns}
                        data={tableData?.reportDetails || []}
                        pagination={{
                            current: paginationDetails.currentPage,
                            pageSize: paginationDetails.currentItemPerPage,
                            total: Number(
                                (tableData as any)?.totalRecords ??
                                tableData?.reportDetails?.length ??
                                0
                            ),
                            onChange: onTableChange
                        }}
                    />
                </div>


            </>
         </ActionPermission>
    )
}

export default Reports;