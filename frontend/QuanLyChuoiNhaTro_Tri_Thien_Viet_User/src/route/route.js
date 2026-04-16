import Home from "../page/home";
import NewsPage from "../page/News";
import RoomDetail from "../page/Roomdetail";
import SearchRoom from "../page/SearchRoom";
import SupportPage from "../page/Support";

const UserRoute = [
  { path: "/", component: Home },
  { path: "/tin-tuc", component: NewsPage },
  { path: "/tim-phong", component: SearchRoom },
  { path: "/ho-tro", component: SupportPage },
  { path: "/phong/:roomId/chi-tiet", component: RoomDetail },
];
export default UserRoute;