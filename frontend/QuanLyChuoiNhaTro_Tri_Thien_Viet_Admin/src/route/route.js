import BranchList from "../pages/branch/BranchList";
import Dashboard from "../pages/Dashboard";
import ProfileList from "../pages/proflie/ProfileList";

const AdminRoute = [
  { path: "/", component: Dashboard },
  { path: "/profile/:page", component: ProfileList },
  { path: "/branch/:page", component: BranchList },

];
export default AdminRoute;