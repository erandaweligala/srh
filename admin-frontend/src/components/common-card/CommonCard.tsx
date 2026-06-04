import {hexToRgbA} from "../../helpers/hexToRGBA";
import "./CommonCard.css";
import React, {FC} from "react";


interface CommonCardProps {
    icon?: React.ReactNode;
    text: string;
    backgroundColor: string;
    count: number | string;
    isCountColorEnabled?: boolean
}

const CommonCard: FC<CommonCardProps> = ({
                                                               text,
                                                               count,
                                                               backgroundColor,
                                                               icon,
                                                               isCountColorEnabled=false
                                                           }) => {

    return (

        <div className="card-type-1">

            {
                icon && 
                
                <div style={{display: "flex"}}>

                    <div
                        className="icon-container content-center-all-side"
                        style={{backgroundColor: backgroundColor}}
                    >
                        {icon}
                    </div>

                    <div
                        className="content-container-with-icon"
                        style={{backgroundColor: hexToRgbA(backgroundColor, 0.1)}}
                    >
                        <span className="text font-md-regular mb-1">{text}</span>                        
                        <span className="count">{count}</span>
                    </div>

                </div>
            }

            {
                !icon && 

                <div style={{display: "flex"}}>

                    <div
                        className="content-container"
                        style={{backgroundColor: hexToRgbA(backgroundColor, 0.1)}}
                    >
                        <span className="text font-md-regular mb-1">{text}</span>
                        {
                            isCountColorEnabled &&
                            <span className="count" style={{color: backgroundColor}}>{count}</span>
                        }
                        {
                            !isCountColorEnabled &&
                            <span className="count">{count}</span>
                        }
                    </div>

                </div>
            }

        </div>

    );

};

export default CommonCard;
