import Dashboard from "../pages/Dashboard";
import CreateProfile from "../pages/proflie/CreateProfile";
import ListProfile from "../pages/proflie/ListProfile";
import ProfileDetail from "../pages/proflie/ProfileDetail";
import UpdateProfile from "../pages/proflie/UpdateProfile";

const AdminRoute = [
  { path: "/", component: Dashboard },
  { path: "/profiles", component: ListProfile },
  { path: "/profile/create", component: CreateProfile },
  { path: "/profile/:id/detail", component: ProfileDetail },
  { path: "/profile/:id/update", component: UpdateProfile },


];
export default AdminRoute;