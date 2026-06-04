import {ColumnsType} from "antd/es/table"
import {ButtonTypeEnum} from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts"
import CommonSquareButtonPreDefined
    from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx"
import OperationActionsEnum from "../../../../model/operationsActionsEnum.model.ts";
import {UsersModel} from "./users.model.ts";
import {formatValue} from "../../../../helpers/stringValidators.ts";
import {renderStatusTag} from "../../../../helpers/helperFunctions.tsx";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";

const renderActionButtons = (
    openViewMoreTab: (record: UsersModel) => void,
    openViewEditUserDrawer: (operation: OperationActionsEnum, record: UsersModel) => void,
    // handleDeleteClick: (user: UsersModel) => void
) => (item: UsersModel) => (
    <>
        <ActionPermission action={ACTION_PERMISSION.VIEW_USER_DETAILS_ACTION}>
            <CommonSquareButtonPreDefined onClick={() => openViewMoreTab(item)}
                                          type={ButtonTypeEnum.VIEW}/>
        </ActionPermission>
        {/* <ActionPermission action={ACTION_PERMISSION.UPDATE_USER_ACTION}>
            <CommonSquareButtonPreDefined className="ms-1" onClick={() => openViewEditUserDrawer(OperationActionsEnum.EDIT, item)}
                                          type={ButtonTypeEnum.EDIT}/>
        </ActionPermission> } // NOTE: Buttons removed from UI for current scope.Code preserved to support future feature expansion if required.*/}
        {/*<CommonSquareButtonPreDefined className="ms-1" onClick={() => handleDeleteClick(item)}*/}
        {/*                              type={ButtonTypeEnum.DELETE}/>*/}
    </>
);

//-----Mobile Number hidden due to requirements change-----
export const UsersTableColumns = (
    openViewMoreTab: (record: UsersModel) => void,
    openViewEditUserDrawer: (operation: OperationActionsEnum, record: UsersModel) => void,
    // handleDeleteClick: (user: UsersModel) => void
): ColumnsType<UsersModel> => {
    return [
        {
            title: "User ID",
            dataIndex: "userId",
            key: "userId",
            render: formatValue
        },
        {
            title: "Username",
            dataIndex: "name",
            key: "name",
            render: formatValue
        },
        {
            title: "User Role",
            dataIndex: "roleName",
            key: "roleName",
            render: formatValue
        },
        {
            title: "Email Address",
            dataIndex: "email",
            key: "email",
            render: formatValue
        },
        // {
        //     title: "Mobile Number",
        //     dataIndex: "mobileNumber",
        //     key: "mobileNumber",
        //     render: formatValue
        // },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 140,
            align: "center",
            render: (value: string) => renderStatusTag(value)

        },
        {
            title: "Action",
            key: "action",
            width: 160,
            align: "center",
            render: renderActionButtons(openViewMoreTab, openViewEditUserDrawer
                // , handleDeleteClick
            )
        }
    ]
}