import {FC} from "react";
import {RoleViewModel} from "../../../models/roles/roles.model.ts";
import {Collapse, Descriptions, Table} from "antd";
import {ColumnsType} from "antd/es/table";
import {PermissionModelRoles} from "../../../models/permissions/permission.model.ts";
import CommonSquareButtonPreDefined
    from "../../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import {
    ButtonTypeEnum
} from "../../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";


interface RoleViewProps {
    data: RoleViewModel
}

const columns: ColumnsType<PermissionModelRoles> = [
    {
        title: "Menu",
        dataIndex: "menuName",
        key: "menuName",
    },
    {
        title: "Component",
        dataIndex: "componentName",
        key: "componentName",
    },
    {
        title: "Permission Name",
        dataIndex: "permissionName",
        key: "permissionName",
        align: 'center',
        render: (item) => {
            if (item) {
                return <span style={{display: 'flex', justifyContent: 'center'}}>{item}</span>
            }else{
                return <span style={{display: 'flex', justifyContent: 'center'}}>-</span>
            }
        }
    },
    {
        title: "Description",
        dataIndex: "permissionDescription",
        key: "permissionDescription",
        render: (item) => {
            if (item) {
                return <span>{item}</span>
            }else{
                return <span style={{display: 'flex', justifyContent: 'center'}}>-</span>
            }
        }
    }
];

const RoleView:FC<RoleViewProps>=({data})=> {
    return(
        <div>
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Name">{data.roleName}</Descriptions.Item>
                <Descriptions.Item label="Description">{data.description}</Descriptions.Item>
            </Descriptions>
            <div style={{marginTop: "10px"}}>
                <Collapse
                    defaultActiveKey={'1'}
                    expandIconPosition="start"
                    collapsible="icon"
                    expandIcon={({isActive}) => isActive ?
                        <CommonSquareButtonPreDefined
                             type={ButtonTypeEnum.DOWN_ARROW}/> :
                        <CommonSquareButtonPreDefined type={ButtonTypeEnum.RIGHT_ARROW}/>}
                >
                    <Collapse.Panel header={"Permissions"} key={"1"}>
                        {data.description &&
                            data.description.length > 0 &&
                            <Table
                                className="common-basic-table"
                                columns={columns}
                                dataSource={data.permissions}
                                rowKey="componentId"
                                pagination={false}
                                scroll={{ y: 250 }}
                                tableLayout="fixed"
                            />
                        }
                    </Collapse.Panel>
                </Collapse>
            </div>
        </div>
    )
}

export default RoleView;