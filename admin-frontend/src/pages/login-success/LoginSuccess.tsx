import {useNavigate, useParams} from "react-router-dom";
import {useEffect} from "react";
import INTERNAL_ROUTES from "../../constants/internalRoutes.ts";
import {getAccessTokenUsingTempToken} from "../../services/authenticationApi.service.ts";
import {mainLoginHandling} from "../../services/authenticationLogic.service.ts";

const LoginSuccess = () => {

    const {tempToken} = useParams();
    const navigate = useNavigate();

    useEffect(() => {

        if (tempToken) {
            getAccessTokenUsingTempToken(tempToken).then(
                (accessToken) => {
                    mainLoginHandling(accessToken);
                    navigate(INTERNAL_ROUTES.HOME_PAGE, {replace: true});
                }
            ).catch((error: Error) => {
                console.log('Error',error)
                navigate(INTERNAL_ROUTES.LOGIN_PAGE, {replace: true});
            });

        } else {
            navigate(INTERNAL_ROUTES.LOGIN_PAGE, {replace: true});
        }

    }, [tempToken]);


    return (<span/>);

}

export default LoginSuccess;