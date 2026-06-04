import {Navigate, Outlet} from "react-router-dom";
import MainMenu from "../components/main-menu/MainMenu";
import {Col, Row} from "antd";
import {useAppSelector} from "../stores/mainStore.ts";
import {ConfigNamesEnumModel} from "../constants/configNamesEnum.model.ts";
import {DEFAULT_VERSION} from "../constants/validationConditions.ts";
import INTERNAL_ROUTES from "../constants/internalRoutes";
import LazyLoadingSkeleton from "../components/lazy-loading-skeleton/LazyLoadingSkeleton";

const PrivateRoute = () => {
    const isUserLogin = useAppSelector(state => state.auth.isUserLogin);
    const isAppInitialized = useAppSelector(state => state.auth.isAppInitialized);
    const systemMetaData = useAppSelector(state => state.metadata);
    const version = systemMetaData.systemSettings.find((metaData) => metaData.configKey === ConfigNamesEnumModel.Version)?.configValue || DEFAULT_VERSION;

    if (!isAppInitialized) {
        return <LazyLoadingSkeleton />;
    }

    if (!isUserLogin) {
        return <Navigate to={INTERNAL_ROUTES.LOGIN_PAGE} replace />;
    }

    return (
        <div id="root">
            <MainMenu/>
            <div className="main-content">
                <Outlet/>
            </div>
            <div className="footer-class">
                <Row>
                    <Col span={24}>
                        &copy; 2025. All Rights Reserved. ({version})
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PrivateRoute;