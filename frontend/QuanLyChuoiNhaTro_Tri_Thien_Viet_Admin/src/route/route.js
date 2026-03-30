import BranchList from "../pages/branch/BranchList";
import Dashboard from "../pages/Dashboard";
import ProfileList from "../pages/proflie/ProfileList";
import RoomList from "../pages/room/RoomList";

const AdminRoute = [
  { path: "/", component: Dashboard },
  { path: "/profiles/:page", component: ProfileList },
  { path: "/branches/:page", component: BranchList },
  { path: "/rooms/:page", component: RoomList },

];
export default AdminRoute;