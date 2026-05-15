import Home from "../page/home";
import NewsPage from "../page/News";
import PostDetail from "../page/PostDetail";
import RoomDetail from "../page/Roomdetail";
import SearchRoom from "../page/SearchRoom";
import SupportPage from "../page/Support";
import NewsDetailPage from "../page/NewsDetail";

const UserRoute = [
  { path: "/", component: Home },
  { path: "/tin-tuc", component: NewsPage },
  { path: "/tin-tuc/danh-muc/:slug", component: NewsPage },
  { path: "/tin-tuc/:slug", component: NewsDetailPage },
  { path: "/tim-phong", component: SearchRoom },
  { path: "/ho-tro", component: SupportPage },
  { path: "/phong/:roomId/chi-tiet", component: RoomDetail },
  { path: "/bai-dang/:postId", component: PostDetail },
];
export default UserRoute;
