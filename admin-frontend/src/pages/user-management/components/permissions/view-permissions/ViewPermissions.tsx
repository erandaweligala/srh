import {FC, useEffect, useState} from "react";
import {PermissionViewModel} from "../../../models/permissions/permission.model.ts";
import {getSinglePermissionData} from "../../../services/permission.management.service.ts";
import {Descriptions} from "antd";
import MainActionsPermissions from "../main-actions-permissions/MainActionsPermissions.tsx";
import showNotification from "../../../../../services/notification.service.tsx";

interface PermissionDetailsViewProps {
    permissionsId: string
    onClose: () => void;
    isEditable: boolean;
}
const ViewPermissions: FC<PermissionDetailsViewProps> = ({permissionsId,onClose,isEditable}) => {

    const [permissionData,setPermissionData] = useState<PermissionViewModel>();


    useEffect(() =>{
        singlePermissionsDetails(permissionsId);
    },[permissionsId])

    const singlePermissionsDetails = async (singlePermissionId: string) => {
        try{
            const response = await getSinglePermissionData(singlePermissionId);
            setPermissionData(response);
        } catch (err: any){
            onClose();
            showNotification("ERROR", err || "Failed to retrieve data. Please try again.");
        }
    };


    return(
        <div>
            {permissionData &&
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Permission Name">{permissionData.permissionName}</Descriptions.Item>
                    <Descriptions.Item label="Menu">{permissionData.menuName}</Descriptions.Item>
                    <Descriptions.Item label="Component">{permissionData.componentName}</Descriptions.Item>
                    <Descriptions.Item label="Description">{permissionData.description}</Descriptions.Item>
                </Descriptions>}

            {permissionData?.mainActions &&
                permissionData.mainActions.length > 0 &&
                (
                    <div className="mt-4">
                        <MainActionsPermissions
                            isEditable={isEditable}
                            mainActions={permissionData.mainActions}/>
                    </div>

                )

            }
        </div>
    )
}

export default ViewPermissions;
