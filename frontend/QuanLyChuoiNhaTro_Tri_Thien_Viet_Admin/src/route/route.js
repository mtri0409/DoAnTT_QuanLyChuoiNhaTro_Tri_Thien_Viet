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
import ListUserDeleted from "../pages/user/ListUserDeleted";
import ListProfileDeleted from "../pages/proflie/ListProfileDeleted";
import ListVehicleDeleted from "../pages/vehicle/ListVehicleDeleted";

const AdminRoute = [
  { path: "/", component: Dashboard },
  { path: "/profiles", component: ListProfile },
  { path: "/profile/create", component: CreateProfile },
  { path: "/profile/:id/detail", component: ProfileDetail },
  { path: "/profile/:id/update", component: UpdateProfile },
  {path:"/profile/:profileId/vehicle",component:CreateVehicle},
  { path: "/profile/restore", component: ListProfileDeleted },
  { path: "/users", component: ListUser },
  { path: "/users/create", component: CreateAccount },
  { path: "/users/restore", component: ListUserDeleted },

  { path: "/vehicles", component: ListVehicle },
  {path:"/vehicle/:vehicleId/update",component:UpdateVehicle},
  { path: "/vehicle/restore", component: ListVehicleDeleted },

];
export default AdminRoute;