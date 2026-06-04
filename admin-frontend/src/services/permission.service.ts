import store from "../stores/mainStore.ts";


const getAllowedActions = (): number[] => {

    const allAllowedActions: number[] = []

    store.getState().auth.decodedToken?.permissions.components.forEach((singleComponent) => {
        allAllowedActions.push(...singleComponent.actions);
    });

    return allAllowedActions;
}


const getAllowedAttributes = (): number[] => {

    const allAllowedAttribute: number[] = []

    store.getState().auth.decodedToken?.permissions.components.forEach((singleComponent) => {
        allAllowedAttribute.push(...singleComponent.actions);
    });

    return allAllowedAttribute;
}

export const hasPermissionToTheAction = (actionDetails: {actionId: number, isMainAction: boolean, mainActionId: number | null, componentId: number}): boolean => {
    console.log(actionDetails)
    return getAllowedActions().some((singleActionId) => singleActionId === actionDetails.actionId);
}

export const hasPermissionToAtLeastOneAction = (actionDetailList: { actionId: number, isMainAction: boolean, mainActionId: number | null, componentId: number }[]): boolean => {
    return actionDetailList.some((singleAction) => {
        return hasPermissionToTheAction(singleAction);
    })
}

export const hasPermissionToTheAttribute = (attributeDetails: { attributeId: number, parentActionId: number }): boolean => {
    return getAllowedAttributes().some((singleAttributeId) => singleAttributeId === attributeDetails.attributeId);
}


export const hasPermissionToTheMenu = (menuDetails: { menuId: number }, roles: string[]): boolean => {
    console.log(roles)
    return !!store.getState().auth.decodedToken?.permissions.menuids.some(singleMenuId =>singleMenuId === menuDetails.menuId)
}

