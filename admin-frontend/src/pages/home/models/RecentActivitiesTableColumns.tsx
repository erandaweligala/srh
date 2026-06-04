import {ColumnsType} from "antd/es/table"
import {RecentActivitiesModel} from "./recentActivities.model.ts";
import {formatValue} from "../../../helpers/stringValidators.ts";
import {renderStatusTag, renderTableDateAndTime} from "../../../helpers/helperFunctions.tsx";

export const RecentActivitiesTableColumns = (): ColumnsType<RecentActivitiesModel> => {
    return [
        {
            title: "Date & Time",
            dataIndex: "createdDate",
            key: "createdDate",
            width: '15%',
            render: renderTableDateAndTime
        },
        {
            title: "Activity",
            dataIndex: "activity",
            key: "activity",
            width: '30%',
            render: formatValue
        },
        {
            title: "Admin User",
            dataIndex: "userName",
            key: "userName",
            width: '15%',
            render: formatValue
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: '10%',
            render: (value: string) => renderStatusTag(value)

        },
        {
            title: "Details",
            dataIndex: "details",
            key: "details",
            width: '30%',
            render: formatValue
        }
    ]
}