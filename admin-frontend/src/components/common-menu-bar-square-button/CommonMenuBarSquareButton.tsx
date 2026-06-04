import {Button} from "antd";
import {FC} from "react";

import "./CommonMenuBarSquareButton.css";

interface CommonMenuBarSquareButtonProps {
    imageUrl: string;
    onClick: () => void;
    className?: string;
    backgroundColor?: string;
}

const CommonMenuBarSquareButton: FC<CommonMenuBarSquareButtonProps> = ({
                                                 onClick,
                                                 className,
                                                 imageUrl,
                                                 backgroundColor= "transparent"
                                             }) => {

    const buttonStyles = `common-square-button ${className}`;

    return (
        <span className={buttonStyles}>
            <Button
                type="default"
                onClick={onClick}
                style={{backgroundColor: backgroundColor}}
            >
                <img
                    className="icon"
                    src={imageUrl}
                    alt="Button Icon"
                />
            </Button>
        </span>
    )
}

export default CommonMenuBarSquareButton;