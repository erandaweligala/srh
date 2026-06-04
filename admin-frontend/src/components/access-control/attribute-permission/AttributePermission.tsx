import {FC, ReactElement} from "react";
import {hasPermissionToTheAttribute} from "../../../services/permission.service";

interface AttributePermissionProps {
    attribute: {attributeId: number, parentActionId: number}
    children: ReactElement | string,
}

const AttributePermission: FC<AttributePermissionProps> = ({attribute, children}) => {

    if(hasPermissionToTheAttribute(attribute)) {
        if(typeof children === "string") {
            return <span>{children}</span>
        } else {
            return children
        }
    } else {
        return <span>******</span>
    }

}

export default AttributePermission;