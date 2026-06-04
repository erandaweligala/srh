import { Button, Col, Row } from "antd";
import { FC, useEffect } from "react";
import "./Login.css";
import LoginImage from "../../../src/assets/images/Mask Group 33.png";
import HandWaving from "../../../src/assets/images/HandWaving.png";
import WindowsRectangle from "../../../src/assets/images/RectangleWindow.png";
import { useAppSelector } from "../../stores/mainStore";
import { useNavigate } from "react-router-dom";
import INTERNAL_ROUTES from "../../constants/internalRoutes";
import { clickLoginButton as handleLoginRedirect } from "../../services/authenticationLogic.service";

type LoginProps = object

const Login: FC<LoginProps> = () => {

    const isLogin = useAppSelector(state => state.auth.isUserLogin);

    const navigate = useNavigate();

    useEffect(() => {
        if (isLogin) {
            navigate(INTERNAL_ROUTES.HOME_PAGE);
        }
    }, [isLogin])
    const clickLoginButton = () => {
        console.log("clickLoginButton");
        handleLoginRedirect();
    }

    return (
        <div className="login-page">
            <Row gutter={[0, 0]} style={{ height: '100vh', overflow: 'hidden' }}>
                <Col xs={24} sm={24} md={12} lg={12} xl={12} className="image-wrapper content-center-all-side ">

                    <img
                        src={LoginImage}
                        alt="LoginImage"
                        width={"100%"}
                        className="leftImg"
                        style={{ height: '100%' }}
                    />

                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={12} className="details-container content-center-all-side">

                    <div style={{ width: '80%' }}>


                        <div className="content-center-vertical  title-container">
                            <span className="aaa-text">{"AAA "}</span>
                            <span className="admin-console-text"><strong>{"Admin Console"}</strong></span>
                        </div>
                        <div className="content-center-vertical">
                            <span className="hello-there">{"Hello there,"}</span>
                            <img
                                src={HandWaving}
                                alt="hand-waving"
                                width={32}
                                height={32}
                            />
                        </div>

                        <div className="content-center-vertical">
                            <span className="welcome-to">{"Welcome to "}</span>
                            <span className="digital-telco">{" Admin Console"}</span>
                        </div>

                        <br />

                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-btn w-100 mt-1"
                            onClick={clickLoginButton}
                        >
                            {/* <img
                                src={WindowsRectangle}
                                alt="windows-rectangle"
                                width={25}
                                height={25}
                            /> */}
                            <span style={{ marginLeft: 22 }}>LOG IN WITH FORGEROCK</span>
                        </Button>

                    </div>

                </Col>
            </Row>
        </div>
    );
};

export default Login;
