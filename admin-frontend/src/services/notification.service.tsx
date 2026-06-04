import {notification} from "antd";
import {ArgsProps} from "antd/es/notification/interface";
import {Fragment} from "react";

let lastMessageContent: string = "";
let lastMessageClearTimeId: number | undefined = undefined;

const showNotification = (notificationType: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING', notificationMessage: string) => {

    if(notificationMessage === lastMessageContent) {
        return;
    } else {
        lastMessageContent = notificationMessage;
        clearTimeout(lastMessageClearTimeId);
        setTimeout(() => {
            lastMessageContent = ''
        }, 5000);
    }

    const notificationArgs: ArgsProps = {
        message: notificationType,
        description: (
            <div>
                {notificationMessage.split('\n').map((line, index) => (
                    <Fragment key={index}>
                        {line}
                        <br />
                    </Fragment>
                ))}
            </div>
        ),
        duration: 5,
        placement: "topRight"
    }

    if (notificationType === 'SUCCESS') {
        notification.success(notificationArgs);
    } else if (notificationType === 'ERROR') {
        notification.error(notificationArgs);
    } else if (notificationType === 'INFO') {
        notification.info(notificationArgs);
    } else if (notificationType === 'WARNING') {
        notification.warning(notificationArgs);
    }

}

export default showNotification;
