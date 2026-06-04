import {useAppSelector} from "../../stores/mainStore";
import {Navigate} from "react-router-dom";
import INTERNAL_ROUTES from "../../constants/internalRoutes";
import {FC} from "react";

type NotFoundProps = object

const NotFound: FC<NotFoundProps> = () => {

    const isLogin = useAppSelector(state => state.auth.isUserLogin);

    if (isLogin) {
        return <Navigate to={INTERNAL_ROUTES.HOME_PAGE}/>;
    } else {
        return <Navigate to={INTERNAL_ROUTES.LOGIN_PAGE}/>;
    }

}

export default NotFound;