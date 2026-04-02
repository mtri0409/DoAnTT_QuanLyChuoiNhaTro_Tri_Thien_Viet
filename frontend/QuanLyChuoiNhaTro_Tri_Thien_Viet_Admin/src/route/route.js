import Dashboard from "../pages/Dashboard";
import ListVehicle from "../pages/vehicle/ListVehicle";
import CreateProfile from "../pages/proflie/CreateProfile";
import ListProfile from "../pages/proflie/ListProfile";
import ProfileDetail from "../pages/proflie/ProfileDetail";
import UpdateProfile from "../pages/proflie/UpdateProfile";
import CreateAccount from "../pages/user/CreateAccount";
import ListUser from "../pages/user/UserList";
import CreateVehicle from "../pages/proflie/CreateVehicle";
import UpdateVehicle from "../pages/vehicle/updateVehicle";
import ListContract from "../pages/contract/ListContract";

const AdminRoute = [
  { path: "/", component: Dashboard },
  { path: "/profiles", component: ListProfile },
  { path: "/profile/create", component: CreateProfile },
  { path: "/profile/:id/detail", component: ProfileDetail },
  { path: "/profile/:id/update", component: UpdateProfile },
  { path: "/profile/:profileId/vehicle", component: CreateVehicle },
  { path: "/users", component: ListUser },
  { path: "/users/create", component: CreateAccount },

  { path: "/vehicles", component: ListVehicle },
  { path: "/vehicle/:vehicleId/update", component: UpdateVehicle },

  { path: "/contracts", component: ListContract },
];
export default AdminRoute;
