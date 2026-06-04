import { SubTemplateModel } from "./notification-template.model.ts";

export interface NotificationTemplateCreationModel {
    templateName: string;
    status: string;
    isDefault: boolean;
    createdBy?: string;
    templates: SubTemplateModel[];
}

export interface NotificationTemplateFormModel {
    templateName: string;
    status: string;
    isDefault: boolean;
    createdBy?: string;
    updatedBy?: string;
    usageTemplates: SubTemplateModel[];
    expireTemplates: SubTemplateModel[];
    userCreationTemplates: SubTemplateModel[];
    userUpdateTemplates: SubTemplateModel[];
}