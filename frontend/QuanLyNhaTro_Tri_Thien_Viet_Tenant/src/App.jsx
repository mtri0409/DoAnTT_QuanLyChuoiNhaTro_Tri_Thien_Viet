import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminRoute from "./route/route";

import TenantLayout from "./layout/TenantLayout";
import { AuthProvider } from "./context/AuthProvider";
import Login from "./pages/auth/Login";
import { SystemSettingProvider } from "./context/SystemSettingProvider";


function App() {
  return (
    
      <BrowserRouter>
        <AuthProvider>
          <SystemSettingProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<TenantLayout />}>
                {AdminRoute.map((route, index) => {
                  const Page = route.component;
                  return <Route key={index} path={route.path} element={<Page />} />;
                })}
              </Route>
            </Routes>
          </SystemSettingProvider>
        </AuthProvider>
    </BrowserRouter>

  );
}

export default App;