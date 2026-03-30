import BranchList from "../pages/branch/BranchList";
import CreateBranch from "../pages/branch/CreateBranch";
import Dashboard from "../pages/Dashboard";
import ProfileList from "../pages/proflie/ProfileList";
import RoomList from "../pages/room/RoomList";

const AdminRoute = [
  { path: "/", component: Dashboard },
  { path: "/profiles/:page", component: ProfileList },
  //branch
  { path: "/branches/:page", component: BranchList },
  { path: "/branches/create", component: CreateBranch },
  //profile
  { path: "/rooms/:page", component: RoomList },

];
export default AdminRoute;