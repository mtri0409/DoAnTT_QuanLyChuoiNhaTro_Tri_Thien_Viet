import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminRoute from "./route/route";

import TenantLayout from "./layout/TenantLayout";
import { AuthProvider } from "./context/AuthProvider";
import Login from "./pages/auth/Login";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
           <Route path="/login" element={<Login />} />
          <Route path="/" element={<TenantLayout />}>
            {AdminRoute.map((route, index) => {
              const Page = route.component;
              return <Route key={index} path={route.path} element={<Page />} />;
            })}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );
}

export default App;