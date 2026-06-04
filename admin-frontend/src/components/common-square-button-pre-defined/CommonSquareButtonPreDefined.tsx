import {FC} from "react";
import "./CommonSquareButtonPreDefined.css";

import addImage from "./assets/images/add.png";
import moreImage from "./assets/images/more.png";
import editImage from "./assets/images/edit.png";
import viewImage from "./assets/images/view.png";
import minusImage from "./assets/images/minus.png";
import calenderImage from "./assets/images/calendar.png";
import closeImage from "./assets/images/close.png";
import downloadImage from "./assets/images/download.png";
import refreshImage from "./assets/images/refresh.png";
import addNew from "./assets/images/plus_icon.png";
import createNew from "./assets/images/create_icon.png";

import downArrowImage from "./assets/images/down-arrow.png";
import upArrowImage from "./assets/images/up-arrow.png";
import rightArrowImage from "./assets/images/right-arrow.png";
import leftArrowImage from "./assets/images/left-arrow.png";
import uploadImage from "./assets/images/upload-excel.png";
import deleteImage from "./assets/images/delete-icon.png";
import approveImage from "./assets/images/approve.png";
import rejectImage from "./assets/images/reject.png";
import lockImage from "./assets/images/lock.png";
import unlockImage from "./assets/images/unlock.png";
import { Tooltip } from "antd";
import { ButtonTypeEnum } from "./models/buttonTypesEnum.model";


interface CommonSquareButtonPreDefinedProps {
    onClick?: () => void;
    type: ButtonTypeEnum;
    className?: string;
    text?: string;
    tooltipText?: string;
    isButtonInsideTable?: boolean;
}

const imageMapping: Partial<Record<ButtonTypeEnum, string>> = {
    [ButtonTypeEnum.ADD]: addImage,
    [ButtonTypeEnum.MORE]: moreImage,
    [ButtonTypeEnum.EDIT]: editImage,
    [ButtonTypeEnum.VIEW]: viewImage,
    [ButtonTypeEnum.MINUS]: minusImage,
    [ButtonTypeEnum.CALENDER]: calenderImage,
    [ButtonTypeEnum.DOWN_ARROW]: downArrowImage,
    [ButtonTypeEnum.UP_ARROW]: upArrowImage,
    [ButtonTypeEnum.RIGHT_ARROW]: rightArrowImage,
    [ButtonTypeEnum.LEFT_ARROW]: leftArrowImage,
    [ButtonTypeEnum.CLOSE]: closeImage,
    [ButtonTypeEnum.DOWNLOAD]: downloadImage,
    [ButtonTypeEnum.REFRESH]: refreshImage,
    [ButtonTypeEnum.ADD_NEW]: addNew,
    [ButtonTypeEnum.CREATE_NEW]: createNew,
    [ButtonTypeEnum.UPLOAD]: uploadImage,
    [ButtonTypeEnum.DELETE]: deleteImage,
    [ButtonTypeEnum.APPROVE]: approveImage,
    [ButtonTypeEnum.REJECT]: rejectImage,
    [ButtonTypeEnum.BLOCK]: lockImage,
    [ButtonTypeEnum.UNBLOCK]: unlockImage,
    [ButtonTypeEnum.NONE]: '',
};

const CommonSquareButtonPreDefined: FC<CommonSquareButtonPreDefinedProps> = ({
                                                                                 onClick = () => {
                                                                                 },
                                                                                 type,
                                                                                 tooltipText,
                                                                                 className,
                                                                                 isButtonInsideTable = false,
                                                                                 text = null
                                                                             }
) => {

    const textButtonStyles = `
        square-button-text-pre-defined ms-2
        ${className ? className : ''} 
        ${isButtonInsideTable ? 'inside-table' : ''}
    `;

    return (
        <>
            <Tooltip placement="bottom" title={tooltipText}>
                <div
                    className={textButtonStyles}
                    onClick={onClick!}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onClick();
                        }
                    }}
                >
                    {type in imageMapping && type !== ButtonTypeEnum.NONE && (
                        <img src={imageMapping[type]} alt={type.toLowerCase()} className="button-image"/>
                    )}
                    {
                        type === ButtonTypeEnum.NONE &&
                        <div className="ms-2 me-2 pl-1 square-button-btn-color">{text}</div>
                    }
                    {
                        text !== null &&
                        type !== ButtonTypeEnum.NONE &&
                        <div className="ms-2 pl-1 square-button-btn-color">{text}</div>
                    }
                </div>
            </Tooltip>
        </>
    )

}

export default CommonSquareButtonPreDefined;