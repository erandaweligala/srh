import { FC } from "react";
import { Card, Descriptions } from "antd";
import { NotificationTemplateModel, SubTemplateModel } from "../../../models/notification-template.model.ts";
import { renderStatusTag } from "../../../../../helpers/helperFunctions.tsx";
import "../NotificationTemplate.css";

interface ViewNotificationProps {
    record: NotificationTemplateModel;
}

const ViewNotification: FC<ViewNotificationProps> = ({ record }) => {
    const usageTemplates = record.templates?.filter((t: SubTemplateModel) => t.messageType === "USAGE") || [];
    const expireTemplates = record.templates?.filter((t: SubTemplateModel) => t.messageType === "EXPIRED") || [];
    const userCreationTemplates = record.templates?.filter((t: SubTemplateModel) => t.messageType === "USER_CREATION") || [];
    const userUpdateTemplates = record.templates?.filter((t: SubTemplateModel) => t.messageType === "USER_UPDATE") || [];

    return (
        <div className="common-page-margin view-notification-page">
            <Descriptions bordered column={1} className="mb-2">
                <Descriptions.Item label={'Template Name'}>{record.templateName}</Descriptions.Item>
                <Descriptions.Item label={'Status'}>{renderStatusTag(record.status)}</Descriptions.Item>
                <Descriptions.Item label={'Default'}>{record.isDefault ? 'True' : 'False'}</Descriptions.Item>
            </Descriptions>

            {usageTemplates.length > 0 && (
                <div>
                    <Card title="Usage Notification" className="view-section-card">

                        {usageTemplates.map((template: SubTemplateModel) => (
                            <Descriptions bordered column={1} size="small"
                                labelStyle={{ width: 180, fontWeight: 500, backgroundColor: "#fa5f5f5", whiteSpace: "nowrap", color: "#000" }}
                                contentStyle={{ paddingLeft: 16, color: "#000" }}>
                                <Descriptions.Item label={template.quotaPercentage}>{template.messageContent}</Descriptions.Item>
                            </Descriptions>
                        ))}
                    </Card>
                </div>
            )}

            {expireTemplates.length > 0 && (
                <div className="mt-2">
                    <Card title="Expired Notification" style={{ flex: 1, borderRadius: 0 }} headStyle={{ background: "#f5f5f5", fontWeight: '100px', fontSize: '14px', padding: '6px 16px', minHeight: 'auto', borderRadius: 0 }}>
                        {expireTemplates.map((template: SubTemplateModel) => (
                            <Descriptions bordered column={1} size="small"
                                labelStyle={{ width: 180, fontWeight: 500, backgroundColor: "#fa5f5f5", whiteSpace: "nowrap", color: "#000" }}
                                contentStyle={{ paddingLeft: 16, color: "#000" }}>
                                <Descriptions.Item label={template.daysToExpire}>{template.messageContent}</Descriptions.Item>
                            </Descriptions>
                        ))}
                    </Card>
                </div>
            )}

            {userCreationTemplates.length > 0 && (
                <div className="mt-2">
                    <Card title="User Creation" style={{ flex: 1, borderRadius: 0 }} headStyle={{ background: "#f5f5f5", fontWeight: '100px', fontSize: '14px', padding: '6px 16px', minHeight: 'auto', borderRadius: 0 }}>
                        {userCreationTemplates.map((template: SubTemplateModel) => (
                            <Descriptions bordered column={1} size="small"
                                labelStyle={{ width: 180, fontWeight: 500, backgroundColor: "#fa5f5f5", whiteSpace: "nowrap", color: "#000" }}
                                contentStyle={{ paddingLeft: 16, color: "#000" }}>
                                <Descriptions.Item label="Message Content">{template.messageContent}</Descriptions.Item>
                            </Descriptions>
                        ))}
                    </Card>
                </div>
            )}

            {userUpdateTemplates.length > 0 && (
                <div className="mt-2">
                    <Card title="User Update" style={{ flex: 1, borderRadius: 0 }} headStyle={{ background: "#f5f5f5", fontWeight: '100px', fontSize: '14px', padding: '6px 16px', minHeight: 'auto', borderRadius: 0 }}>
                        {userUpdateTemplates.map((template: SubTemplateModel) => (
                            <Descriptions bordered column={1} size="small"
                                labelStyle={{ width: 180, fontWeight: 500, backgroundColor: "#fa5f5f5", whiteSpace: "nowrap", color: "#000" }}
                                contentStyle={{ paddingLeft: 16, color: "#000" }}>
                                <Descriptions.Item label="Message Content">{template.messageContent}</Descriptions.Item>
                            </Descriptions>
                        ))}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ViewNotification;
