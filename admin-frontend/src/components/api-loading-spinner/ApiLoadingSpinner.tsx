import {useEffect, useState} from "react";

import {pendingApiCalls$} from "../../services/axios.service";


const ApiLoadingSpinner= () => {

    const [pendingApiCalls, setPendingApiCalls] = useState(0);

    useEffect(() => {
        const loadingObservableListener = pendingApiCalls$.subscribe((pendingApiCalls) => {
            setPendingApiCalls(pendingApiCalls)
        });
        return () => {
            loadingObservableListener.unsubscribe();
        }
    }, []);

    let loadingSpinner = <span></span>;

    if(pendingApiCalls > 0) {
        loadingSpinner = (
            <div className="loading-spinner_backdrop">
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <div className="loader"/>
                </div>
            </div>
        )
    }

    return (loadingSpinner)

}

export default ApiLoadingSpinner;
