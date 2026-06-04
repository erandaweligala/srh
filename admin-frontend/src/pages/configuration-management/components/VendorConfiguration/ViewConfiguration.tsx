import { FC } from "react";
import { Descriptions } from "antd";
import { ConfigurationManagementModel } from "../../models/configuration.model";
import { renderStatusTag } from "../../../../helpers/helperFunctions";
import "./Configuration.css";

interface ViewConfigurationProps {
    record: ConfigurationManagementModel;
}

const ViewConfiguration: FC<ViewConfigurationProps> = ({ record }) => {
    return (
        <div className="common-page-margin view-configuration-page">
            <Descriptions bordered column={1} className="mb-2">
                <Descriptions.Item label={'Vendor ID'}>{record.vendorId}</Descriptions.Item>
                <Descriptions.Item label={'Vendor Name'}>{record.vendorName}</Descriptions.Item>
                <Descriptions.Item label={'Attribute ID'}>{record.attributeId}</Descriptions.Item>
                <Descriptions.Item label={'Attribute Name'}>{record.attributeName}</Descriptions.Item>
                <Descriptions.Item label={'Entity'}>{record.entity}</Descriptions.Item>
                <Descriptions.Item label={'Parameter'}>{record.parameter}</Descriptions.Item>
                <Descriptions.Item label={'Value Path'}>{record.valuePath}</Descriptions.Item>
                <Descriptions.Item label={'Data Type'}>{record.dataType}</Descriptions.Item>
                <Descriptions.Item label={'Is Active'}>
                    <div className="view-config-status-align">
                        {renderStatusTag(record.isActive ? 'Active' : 'Inactive')}
                    </div>
                </Descriptions.Item>
                <Descriptions.Item label={'Attribute Pre-fix'}>{record.attributePrefix}</Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default ViewConfiguration;
