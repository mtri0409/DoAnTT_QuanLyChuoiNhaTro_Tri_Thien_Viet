import Home from "../page/home";
import RoomDetail from "../page/Roomdetail";

const UserRoute = [
  { path: "/", component: Home },
  { path: "/rooms/:roomId", component: RoomDetail },
];
export default UserRoute;