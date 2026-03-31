import Home from "../pages/Home";
import ChangePassword from "../pages/profile/ChangePassword";
import CreateVehicle from "../pages/profile/CreateVehicleProfile";
import VehicleGridLayout from "../pages/profile/ManagerVehicle";
import ProfileDetail from "../pages/profile/ProfileDetail";
import ProfileUpdate from "../pages/profile/UpdateProfile";
import UpdateVehicle from "../pages/profile/UpdateVehicleProfile";


const AdminRoute = [
  { path: "/", component: Home },
  {path: "user/profile/:id",component:ProfileDetail},
  {path: "user/profile/:id/update",component:ProfileUpdate},
  {path: "user/change-password",component:ChangePassword},
  {path: "user/manager-vehicle/:id",component:VehicleGridLayout},
  {path: "user/vehicle/:id/create",component:CreateVehicle},
  {path: "user/vehicle/:id/update",component:UpdateVehicle}
];
export default AdminRoute;            
