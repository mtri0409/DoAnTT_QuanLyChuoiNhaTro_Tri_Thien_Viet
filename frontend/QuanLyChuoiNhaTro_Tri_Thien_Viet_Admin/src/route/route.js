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
import UpdateVehicle from "../pages/vehicle/UpdateVehicle";

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
import MaintenanceEdit from "../pages/maintenance/MaintenanceEdit";
import EditExpense from "../pages/expenses/EditExpense";
import ListNewsPost from "../pages/post/ListNewsPost";
import NewsPostForm from "../pages/post/NewsPostForm";
import NewsPostDetail from "../pages/post/NewsPostDetail";
import PostCategoryManager from "../pages/post/PostCategoryManager";
import CreatePostCategory from "../pages/post/CreatePostCategory";
import UpdatePostCategory from "../pages/post/UpdatePostCategory";
import NewsPostEditForm from "../pages/post/NewsPostEditForm";
import ListParkingLog from "../pages/park/ParkingLog";
import CameraDashboard from "../pages/park/CameraDashboard";
import GuestRegistrationManagementPage from "../pages/proflie/GuestRegistrationManagementPage";
import SchedulerList from "../pages/scheduler/SchedulerList";

// =============================================================
// PHÂN QUYỀN ROUTE (roles)
// - ADMIN   : Toàn quyền
// - STAFF   : Xem & thao tác hầu hết, trừ Dashboard, tài khoản, 
//             xóa danh mục quan trọng
// - TENANT  : Chỉ xem thông tin cá nhân, báo hỏng
// =============================================================
const AdminRoute = [
  // Dashboard - chỉ ADMIN & TENANT (STAFF không có dashboard)
  { path: "/", component: Dashboard, roles: ["ADMIN", "TENANT"] },
  
  // ─── QUẢN LÝ HỒ SƠ / NGƯỜI THUÊ ───────────────────────────
  { path: "/profiles", component: ListProfile, roles: ["ADMIN", "STAFF"] },
  { path: "/profile/create", component: CreateProfile, roles: ["ADMIN", "STAFF"] },
  { path: "/profile/:id/detail", component: ProfileDetail, roles: ["ADMIN", "STAFF", "TENANT"] },
  { path: "/profile/:id/update", component: UpdateProfile, roles: ["ADMIN", "STAFF"] },
  { path: "/profile/:profileId/vehicle", component: CreateVehicle, roles: ["ADMIN", "STAFF"] },
  { path: "/profile/restore", component: ListProfileDeleted, roles: ["ADMIN", "STAFF"] },
  { path: "/guests/management", component: GuestRegistrationManagementPage, roles: ["ADMIN", "STAFF"] },

  // ─── QUẢN LÝ TÀI KHOẢN (chỉ ADMIN) ────────────────────────
  { path: "/users", component: ListUser, roles: ["ADMIN"] },
  { path: "/users/create", component: CreateAccount, roles: ["ADMIN"] },
  { path: "/users/restore", component: ListUserDeleted, roles: ["ADMIN"] },

  // ─── QUẢN LÝ XE CỘ ─────────────────────────────────────────
  { path: "/vehicles", component: ListVehicle, roles: ["ADMIN", "STAFF"] },
  { path: "/vehicle/:vehicleId/update", component: UpdateVehicle, roles: ["ADMIN", "STAFF"] },
  { path: "/vehicle/restore", component: ListVehicleDeleted, roles: ["ADMIN", "STAFF"] },

  // ─── HỢP ĐỒNG ──────────────────────────────────────────────
  { path: "/contracts", component: ListContract, roles: ["ADMIN", "STAFF"] },
  { path: "/contracts/:id/update", component: UpdateContract, roles: ["ADMIN", "STAFF"] },
  { path: "/contracts/create", component: CreateContract, roles: ["ADMIN", "STAFF"] },
  { path: "/contracts/:id/detail", component: ContractDetail, roles: ["ADMIN", "STAFF"] },
  { path: "/contracts/:id/members", component: ContractMember, roles: ["ADMIN", "STAFF"] },
  { path: "/rooms/:roomId/fast-contract", component: FastContract, roles: ["ADMIN", "STAFF"] },

  // ─── GHI ĐIỆN NƯỚC / HÓA ĐƠN / CHI PHÍ ────────────────────
  { path: "/meter-reading", component: MeterReadingPage, roles: ["ADMIN", "STAFF"] },
  { path: "/invoice", component: ListInvoice, roles: ["ADMIN", "STAFF"] },
  { path: "/invoice/:invoiceId", component: InvoiceDetail, roles: ["ADMIN", "STAFF"] },
  { path: "/expenses", component: ListExpenses, roles: ["ADMIN", "STAFF"] },
  { path: "/expenses/create", component: CreateExpense, roles: ["ADMIN", "STAFF"] },
  { path: "/expenses/:expenseId/detail", component: DetailExpense, roles: ["ADMIN", "STAFF"] },
  { path: "/expenses/:expenseId/edit", component: EditExpense, roles: ["ADMIN", "STAFF"] },

  // ─── CHI NHÁNH ──────────────────────────────────────────────
  { path: "/branches/:page", component: BranchList, roles: ["ADMIN", "STAFF"] },
  { path: "/branches/create", component: CreateBranch, roles: ["ADMIN", "STAFF"] },
  { path: "/branches/:id/update", component: UpdateBranch, roles: ["ADMIN", "STAFF"] },
  
  // ─── PHÒNG TRỌ ──────────────────────────────────────────────
  { path: "/rooms/:page", component: RoomList, roles: ["ADMIN", "STAFF"] },
  { path: "/rooms/create", component: CreateRoom, roles: ["ADMIN", "STAFF"] },
  { path: "/rooms/:roomId/update", component: UpdateRoom, roles: ["ADMIN", "STAFF"] },
  { path: "/rooms/:roomId/detail", component: RoomDetail, roles: ["ADMIN", "STAFF"] },
  
  // ─── TIỆN ÍCH ───────────────────────────────────────────────
  { path: "/amenities/:page", component: AmenityList, roles: ["ADMIN", "STAFF"] },
  { path: "/amenities/create", component: CreateAmenity, roles: ["ADMIN", "STAFF"] },
  { path: "/amenities/:id/update", component: UpdateAmenity, roles: ["ADMIN", "STAFF"] },
  
  // ─── DỊCH VỤ ────────────────────────────────────────────────
  { path: "/services/:page", component: ServiceList, roles: ["ADMIN", "STAFF"] },
  { path: "/services/create", component: CreateService, roles: ["ADMIN", "STAFF"] },
  { path: "/services/:id/update", component: UpdateService, roles: ["ADMIN", "STAFF"] },

  // ─── BÀI ĐĂNG / TIN TỨC ────────────────────────────────────
  { path: "/posts", component: ListPost, roles: ["ADMIN", "STAFF"] },
  { path: "/posts/:postId/detail", component: PostDetail, roles: ["ADMIN", "STAFF"] },
  { path: "/news-posts", component: ListNewsPost, roles: ["ADMIN", "STAFF"] },
  { path: "/news-posts/create", component: NewsPostForm, roles: ["ADMIN", "STAFF"] },
  { path: "/news-posts/:postId/edit", component: NewsPostEditForm, roles: ["ADMIN", "STAFF"] },
  { path: "/news-posts/:postId", component: NewsPostDetail, roles: ["ADMIN", "STAFF"] },
  { path: "/post-categories", component: PostCategoryManager, roles: ["ADMIN", "STAFF"] },
  { path: "/post-categories/create", component: CreatePostCategory, roles: ["ADMIN", "STAFF"] },
  { path: "/post-categories/:categoryId/edit", component: UpdatePostCategory, roles: ["ADMIN", "STAFF"] },

  // ─── THÔNG BÁO ──────────────────────────────────────────────
  { path: "/notifications", component: ListNotification, roles: ["ADMIN", "STAFF", "TENANT"] },
  { path: "/notifications/create", component: CreateNotification, roles: ["ADMIN", "STAFF"] },

  // ─── BÁO HỎNG / SỬA CHỮA ────────────────────────────────────
  { path: "/maintenance", component: ListMaintenance, roles: ["ADMIN", "STAFF", "TENANT"] },
  { path: "/maintenance/:requestId/detail", component: MaintenanceDetail, roles: ["ADMIN", "STAFF", "TENANT"] },
  { path: "/maintenance/:requestId/edit", component: MaintenanceEdit, roles: ["ADMIN", "STAFF"] },

  // ─── AN NINH BÃI ĐỖ XE ──────────────────────────────────────
  { path: "/parks", component: ListParkingLog, roles: ["ADMIN", "STAFF"] },
  { path: "/camera", component: CameraDashboard, roles: ["ADMIN", "STAFF"] },

  // ─── CÀI ĐẶT HỆ THỐNG (chỉ ADMIN) ──────────────────────────
  { path: "/setting", component: SystemSettings, roles: ["ADMIN", "STAFF"] },

  // ─── SCHEDULER (chỉ ADMIN) ──────────────────────────────────
  { path: "/schedulers", component: SchedulerList, roles: ["ADMIN"] },
];

export default AdminRoute;
