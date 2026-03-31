import Dashboard from "../pages/Dashboard";
import ListVehicle from "../pages/vehicle/ListVehicle";
import CreateProfile from "../pages/proflie/CreateProfile";
import ListProfile from "../pages/proflie/ListProfile";
import ProfileDetail from "../pages/proflie/ProfileDetail";
import UpdateProfile from "../pages/proflie/UpdateProfile";
import CreateAccount from "../pages/user/CreateAccount";
import ListUser from "../pages/user/UserList";

const AdminRoute = [
  { path: "/", component: Dashboard },
  { path: "/profiles", component: ListProfile },
  { path: "/profile/create", component: CreateProfile },
  { path: "/profile/:id/detail", component: ProfileDetail },
  { path: "/profile/:id/update", component: UpdateProfile },
  { path: "/users", component: ListUser },
  { path: "/users/create", component: CreateAccount },
  { path: "/vehicles", component: ListVehicle },

];
export default AdminRoute;