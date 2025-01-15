import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@redux/store";
import { RouterProvider } from "react-router-dom";
import { coreRouter } from "@routes";
import { Toaster } from "@/components/ui/toaster";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <Toaster />
                    <RouterProvider router={coreRouter} />
                </PersistGate>
            </Provider>
    </React.StrictMode>
);
