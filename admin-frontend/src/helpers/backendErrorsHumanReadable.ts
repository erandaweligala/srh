import {ErrorMessages} from "../constants/apiErrorMessages.ts";

export const getErrorHumanReadableMessage = (error: any) => {

    let errorMessage: string = 'An Error Occurred';

    const header = error?.response?.data?.responseHeader;
    const result = error?.response?.data?.result;

    if (result?.resultDescription) {
        errorMessage = result.resultDescription;
    } else if (header?.code) {
        const message =
            ErrorMessages.get(header.code) ?? header.desc ?? 'Unknown error';

        errorMessage = `${message}\nReference: ${header.requestId ?? ''}`;
    } else if (error?.response?.status) {
        errorMessage = error.response.statusText;
    } else if (error.response === undefined) {
        if (error.message === "Network Error") {
            errorMessage = "Please Check Your Internet Connection";
        } else {
            errorMessage = error.message;
        }
    }

    return errorMessage;

}
