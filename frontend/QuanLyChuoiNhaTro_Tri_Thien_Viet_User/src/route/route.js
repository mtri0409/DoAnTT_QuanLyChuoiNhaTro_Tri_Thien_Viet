import Home from "../page/home";
import NewsPage from "../page/News";
import RoomDetail from "../page/Roomdetail";
import SearchRoom from "../page/SearchRoom";
import SupportPage from "../page/Support";

const UserRoute = [
  { path: "/", component: Home },
  { path: "/news", component: NewsPage },
  { path: "/search-room", component: SearchRoom },
  { path: "/supports", component: SupportPage },
  { path: "/rooms/:roomId/detail", component: RoomDetail },
];
export default UserRoute;