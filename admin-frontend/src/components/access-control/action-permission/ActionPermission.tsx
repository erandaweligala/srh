import {FC, ReactElement} from "react";
import {hasPermissionToTheAction} from "../../../services/permission.service";

interface AccessControlProps {
    action: {actionId: number, isMainAction: boolean, mainActionId: number | null, componentId: number}
    children: ReactElement
}

const ActionPermission: FC<AccessControlProps> = ({children, action}) => {

    if(hasPermissionToTheAction(action)) {
        return children
    } else {
        return <></>
    }

}


export default ActionPermission;