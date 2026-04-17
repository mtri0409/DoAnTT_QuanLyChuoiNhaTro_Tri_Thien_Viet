import Home from "../pages/Home";
import InvoiceDetail from "../pages/invoice/InvoiceDetail";
import ListInvoice from "../pages/invoice/ListInvoice";
import PaymentPage from "../pages/payment/PaymentPage";

import CreatePost from "../pages/post/CreatePost";
import EditPost from "../pages/post/EditPost";
import PostDetail from "../pages/post/PostDetail";
import RoommatePosts from "../pages/post/RoomatePosts";
import NotificationPage from "../pages/notification/NotificationPage";

import ChangePassword from "../pages/profile/ChangePassword";
import CreateVehicle from "../pages/profile/CreateVehicleProfile";
import VehicleGridLayout from "../pages/profile/ManagerVehicle";
import ProfileDetail from "../pages/profile/ProfileDetail";
import ProfileUpdate from "../pages/profile/UpdateProfile";
import UpdateVehicle from "../pages/profile/UpdateVehicleProfile";

const AdminRoute = [
  { path: "/", component: Home },
  { path: "user/profile/:id", component: ProfileDetail },
  { path: "user/profile/:id/update", component: ProfileUpdate },
  { path: "user/change-password", component: ChangePassword },
  { path: "user/manager-vehicle/:id", component: VehicleGridLayout },
  { path: "user/vehicle/:id/create", component: CreateVehicle },
  { path: "user/vehicle/:id/update", component: UpdateVehicle },
  { path: "user/bills", component: ListInvoice },
  { path: "user/bills/:invoiceId", component: InvoiceDetail },
  { path: "payment/:invoiceId", component: PaymentPage },

  { path: "user/posts", component: RoommatePosts },
  { path: "user/posts/create", component: CreatePost },
  { path: "user/posts/:postId/edit", component: EditPost },
  { path: "user/posts/:postId", component: PostDetail },

  { path: "user/profile/:id", component: ProfileDetail },
  { path: "user/profile/:id/update", component: ProfileUpdate },
  { path: "user/change-password", component: ChangePassword },
  { path: "user/manager-vehicle/:id", component: VehicleGridLayout },
  { path: "user/vehicle/:id/create", component: CreateVehicle },
  { path: "user/vehicle/:id/update", component: UpdateVehicle },
  { path: "user/notifications/", component: NotificationPage },
];
export default AdminRoute;
