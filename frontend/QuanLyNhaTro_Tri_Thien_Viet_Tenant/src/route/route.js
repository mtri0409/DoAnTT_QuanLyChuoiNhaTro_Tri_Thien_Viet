import Home from "../pages/Home";
import ProfileDetail from "../pages/profile/ProfileDetail";
import ProfileUpdate from "../pages/profile/UpdateProfile";


const AdminRoute = [
  { path: "/", component: Home },
  {path: "user/profile/:id",component:ProfileDetail},
  {path: "user/profile/:id/update",component:ProfileUpdate}

];
export default AdminRoute;