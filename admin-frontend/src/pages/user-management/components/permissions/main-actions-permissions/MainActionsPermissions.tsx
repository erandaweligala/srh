import {FC, useEffect} from "react";
import {Checkbox} from "antd";

import {CheckboxChangeEvent} from "antd/es/checkbox";

import "./MainActionsPermissions.scss";
import {Attributes, CheckedValuesObject, MainActions, SubActions} from "../../../models/permissions/permission.model.ts";

interface MainActionsPermissionsProps {
    mainActions: MainActions[];
    isEditable: boolean;
    onChange?: (checkedValues: CheckedValuesObject) => void;
}

const MainActionsPermissions: FC<MainActionsPermissionsProps> = ({
                                                                     mainActions,
                                                                     onChange,
                                                                     isEditable,
                                                                 }) => {

    useEffect(() => {
        onSubmit()
    }, [])


    const onChangeMainActions = () => {
        onSubmit();
    };

    const onChangeSubActions = () => {
        onSubmit();
    };

    const onChangeAttributes = () => {
        onSubmit();
    };

    const onChangeSubActionsAttributes = () => {
        onSubmit();
    };


    const collectCheckedIds = (actions: any[]) => {
        const actionIds: any[] = [];
        const attributeIds: any[] = [];

        actions.forEach((action) => {
            if (action.isSelected) {
                actionIds.push(action.actionId);
                collectCheckedAttributes(action.attributes, attributeIds);

                action.subActions.forEach((subAction: { isSelected: any; actionId: any; attributes: any[]; }) => {
                    if (subAction.isSelected) {
                        actionIds.push(subAction.actionId);
                        collectCheckedAttributes(subAction.attributes, attributeIds);
                    }
                });
            }
        });

        return {actionIds, attributeIds};
    };

    const collectCheckedAttributes = (attributes: any[], attributeIds: any[]) => {
        attributes.forEach((attribute) => {
            if (attribute.isSelected) {
                attributeIds.push(attribute.attributeId);
            }
        });
    };

    const onSubmit = () => {
        const {actionIds, attributeIds} = collectCheckedIds(mainActions);

        const obj = {
            checkedActions: actionIds,
            checkedAttributes: attributeIds
        };

        if (onChange) {
            onChange(obj);
        }
    };


    const subActions = (saAttribute: Attributes, mainAction: MainActions, subAction: SubActions) => (
        <div className="pa-1 ml-3">
            <Checkbox
                className="mr-2"
                key={saAttribute.attributeId}
                value={(mainAction.isSelected) && (subAction.isSelected) && saAttribute.attributeId}
                onChange={(e: CheckboxChangeEvent) =>
                    (saAttribute.isSelected = e.target.checked)
                }
                disabled={!isEditable}
            >
                {saAttribute.attributeName}
            </Checkbox>
        </div>
    )

    return (

        <div className="main-action-permissions mt-2">
            <Checkbox.Group
                onChange={onChangeMainActions}
                style={{width: "100%", display: "block"}}
                defaultValue={mainActions
                    .filter((element) => element.isSelected)
                    .map((element) => element.actionId)}
            >
                {
                    mainActions &&
                    mainActions.length > 0 &&
                    mainActions.map((mainAction) => (

                        <div className="box-container" key={mainAction.actionId}>
                            <div className="box-header">
                                <Checkbox
                                    className="mr-2"
                                    onChange={(e: CheckboxChangeEvent) =>
                                        (mainAction.isSelected = e.target.checked)
                                    }
                                    value={mainAction.actionId}
                                    key={mainAction.actionId}
                                    disabled={!isEditable}
                                />

                                <span style={{marginLeft:'10px'}}>{mainAction.actionName}</span>
                            </div>

                            { mainAction.subActions && mainAction.subActions.length > 0 &&
                                (
                                    <div>
                                        <div className="box-sub-header">
                                            Sub Actions

                                        </div>

                                        <div >
                                            <Checkbox.Group
                                                onChange={onChangeSubActions}
                                                style={{width: "100%", display: "block"}}
                                                defaultValue={mainAction.subActions
                                                    .filter((subA) => subA.isSelected)
                                                    .map((subA) => subA.actionId)}
                                                disabled={!mainAction.isSelected}
                                            >
                                                {mainAction.subActions.map((subAction) => (
                                                        <div className="ma-4" key={subAction.actionId}>
                                                            <div className="box-sub-header">
                                                                <Checkbox
                                                                    className="mr-2"
                                                                    key={subAction.actionId}
                                                                    onChange={(e: CheckboxChangeEvent) =>
                                                                        (subAction.isSelected = e.target.checked)
                                                                    }
                                                                    value={(mainAction.isSelected) && subAction.actionId}
                                                                    disabled={!isEditable}
                                                                />
                                                                <span style={{marginLeft:'10px'}}>{subAction.actionName}</span>
                                                            </div>

                                                            {
                                                                subAction.attributes &&
                                                                subAction.attributes.length > 0 && (
                                                                    <div className="ma-4 box-container">
                                                                        <div className="box-nest-sub-header">
                                                                            Attributes
                                                                        </div>

                                                                        <Checkbox.Group
                                                                            onChange={onChangeSubActionsAttributes}
                                                                            style={{width: "100%", display: "block"}}
                                                                            defaultValue={subAction.attributes
                                                                                .filter((subAAttr) => subAAttr.isSelected)
                                                                                .map((subAAttr) => subAAttr.attributeId)}
                                                                            disabled={
                                                                                !mainAction.isSelected ||
                                                                                !subAction.isSelected
                                                                            }
                                                                        >
                                                                            <div className="pa-2 box-nest-sub-header">
                                                                                {
                                                                                    subAction.attributes.map((saAttribute) => (
                                                                                        subActions(saAttribute, mainAction, subAction)
                                                                                    ))}
                                                                            </div>
                                                                        </Checkbox.Group>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    ))}
                                            </Checkbox.Group>
                                        </div>

                                    </div>
                                )}

                            {
                                mainAction.attributes && mainAction.attributes.length > 0 &&
                                (
                                    <div className="ma-4 box-container">
                                        <div className="box-sub-header">
                                            Attributes
                                        </div>

                                        <Checkbox.Group
                                            onChange={onChangeAttributes}
                                            style={{width: "100%", display: "block"}}
                                            defaultValue={mainAction.attributes
                                                .filter((attr) => attr.isSelected)
                                                .map((attr) => attr.attributeId)}
                                            disabled={!mainAction.isSelected}
                                        >
                                            <div className="pa-4 box-header">
                                                {mainAction.attributes.map((attribute) => (
                                                    <div className="box-sub-header" key={attribute.attributeId}>
                                                        <Checkbox
                                                            className="mr-2"
                                                            onChange={(e: CheckboxChangeEvent) =>
                                                                (attribute.isSelected = e.target.checked)
                                                            }
                                                            value={(mainAction.isSelected) && attribute.attributeId}
                                                            disabled={!isEditable}
                                                        >
                                                            <span style={{marginLeft:'10px'}}>{attribute.attributeName}</span>
                                                        </Checkbox>
                                                    </div>
                                                ))}
                                            </div>
                                        </Checkbox.Group>
                                    </div>
                                )}
                        </div>
                    ))}
            </Checkbox.Group>
        </div>

    );
};

export default MainActionsPermissions;
