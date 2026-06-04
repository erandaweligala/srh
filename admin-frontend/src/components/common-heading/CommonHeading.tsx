import {FC, ReactNode} from "react";
import Sizes from "../../constants/sizes";
import './CommonHeading.css';

interface CommonHeadingProps {
    size: Sizes;
    children: ReactNode;
}

const CommonHeading: FC<CommonHeadingProps> = ({
    size,
    children='test'
}) => {

    return (
        <div className={`heading ${size}`}>
            {children}
        </div>
    )
}

export default CommonHeading;