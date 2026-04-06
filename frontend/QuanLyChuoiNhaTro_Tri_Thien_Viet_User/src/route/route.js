import Home from "../page/home";
import RoomDetail from "../page/Roomdetail";

const UserRoute = [
  { path: "/", component: Home },
  { path: "/rooms/:roomId/detail", component: RoomDetail },
];
export default UserRoute;