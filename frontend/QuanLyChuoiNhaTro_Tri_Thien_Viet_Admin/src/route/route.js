import AmenityList from "../pages/amenity/AmenityList";
import CreateAmenity from "../pages/amenity/CreateAmenity";
import UpdateAmenity from "../pages/amenity/UpdateAmenity";
import BranchList from "../pages/branch/BranchList";
import CreateBranch from "../pages/branch/CreateBranch";
import UpdateBranch from "../pages/branch/UpdateBranch";
import Dashboard from "../pages/Dashboard";

import ListVehicle from "../pages/vehicle/ListVehicle";
import CreateProfile from "../pages/proflie/CreateProfile";
import ListProfile from "../pages/proflie/ListProfile";
import ProfileDetail from "../pages/proflie/ProfileDetail";
import UpdateProfile from "../pages/proflie/UpdateProfile";
import CreateAccount from "../pages/user/CreateAccount";
import ListUser from "../pages/user/UserList";
import CreateVehicle from "../pages/proflie/CreateVehicle";
import UpdateVehicle from "../pages/vehicle/updateVehicle";

import ListContract from "../pages/contract/ListContract";
import CreateContract from "../pages/contract/CreateContract";
import UpdateContract from "../pages/contract/UpdateContract";

import ListUserDeleted from "../pages/user/ListUserDeleted";
import ListProfileDeleted from "../pages/proflie/ListProfileDeleted";
import ListVehicleDeleted from "../pages/vehicle/ListVehicleDeleted";
import ListNotification from "../pages/notification/ListNotification";

import CreateRoom from "../pages/room/CreateRoom";
import RoomDetail from "../pages/room/RoomDetail";
import RoomList from "../pages/room/RoomList";
import UpdateRoom from "../pages/room/UpdateRoom";
import CreateService from "../pages/service/CreateService";
import ServiceList from "../pages/service/ServiceList";
import UpdateService from "../pages/service/UpdateService";

import ContractDetail from "../pages/contract/ContractDetail";
import ContractMember from "../pages/contract/ContractMember";

import CreateNotification from "../pages/notification/CreateNotify";

import MeterReadingPage from "../pages/meter-reading/MeterReadingPage";
import ListInvoice from "../pages/invoice/ListInvoice";
import InvoiceDetail from "../pages/invoice/InvoiceDetail";
import ListPost from "../pages/post/ListPost";
import PostDetail from "../pages/post/PostDetail";
import FastContract from "../pages/contract/FastContract";
import ListMaintenance from "../pages/maintenance/ListMaintenance";
import MaintenanceDetail from "../pages/maintenance/MaintenanceDetail";
import ListExpenses from "../pages/expenses/ListExpenses";
import DetailExpense from "../pages/expenses/DetailExpense";
import CreateExpense from "../pages/expenses/CreateExpense";
import SystemSettings from "../pages/setting/SystemSettings";

const AdminRoute = [
  { path: "/", component: Dashboard },
  { path: "/profiles", component: ListProfile },
  { path: "/profile/create", component: CreateProfile },
  { path: "/profile/:id/detail", component: ProfileDetail },
  { path: "/profile/:id/update", component: UpdateProfile },
  { path: "/profile/:profileId/vehicle", component: CreateVehicle },
  { path: "/users", component: ListUser },
  { path: "/users/create", component: CreateAccount },

  { path: "/vehicles", component: ListVehicle },
  { path: "/vehicle/:vehicleId/update", component: UpdateVehicle },

  //contract
  { path: "/contracts", component: ListContract },
  { path: "/contracts/:id/update", component: UpdateContract },
  { path: "/contracts/create", component: CreateContract },
  { path: "/contracts/:id/detail", component: ContractDetail },
  { path: "/contracts/:id/members", component: ContractMember },
  { path: "/rooms/:roomId/fast-contract", component: FastContract },

  //meter-reading
  { path: "/meter-reading", component: MeterReadingPage },
  { path: "/invoice", component: ListInvoice },
  { path: "/invoice/:invoiceId", component: InvoiceDetail },
  { path: "/profile/:profileId/vehicle", component: CreateVehicle },
  { path: "/profile/restore", component: ListProfileDeleted },
  { path: "/users", component: ListUser },
  { path: "/users/create", component: CreateAccount },
  { path: "/users/restore", component: ListUserDeleted },

  { path: "/vehicles", component: ListVehicle },
  { path: "/vehicle/:vehicleId/update", component: UpdateVehicle },
  { path: "/vehicle/restore", component: ListVehicleDeleted },

  //branch
  { path: "/branches/:page", component: BranchList },
  { path: "/branches/create", component: CreateBranch },
  { path: "/branches/:id/update", component: UpdateBranch },
  //profile
  { path: "/rooms/:page", component: RoomList },
  { path: "/rooms/create", component: CreateRoom },
  { path: "/rooms/:roomId/update", component: UpdateRoom },
  { path: "/rooms/:roomId/detail", component: RoomDetail },
  //amenity
  { path: "/amenities/:page", component: AmenityList },
  { path: "/amenities/create", component: CreateAmenity },
  { path: "/amenities/:id/update", component: UpdateAmenity },
  //service
  { path: "/services/:page", component: ServiceList },
  { path: "/services/create", component: CreateService },
  { path: "/services/:id/update", component: UpdateService },

  //post
  { path: "/posts", component: ListPost },
  { path: "/posts/:postId/detail", component: PostDetail },

  { path: "/notifications", component: ListNotification },
  { path: "/notifications/create", component: CreateNotification },

  //maintenance
  { path: "/maintenance", component: ListMaintenance },
  { path: "/maintenance/:requestId/detail", component: MaintenanceDetail },
  //expense
  { path: "/expenses", component: ListExpenses },
  { path: "/expenses/create", component: CreateExpense },
  { path: "/expenses/:expenseId/detail", component: DetailExpense },

  //setting
  {path :"/setting",component: SystemSettings}
];
export default AdminRoute;
