import Dashboard from "../pages/Dashboard";
import ProfileList from "../pages/proflie/ProfileList";

const AdminRoute = [
  { path: "/", component: Dashboard },
  { path: "/profile/:page", component: ProfileList },

];
export default AdminRoute;