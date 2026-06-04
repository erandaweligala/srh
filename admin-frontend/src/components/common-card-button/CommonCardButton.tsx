import "./CommonCardButton.css";
import React, {FC} from "react";
import {Button} from "antd";

interface CommonCardBtnProps {
    icon: React.ReactNode;
    buttonText?: React.ReactNode;
    text?: string;
    backgroundColor?: string;
    onClick: () => void;
}

const CommonCardBtn: FC<CommonCardBtnProps> = ({
                                                           onClick,
                                                           text,
                                                           backgroundColor = '#00615A',
                                                           icon,
                                                           buttonText
                                                       }) => {

    return (
        <div className="card-btn">
                <div
                    className="stripe content-center-all-side"
                    style={{backgroundColor: backgroundColor}}
                >
                </div>

                <div className="content content-center-all-side-column">

                    <span className="mb-2">{icon}</span>

                    <span className="mb-4 px-1 font-lg-medium" style={{textAlign: 'center'}}>{text}</span>

                        <Button
                            type="default"
                            onClick={onClick}
                            size="small"
                        >
                            {buttonText}
                        </Button>

                </div>
        </div>
    );

};

export default CommonCardBtn;
