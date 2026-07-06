import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AdminRoute from "./route/route";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";


import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SystemSettingProvider from "./context/SystemSettingProvider";
import "./index.css"
function App() {
  return (
    <SystemSettingProvider> 
      <AuthProvider>
          <ToastContainer 
            position="top-right" 
            autoClose={3000} 
            theme="light"
          />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<AdminLayout />}>
                {AdminRoute.map((route, index) => {
                  const Page = route.component;
                  return (
                    <Route 
                      key={index} 
                      path={route.path} 
                      element={
                        <ProtectedRoute allowedRoles={route.roles}>
                          <Page />
                        </ProtectedRoute>
                      } 
                    />
                  );
                })}
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
     </SystemSettingProvider>
  );
}

export default App;
