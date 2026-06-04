import {useParams} from "react-router-dom";
import LoginFailed from "../../../src/assets/images/LoginFailed.png";
import {Button} from "antd";
import INTERNAL_ROUTES from "../../constants/internalRoutes.ts";
import "./LoginError.css"

const LoginError = () => {

    const {errorType} = useParams();

    return (
        <div className="content-center-all-side">

            <div className="login-error-container content-center-all-side-column">
                {/*<img*/}
                {/*    src={CELogo}*/}
                {/*    alt="ce-logo"*/}
                {/*    height={33}*/}
                {/*    width={'100%'}*/}
                {/*/>*/}
                <div className="status-title">
                    {
                        errorType && errorType === 'no-user' && 'User not in system'
                    }
                    {
                        errorType && errorType === 'user-inactive' && 'User inactive'
                    }
                    {
                        errorType && errorType === 'internal-error' && 'System error'
                    }
                </div>
                <h2>AAA Admin Console</h2>
                <span>Login Failed!</span>

                <div className="image-wrapper">
                    <img
                        src={LoginFailed}
                        alt={"loggin error"}
                        height={150}
                        width={'100%'}
                    />
                </div>

                <div className="status-description">
                    Your session failed please try again
                </div>

                <Button
                    type="primary"
                    htmlType="submit"
                    className="login-btn w-100 mt-5"
                    onClick={() => document.location.href = INTERNAL_ROUTES.LOGIN_PAGE}
                >
                    BACK TO LOGIN PAGE
                </Button>

            </div>

        </div>
    )

}

export default LoginError;