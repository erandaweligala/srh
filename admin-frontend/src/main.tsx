import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import store from "./stores/mainStore";
import {Provider} from 'react-redux';
import '@fontsource/poppins';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/700.css';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            {/*<PersistGate loading={<div>Loading...</div>} persistor={persistor}>*/}
                <App/>
            {/*</PersistGate>*/}
        </Provider>
    </React.StrictMode>
);
