import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@redux/store";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { rootRoutes } from "./routes/root";

const router = createBrowserRouter([rootRoutes]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
            <RouterProvider router={router} />
            </PersistGate>
        </Provider>
    </React.StrictMode>
);
