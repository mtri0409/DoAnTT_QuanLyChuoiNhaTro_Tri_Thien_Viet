import AmenityList from "../pages/amenity/AmenityList";
import CreateAmenity from "../pages/amenity/CreateAmenity";
import UpdateAmenity from "../pages/amenity/UpdateAmenity";
import BranchList from "../pages/branch/BranchList";
import CreateBranch from "../pages/branch/CreateBranch";
import UpdateBranch from "../pages/branch/UpdateBranch";
import Dashboard from "../pages/Dashboard";
import ProfileList from "../pages/proflie/ProfileList";
import CreateRoom from "../pages/room/CreateRoom";
import RoomDetail from "../pages/room/RoomDetail";
import RoomList from "../pages/room/RoomList";
import UpdateRoom from "../pages/room/UpdateRoom";
import CreateService from "../pages/service/CreateService";
import ServiceList from "../pages/service/ServiceList";
import UpdateService from "../pages/service/UpdateService";

const AdminRoute = [
  { path: "/", component: Dashboard },
  { path: "/profiles/:page", component: ProfileList },
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
  { path: "/amenities/create", component: CreateAmenity  },
  { path: "/amenities/:id/update", component: UpdateAmenity },
  //service
  { path: "/services/:page", component: ServiceList },
  { path: "/services/create", component: CreateService  },
  { path: "/services/:id/update", component: UpdateService },
];
export default AdminRoute;