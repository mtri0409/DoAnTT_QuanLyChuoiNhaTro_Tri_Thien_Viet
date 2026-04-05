import UserLayout from "./layout/UserLayout";
import UserRoute from "./route/route";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserLayout />}>
            {UserRoute.map((route, index) => {
              const Page = route.component;
              return <Route key={index} path={route.path} element={<Page />} />;
            })}
          </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;