import { FC } from "react";
import { Drawer, Button } from "antd";
import { CloseOutlined, MinusOutlined } from "@ant-design/icons";
import "./ApprovalDrawer.css";
import showNotification from "../../../../services/notification.service.tsx";
import { ApprovalConfigModel } from "../../models/approvalConfigs.model.ts";

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: () => Promise<void>;
    approvalConfigs: ApprovalConfigModel[];
};

const ApprovalDrawer: FC<Props> = ({ open, onClose, onSubmit, approvalConfigs }) => {

    const handleSubmit = async () => {
        try {
            // await onSubmit();
            if (typeof onSubmit === "function") {
                await onSubmit();
            }

            // Close the drawer after successful submission
            if (typeof onClose === "function") {
                onClose();
            }
        } catch (err: any) {
            console.error("approval request submit error:", err);
            const errorMessage = err?.response?.data?.message || "Unable to submit approval request. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    };

    return (
        <Drawer
            title={<span className="font-2xl-semi-bold">Submit for Approvals</span>}
            open={open}
            onClose={onClose}
            width={500}
            destroyOnClose
            closeIcon={<CloseOutlined className="custom-close-icon" />}
        >
            <div className="drawer-body">
                <div className="approval-flow">
                    {approvalConfigs && approvalConfigs.length > 0 ? (
                        approvalConfigs.map((lvl) => (
                            <div key={lvl.approvalLevel} className="approval-row">
                                <div className="minus-box">
                                    <MinusOutlined />
                                </div>

                                <div className="approval-label-box">
                                    {lvl.levelName}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-configs">No approval configurations found.</div>
                    )}
                </div>

                <div className="drawer-btn-section">
                    <Button type="primary" onClick={() => handleSubmit()}>
                        Submit
                    </Button>
                </div>
            </div>
        </Drawer>
    );
};

export default ApprovalDrawer;
