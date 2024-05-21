import { Amplify } from "aws-amplify";
import { RouterProvider } from "@tanstack/react-router";

// import "./App.css";

import { router } from "./router";
import amplifyconfig from "@/config/amplify";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "./components/ui/toaster";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
Amplify.configure(amplifyconfig);

const App = () => {
  const auth = useAuthStore();
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} context={{ auth }} />
        <Toaster />
      </ThemeProvider>
    </>
  );
};

export default App;
