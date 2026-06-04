import {FC} from "react";
import DynamicTable from "../dynamic-table/DynamicTable.tsx";
import {PageDetails} from "../../model/baseResponse.ts";

type SubscriberProfileTabProps = {
    drawerData: any;
    columns: any[];
    generateData?: (drawerData: any) => any[]; // Optional function to generate data
    data?: any[]; // Optional static data
    pageDetails?: PageDetails;
    onPageChange?: (page: number, pageSize?: number) => void;
    showPagination?: boolean;
    scroll?: any;
    pageSize?: number;
};


const CommonViewMoreTab: FC<SubscriberProfileTabProps> = ({ drawerData, columns, generateData, data, pageDetails, onPageChange, showPagination, scroll, pageSize }) => {
    // Use generateData function if provided, otherwise use static data
    const tableData = generateData ? generateData(drawerData) : (data || []);

    const pagination = pageDetails
        ? {
            current: Number(pageDetails.pageNumber) || 1,
            // pageSize: Number(pageDetails.pageElementCount) || 10,
            pageSize: pageSize ?? 10,
            total: Number(pageDetails.totalRecords) || tableData.length,
            onChange: onPageChange
        }
        : {
            current: 1,
            pageSize: 10,
            total: tableData.length
        };

    const paginationProp: any = showPagination ? pagination : false;
    const tableScroll = scroll ?? { x: 0 };
    return (
        <div className="common-page-margin" style={{ marginTop: "0px" }}>
            <div>
                <DynamicTable
                    columns={columns}
                    data={tableData}
                    pagination={paginationProp}
                    // scroll={{ x: 0 }}
                    scroll={tableScroll}
                />
            </div>
        </div>
    );
};

export default CommonViewMoreTab;
