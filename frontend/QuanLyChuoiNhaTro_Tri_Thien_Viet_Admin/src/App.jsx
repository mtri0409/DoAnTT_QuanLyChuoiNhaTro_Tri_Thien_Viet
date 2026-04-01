import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AdminRoute from "./route/route";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthProvider";
// import { ToastContainer } from "react-toastify";
// import { UserProvider } from "./context/userContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
           <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminLayout />}>
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
