import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@redux/store";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { rootRoutes } from "./routes/root";
import { Auth0Provider } from "@auth0/auth0-react";

const router = createBrowserRouter([rootRoutes]);

const auth0_config = {
    domain: "" + import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: "" + import.meta.env.VITE_AUTH0_CLIENT_ID,
    audience: "" + import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: "" + import.meta.env.VITE_AUTH0_SCOPE,
    login_redirect: "" + import.meta.env.VITE_AUTH0_LOGIN_REDIRECT,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Auth0Provider
            domain={auth0_config.domain}
            clientId={auth0_config.clientId}
            authorizationParams={{
                audience: auth0_config.audience,
                scope: auth0_config.scope,
                redirect_uri: auth0_config.login_redirect
            }}
        >
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <RouterProvider router={router} />
                </PersistGate>
            </Provider>
        </Auth0Provider>
    </React.StrictMode>
);
