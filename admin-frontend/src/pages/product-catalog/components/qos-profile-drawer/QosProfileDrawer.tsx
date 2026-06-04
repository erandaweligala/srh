import {FC, useState} from "react";
import {Button, Drawer, Form, Input, Modal, Select} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
import {formatValue} from "../../../../helpers/stringValidators.ts";
import CommonSquareButtonPreDefined
    from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import {ButtonTypeEnum} from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";

interface QosDrawerProps {
    open: boolean;
    onClose: () => void;
    bucketData?: any;
}

const QosProfileDrawer: FC<QosDrawerProps> = ({ open, onClose, bucketData }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false)
    const [form] = Form.useForm();

    const qosColumns = [
        { title: 'QoS Profile Name', dataIndex: 'qosProfileName', key: 'qosProfileName', render: formatValue },
        { title: 'Bandwidth', dataIndex: 'bandwidth', key: 'bandwidth', render: formatValue },
        { title: 'Created Date', dataIndex: 'createdDate', key: 'createdDate', render: formatValue },
        { title: 'Last Updated Date', dataIndex: 'lastUpdatedDate', key: 'lastUpdatedDate', render: formatValue },
        {
            title: "Action",
            key: "action",
            align: "center",
            width: 100,
            render: (_: any, record: any) => (
                <div>
                    <CommonSquareButtonPreDefined
                        type={ButtonTypeEnum.EDIT}
                        onClick={() => {
                            setIsEdit(true);
                            form.setFieldsValue({
                                qosProfileName: record.qosProfileName,
                                bandwidth: record.bandwidth
                            });
                            setModalOpen(true);
                        }}
                    />
                </div>
            )
        }
    ];

    type QosRow = {
        key: number;
        qosProfileName: string;
        bandwidth: string;
        createdDate: string;
        lastUpdatedDate: string;
        [key: string]: string | number;
    };

    const qosData: QosRow[] = Array.from({ length: 5 }, (_, i) => ({
        key: i + 1,
        qosProfileName: `${bucketData?.qosProfile}_${i + 1}`,
        bandwidth: `BN${i + 1}`,
        createdDate: "example",
        lastUpdatedDate: "example"
    }));

    return (
        <>
        <Drawer
            className="common-drawer"
            width={750}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-2xl-semi-bold">QoS Profile</span>
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                            setIsEdit(false);
                            form.resetFields()
                            setModalOpen(true);
                        }}
                    >
                        Create New QoS Profile
                    </Button>
                </div>
            }
            open={open}
            onClose={onClose}
            destroyOnClose={true}
            closeIcon={<CloseOutlined className="custom-close-icon"/>}
        >
            <div className="drawer-body">
                {!modalOpen ? (
                    <DynamicTable
                        columns={qosColumns}
                        data={qosData}
                        pagination={{
                            current: 1,
                            pageSize: 10,
                            total: qosData.length
                        }}
                    />
                ) : (
                    <Modal
                        className="modal-with-border"
                        title={isEdit ? "Edit QoS Profile" : "Add QoS Profile"}
                        open={modalOpen}
                        width={800}
                        getContainer={false}
                        footer={null}
                        onCancel={() => setModalOpen(false)}
                        style={{ margin: 0 }}
                        modalRender={(modal) => (
                            <div
                                style={{
                                    display: "inline-block",
                                    position: "absolute",
                                    top: "40px",
                                    left: "50%",
                                    transform: "translateX(100%)",
                                }}
                            >
                                {modal}
                            </div>
                        )}
                    >
                        <Form
                            form={form}
                            layout="horizontal"
                            onFinish={() => {
                                setModalOpen(false);
                                form.resetFields();
                            }}
                            labelCol={{ span: 10 }}
                            wrapperCol={{ span: 30 }}
                            colon={false}
                        >
                            <Form.Item
                                label="QoS Profile Name"
                                name="qosProfileName"
                            >
                                <Input placeholder="Enter QoS Profile Name" />
                            </Form.Item>
                            <Form.Item
                                label="Upload Bandwidth"
                                name="uploadBandwidth"
                            >
                                <Input placeholder="Enter Upload Bandwidth" />
                            </Form.Item>
                            <Form.Item
                                label="Download Bandwidth"
                                name="downloadBandwidth"
                            >
                                <Input placeholder="Enter Download Bandwidth" />
                            </Form.Item>
                            <Form.Item
                                label="Unit of Measurement"
                                name="unitOfMeasurement"
                            >
                                <Select
                                    placeholder="Select Unit of Measurement"
                                    options={[]}
                                    allowClear
                                />
                            </Form.Item>
                        </Form>
                        <div className="drawer-btn-section" style={{borderTop: "none", marginTop: "0px"}}>
                            <Button type="primary" onClick={() => {/* handle action */}}>
                                {isEdit ? "Update" : "Add"}
                            </Button>
                        </div>
                    </Modal>
                )
                }
            </div>
        </Drawer>


        </>
    );
};

export default QosProfileDrawer;
