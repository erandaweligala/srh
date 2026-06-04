import {FC} from "react";
import {Drawer, Form, Input} from "antd";
import { CloseOutlined } from "@ant-design/icons";

interface QosDrawerProps {
    open: boolean;
    onClose: () => void;
}

const BucketDetailsDrawer: FC<QosDrawerProps> = ({ open, onClose }) => {
    const [form] = Form.useForm();

    return (
            <Drawer
                className="common-drawer"
                width={500}
                title={
                    <span className="font-2xl-semi-bold">
                            {"Bucket Details"}
                        </span>
                }
                open={open}
                onClose={onClose}
                destroyOnClose={true}
                closeIcon={<CloseOutlined className="custom-close-icon"/>}
            >
                <div className="drawer-body">
                    <div className="drawer-form-content">
                        <Form
                            form={form}
                            layout="horizontal"
                            labelCol={{ span: 7 }}
                            wrapperCol={{ span: 17 }}
                            colon={false}
                        >
                            <Form.Item
                                label="BNG Code"
                                name="bngCode"
                                rules={[{ required: true, message: 'BNG Code is required' }]}
                            >
                                <Input placeholder="Enter BNG Code" />
                            </Form.Item>
                            <Form.Item
                                label="QoS Profile Name"
                                name="qosProfileName"
                                rules={[{ required: true, message: 'QoS Profile Name is required' }]}
                            >
                                <Input placeholder="Enter QoS Profile Name" />
                            </Form.Item>
                            <Form.Item
                                label="Uplink"
                                name="upLink"
                                rules={[{ required: true, message: 'Uplink is required' }]}
                            >
                                <Input placeholder="Enter Uplink" />
                            </Form.Item>
                            <Form.Item
                                label="Downlink"
                                name="downLink"
                                rules={[{ required: true, message: 'Downlink is required' }]}
                            >
                                <Input placeholder="Enter Downlink" />
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </Drawer>
    );
};

export default BucketDetailsDrawer;
