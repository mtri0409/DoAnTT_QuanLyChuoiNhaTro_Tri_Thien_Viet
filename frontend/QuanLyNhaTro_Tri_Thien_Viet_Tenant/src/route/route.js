import Home from "../pages/Home";
import ChangePassword from "../pages/profile/ChangePassword";
import ProfileDetail from "../pages/profile/ProfileDetail";
import ProfileUpdate from "../pages/profile/UpdateProfile";


const AdminRoute = [
  { path: "/", component: Home },
  {path: "user/profile/:id",component:ProfileDetail},
  {path: "user/profile/:id/update",component:ProfileUpdate},
  {path: "user/change-password",component:ChangePassword}
];
export default AdminRoute;