import {hexToRgbA} from "../../helpers/hexToRGBA";
import "./CommonStatusTagPredefined.css";
import {FC} from "react";
import './../../styles/styles.css';
import {StatusTagEnum} from "./models/statusTagEnum.model.ts";

interface CommonStatusTagPredefinedProps {
    type: StatusTagEnum | string;
    className?: string;
    labelName?: string;
    backgroundColor?: string;
}

const CommonStatusTagPredefined: FC<CommonStatusTagPredefinedProps> = ({
                                                                                   type,
                                                                                   className,
                                                                                   labelName="Name",
                                                                                   backgroundColor="#1418f9"
                                                                               }) => {

    const safeClassName = typeof className === "string" ? className : "";
    const containerStyle = `common-status-tag ${safeClassName}`.trim();

    const normalizedType =
        typeof type === "string"
            ? type.trim().toLowerCase()
            : String(type).trim().toLowerCase();

    const formattedLabel =
        normalizedType
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

    return (

        <div className={containerStyle}>
            {
                type !== "custom" && (
                    <span className={`status-tag content-center-all-side font-md-semi-bold ${normalizedType}`}>
                        {formattedLabel}
                    </span>
                )
            }
            {
                type === "custom" && (
                    <span
                        className="status-tag content-center-all-side font-md-semi-bold"
                        style={{backgroundColor: hexToRgbA(backgroundColor, 0.1), color: backgroundColor}}>
                        {labelName}
                    </span>
                )
            }
        </div>
    );
};

export default CommonStatusTagPredefined;
