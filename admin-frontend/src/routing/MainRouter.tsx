import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import PrivateRoute from "./PrivateRoute";
import INTERNAL_ROUTES from "../constants/internalRoutes";

import LazyLoadingSkeleton from "../components/lazy-loading-skeleton/LazyLoadingSkeleton";

import Login from "../pages/login/Login";
import NotFound from "../pages/not-found/NotFound";
import LoginSuccess from "../pages/login-success/LoginSuccess.tsx";
import LoginError from "../pages/login-error/LoginError.tsx";

const Home = lazy(() => import("../pages/home/Home"));
const Subscribers = lazy(() => import("../pages/subscriber-management/components/subscribers/Subscribers"));
const SubscribersGroup = lazy(() => import("../pages/subscriber-management/components/subscribers-group/SubscribersGroup.tsx"));
const SessionHistory = lazy(() => import("../pages/session-history/components/SessionHistory.tsx"));
const NasBng = lazy(() => import("../pages/bng-management/components/NasBng.tsx"));
const Users = lazy(() => import("../pages/user-management/components/users/Users"));
const ProductCatalog = lazy(() => import("../pages/product-catalog/components/ProductCatalog.tsx"));
const QosManagement = lazy(() => import("../pages/master-data/components/qos-management/QosManagement.tsx"));
const NotificationConfiguration = lazy(() => import("../pages/configuration-management/components/NotificationTemplate/NotificationTemplate.tsx"));
const BucketManagement = lazy(() => import("../pages/master-data/components/bucket-management/BucketManagement.tsx"));
const PendingApprovals = lazy(() => import("../pages/master-data/components/pending-approvals/PendingApprovals.tsx"));

const MessageLogs = lazy(() => import("../pages/other/components/message-logs/MessageLogs.tsx"));
const AuditLogs = lazy(() => import("../pages/other/components/audit-logs/AuditLogs.tsx"));
//const BulkTransactions = lazy(() => import("../pages/other/components/bulk-transactions/BulkTransactions.tsx"));
const ErrorLogs = lazy(() => import("../pages/other/components/error-logs/ErrorLogs.tsx"));
const Reports = lazy(() => import("../pages/reports/components/Reports.tsx"));


const RoleTableView = lazy(() => import("../pages/user-management/components/roles/RoleTableView.tsx"));
const PermissionList = lazy(() => import("../pages/user-management/components/permissions/PermissionList.tsx"));
const ConfigurationManagement = lazy(() => import("../pages/configuration-management/components/VendorConfiguration/ConfigurationManagement.tsx"));

const ROUTES = createBrowserRouter([
    {
        path: INTERNAL_ROUTES.LOGIN_PAGE,
        element: <Login />,
    },
    {
        path: INTERNAL_ROUTES.GET_TEMP_TOKEN_PAGE_SUCCESS,
        element: <LoginSuccess />,
    },
    {
        path: INTERNAL_ROUTES.GET_TEMP_TOKEN_PAGE_ERROR,
        element: <LoginError />,
    },
    {
        path: "",
        element: <PrivateRoute />,
        children: [
            {
                path: INTERNAL_ROUTES.HOME_PAGE,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <Home />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.SUBSCRIBERS,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <Subscribers />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.SUBSCRIBERS_GROUP,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <SubscribersGroup />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.SESSION_HISTORY,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <SessionHistory />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.NAS_BNG,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <NasBng />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.USERS,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <Users />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.PRODUCT_CATALOG,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <ProductCatalog />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.QOS_MANAGEMENT,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <QosManagement />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.NOTIFICATION_CONFIGURATION,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <NotificationConfiguration />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.BUCKET_MANAGEMENT,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <BucketManagement />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.PENDING_APPROVALS,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <PendingApprovals />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.MESSAGE_LOGS,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <MessageLogs />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.AUDIT_LOGS,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <AuditLogs />
                    </Suspense>
                )
            },
            // {
            //     path: INTERNAL_ROUTES.BULK_TRANSACTIONS,
            //     element: (
            //         <Suspense fallback={<LazyLoadingSkeleton />}>
            //             <BulkTransactions />
            //         </Suspense>
            //     )
            // },
            {
                path: INTERNAL_ROUTES.ERROR_LOGS,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <ErrorLogs />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.REPORTS_PAGE,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <Reports />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.ROLES,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <RoleTableView />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.PERMISSIONS,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <PermissionList />
                    </Suspense>
                )
            },
            {
                path: INTERNAL_ROUTES.VENDOR_SPECIFIC_CONFIGURATION,
                element: (
                    <Suspense fallback={<LazyLoadingSkeleton />}>
                        <ConfigurationManagement />
                    </Suspense>
                )
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);

const MainRoutes = () => {
    return (
        <RouterProvider router={ROUTES} />
    )
}

export default MainRoutes;