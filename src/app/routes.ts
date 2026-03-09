import { createBrowserRouter } from "react-router";
import { FullChatPage } from "./pages/FullChatPage";
import { AdvancedSettingsPage } from "./pages/AdvancedSettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: FullChatPage,
  },
  {
    path: "/settings",
    Component: AdvancedSettingsPage,
  },
]);