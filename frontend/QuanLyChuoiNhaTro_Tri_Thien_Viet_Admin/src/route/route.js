import AmenityList from "../pages/amenity/AmenityList";
import CreateAmenity from "../pages/amenity/CreateAmenity";
import UpdateAmenity from "../pages/amenity/UpdateAmenity";
import BranchList from "../pages/branch/BranchList";
import CreateBranch from "../pages/branch/CreateBranch";
import UpdateBranch from "../pages/branch/UpdateBranch";
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
import CreateContract from "../pages/contract/CreateContract";

import CreateRoom from "../pages/room/CreateRoom";
import RoomDetail from "../pages/room/RoomDetail";
import RoomList from "../pages/room/RoomList";
import UpdateRoom from "../pages/room/UpdateRoom";
import CreateService from "../pages/service/CreateService";
import ServiceList from "../pages/service/ServiceList";
import UpdateService from "../pages/service/UpdateService";
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

  //branch
  { path: "/branches/:page", component: BranchList },
  { path: "/branches/create", component: CreateBranch },
  { path: "/branches/:id/update", component: UpdateBranch },
  //profile
  { path: "/rooms/:page", component: RoomList },
  { path: "/rooms/create", component: CreateRoom },
  { path: "/rooms/:roomId/update", component: UpdateRoom },
  { path: "/rooms/:roomId/detail", component: RoomDetail },
  //amenity
  { path: "/amenities/:page", component: AmenityList },
  { path: "/amenities/create", component: CreateAmenity },
  { path: "/amenities/:id/update", component: UpdateAmenity },
  //service
  { path: "/services/:page", component: ServiceList },
  { path: "/services/create", component: CreateService },
  { path: "/services/:id/update", component: UpdateService },

  { path: "/contracts/create", component: CreateContract },
];
export default AdminRoute;
