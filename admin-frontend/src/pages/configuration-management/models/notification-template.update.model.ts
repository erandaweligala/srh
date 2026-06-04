import { SubTemplateModel } from "./notification-template.model.ts";

export interface NotificationTemplateUpdateModel {
    templateName: string;
    status: string;
    updatedBy: string;
    templates: SubTemplateModel[];
}
