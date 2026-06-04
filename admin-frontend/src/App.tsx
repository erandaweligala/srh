import {ConfigProvider} from "antd";
import ApiLoadingSpinner from "./components/api-loading-spinner/ApiLoadingSpinner";
import MainRoutes from "./routing/MainRouter";
import './App.css';
import '@fontsource/poppins';
import {useAppDispatch} from "./stores/mainStore.ts";
import {initialApplicationLoading, trackUserInteraction} from "./services/authenticationLogic.service.ts";
import {useEffect} from "react";

function App() {

    const dispatch = useAppDispatch();

    useEffect(() => {
        const applyGlobalAutocompleteOff = () => {
            document.querySelectorAll('form').forEach((form) => {
                form.setAttribute('autocomplete', 'off');
            });

            document.querySelectorAll('input, textarea').forEach((field) => {
                const tagName = field.tagName.toLowerCase();
                const input = field as HTMLInputElement;
                const type = tagName === 'input' ? input.type?.toLowerCase() : 'textarea';

                if (type === 'password') return;

                field.setAttribute('autocomplete', 'off');
                field.setAttribute('autocorrect', 'off');
                field.setAttribute('autocapitalize', 'off');
                field.setAttribute('spellcheck', 'false');
            });
        };

        applyGlobalAutocompleteOff();

        const observer = new MutationObserver(() => {
            applyGlobalAutocompleteOff();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        initialApplicationLoading(true);
    }, [dispatch]);

    useEffect(() => {
        window.addEventListener('mousemove', trackUserInteraction);
        window.addEventListener('keydown', trackUserInteraction);
        window.addEventListener('scroll', trackUserInteraction);
        window.addEventListener('click', trackUserInteraction);

        return () => {
            window.removeEventListener('mousemove', trackUserInteraction);
            window.removeEventListener('keydown', trackUserInteraction);
            window.removeEventListener('scroll', trackUserInteraction);
            window.removeEventListener('click', trackUserInteraction);
        };
    }, []);

    return (
        <div>
            <ConfigProvider>
                <ApiLoadingSpinner/>
                <MainRoutes/>
            </ConfigProvider>
        </div>
    )
}

export default App
