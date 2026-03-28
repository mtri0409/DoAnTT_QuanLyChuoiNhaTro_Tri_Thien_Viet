import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AdminRoute from "./route/route";
// import { ToastContainer } from "react-toastify";
// import { UserProvider } from "./context/userContext";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            {AdminRoute.map((route, index) => {
              const Page = route.component;
              return <Route key={index} path={route.path} element={<Page />} />;
            })}
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
