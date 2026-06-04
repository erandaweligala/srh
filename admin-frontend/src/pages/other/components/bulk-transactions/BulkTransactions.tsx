// import {FC, useState} from "react";
// import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";
// import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
// import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
// import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
// import {InputsProps} from "../../../../components/common-search-panel/models/InputsProps.model.ts";
// import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
// import {Button} from "antd";
// import {formatValue} from "../../../../helpers/stringValidators.ts";
// import dayjs from "dayjs";
// import CommonSquareButtonPreDefined
//     from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
// import {ButtonTypeEnum} from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
// import {renderStatusTag} from "../../../../helpers/helperFunctions.tsx";
// import CommonTabBar from "../../../../components/common-tab-bar/CommonTabBar.tsx";

// type UsersProps = object;

// const BulkTransactions: FC<UsersProps> = () => {

//     const statusList = ["Completed", "Inprogress", "Pending"];

//     const searchPanelInputs: InputsProps[] = [
//         {
//             type: "DATEPICKER",
//             valueName: "startDate",
//             label: "Start Date",
//             required: false,
//             mainInput: true,
//             placeholder: "Select Start Date"
//         },
//         {
//             type: "DATEPICKER",
//             valueName: "endDate",
//             label: "End Date",
//             required: false,
//             mainInput: true,
//             placeholder: "Select End Date"
//         }
//     ];

// // Columns array
//     const columns = [
//         { title: 'Transaction Type', dataIndex: 'transactionType', key: 'transactionType', render: formatValue },
//         { title: 'Start Date and Time', dataIndex: 'startDateTime', key: 'startDateTime', render: formatValue },
//         { title: 'End Date and Time', dataIndex: 'endDateTime', key: 'endDateTime', render: formatValue },
//         { title: 'Status', dataIndex: 'status', key: 'status', render: renderStatusTag },
//         {
//             title: "Action",
//             key: "action",
//             align: "center",
//             width: 100,
//             render: () => (
//                 <div>
//                     <CommonSquareButtonPreDefined
//                         type={ButtonTypeEnum.DOWNLOAD}
//                         onClick={() => {}}
//                     />
//                 </div>
//             )
//         }
//     ];


// // Data array (15 items)
//     type TransactionRow = {
//         key: number;
//         transactionType: string;
//         startDateTime: string;
//         endDateTime: string;
//         status: string;
//         startDate: string;
//         endDate: string;
//         [key: string]: string | number; // for dynamic access
//     };

//     const types = ["Import", "Export", "Update"];

//     const data: TransactionRow[] = Array.from({ length: 15 }, (_, i) => {
//         const transactionType = types[i % types.length];

//         return {
//             key: i + 1,
//             transactionType,
//             startDateTime: `2025-06-${(i + 1).toString().padStart(2, "0")} 09:00`,
//             endDateTime: `2025-10-${(i + 1).toString().padStart(2, "0")} 10:00`,
//             status: statusList[i % 3],
//             startDate: `2025-06-${(i + 1).toString().padStart(2, "0")}`,
//             endDate: `2025-10-${(i + 2).toString().padStart(2, "0")}`
//         };
//     });

//     const [tableData, setTableData] = useState(data);

//     const onSubmitSearchPanel = (values: Record<string, string>) => {
//         let filtered = data;
//         searchPanelInputs.forEach(field => {
//             const value = values[field.valueName];
//             if (values[field.valueName]) {
//                 if (field.type === 'INPUT') {
//                     filtered = filtered.filter(row =>
//                         String(row[field.valueName]).toLowerCase().includes(values[field.valueName].toLowerCase())
//                     );
//                 } else if (field.type === 'DROPDOWN') {
//                     filtered = filtered.filter(row => row[field.valueName] === values[field.valueName]);
//                 } else if (field.type === "DATEPICKER") {
//                     // Format both row and value to YYYY-MM-DD for comparison
//                     const selectedDate = dayjs(value).format("YYYY-MM-DD");
//                     filtered = filtered.filter(row => {
//                         const rowDate = dayjs(row[field.valueName]).format("YYYY-MM-DD");
//                         return rowDate === selectedDate;
//                     });
//                 }
//             }
//         });
//         setTableData(filtered);
//     };

//     return (
//         <ActionPermission action={ACTION_PERMISSION.DISPLAY_HOME_PAGE}>
//             <>
//                 <CommonBreadcrumb>
//                     <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
//                     <CommonBreadcrumb.Section>Bulk Transaction</CommonBreadcrumb.Section>
//                 </CommonBreadcrumb>

//                 <CommonTabBar
//                     initialTabs={[{ key: "search", label: "Bulk Transaction" }]}
//                     initialActiveKey="search"
//                 />

//                 <div className="common-page-margin" style={{ marginTop: "0px" }}>
//                     <CommonSearchPanel
//                         inputs={searchPanelInputs}
//                         title="Search Conditions"
//                         isExpandBtnVisible={true}
//                         onSubmit={onSubmitSearchPanel}
//                         onClear={() => setTableData(data)}
//                     />
//                     <div className="common-button-bar">
//                         <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
//                             <Button
//                                 type="primary"
//                                 size="small"
//                                 // onClick={openCreateUserDrawer}
//                             >
//                                 Bulk Transaction
//                             </Button>
//                         </div>
//                     </div>

//                     <div>
//                         <DynamicTable
//                             columns={columns}
//                             data={tableData}
//                             pagination={{
//                                 current: 1,
//                                 pageSize: 10,
//                                 total: tableData.length
//                             }}
//                             scroll={{ x: 1450 }}
//                         />
//                     </div>
//                 </div>


//             </>
//         </ActionPermission>
//     )
// }

// export default BulkTransactions;