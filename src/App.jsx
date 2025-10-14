// App.jsx

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { UserProvider } from "./context/UserContext";
import { PrivateRoute } from "./functions/PrivateRoute";
import { Toaster } from "sonner";

export function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/home/*"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}
