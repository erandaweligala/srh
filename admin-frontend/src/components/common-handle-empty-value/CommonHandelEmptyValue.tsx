import {FC} from "react";

interface CommonHandelEmptyValueProps {
    value: any
}

const CommonHandelEmptyValue: FC<CommonHandelEmptyValueProps> = ({value}) => {

    let returnValue;

    if(value === undefined || value === null || value === "") {
        returnValue = "-"
    } else {
        returnValue = value
    }

    return returnValue
}

export default CommonHandelEmptyValue;