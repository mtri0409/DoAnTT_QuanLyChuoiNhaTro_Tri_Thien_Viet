import BranchList from "../pages/branch/BranchList";
import CreateBranch from "../pages/branch/CreateBranch";
import UpdateBranch from "../pages/branch/UpdateBranch";
import Dashboard from "../pages/Dashboard";
import ProfileList from "../pages/proflie/ProfileList";
import CreateRoom from "../pages/room/CreateRoom";
import RoomList from "../pages/room/RoomList";
import UpdateRoom from "../pages/room/UpdateRoom";

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
];
export default AdminRoute;