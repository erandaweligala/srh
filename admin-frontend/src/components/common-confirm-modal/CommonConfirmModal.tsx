import {FC, ReactNode} from "react";
import "./CommonConfirmModal.css";
import {Button, Divider, Modal} from "antd";

interface CommonConfirmModalProps {
    title: ReactNode;
    children?: ReactNode;
    isOpen: boolean;
    onOk: () => void;
    okText?: string;
    onCancel: () => void;
    cancelText?: string;
    btnDanger?: boolean;
}

const CommonConfirmModal: FC<CommonConfirmModalProps> = ({
                                                                     children,
                                                                     isOpen = true,
                                                                     title = "Are you sure to proceed?",
                                                                     onOk,
                                                                     onCancel,
                                                                     okText = "Yes, Proceed",
                                                                     cancelText = "Cancel",
                                                                     btnDanger = false,
                                                                 }) => {
    return (
        <div>
            <Modal
                rootClassName="common-confirm-modal"
                open={isOpen}
                title={title}
                onOk={onOk}
                onCancel={onCancel}
                footer={[
                    <Button
                        className="mt-1 mr-1"
                        key="back"
                        onClick={onCancel}
                        size="small"
                    >
                        {cancelText}
                    </Button>,
                    <Button
                        className={btnDanger ? "danger" : ''}
                        key="submit"
                        type="primary"
                        onClick={onOk}
                        size="small"
                    >
                        {okText}
                    </Button>,
                ]}
            >
                <Divider/>
                {children}
            </Modal>
        </div>
    );
};

export default CommonConfirmModal;
