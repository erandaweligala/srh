import {FC, useEffect, useState} from "react";
import ACTION_PERMISSION from "../../../../constants/actionPermissions.ts";
import CommonBreadcrumb from "../../../../components/common-breadcrumb/CommonBreadcrumb.tsx";
import ActionPermission from "../../../../components/access-control/action-permission/ActionPermission.tsx";
import CommonSearchPanel from "../../../../components/common-search-panel/CommonSearchPanel.tsx";
import {InputsProps} from "../../../../components/common-search-panel/models/InputsProps.model.ts";
import DynamicTable from "../../../../components/dynamic-table/DynamicTable.tsx";
import {formatValue} from "../../../../helpers/stringValidators.ts";
import CommonTabBar from "../../../../components/common-tab-bar/CommonTabBar.tsx";
import CommonSquareButtonPreDefined
    from "../../../../components/common-square-button-pre-defined/CommonSquareButtonPreDefined.tsx";
import {ButtonTypeEnum} from "../../../../components/common-square-button-pre-defined/models/buttonTypesEnum.model.ts";
import BaseResponse from "../../../../model/baseResponse.ts";
import showNotification from "../../../../services/notification.service.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {getPendingApprovals} from "../../../product-catalog/services/product.catalog.service.ts";
import {PendingApprovalRequestModel, PendingApprovalResponseModel} from "../../../product-catalog/models/pendingApproval.model.ts";
import INTERNAL_ROUTES from "../../../../constants/internalRoutes";


type UsersProps = object;

const PendingApprovals: FC<UsersProps> = () => {
    const location = useLocation();

    const navigate = useNavigate();

    const [paginationDetails, setPaginationDetails] = useState<{
        currentPage: number;
        currentItemPerPage: number;
    }>({currentPage: 1, currentItemPerPage: 10});

    const [formValues, setFormValues] = useState<{
        planId: string | null;
        planName: string | null;
    }>({ planId: null, planName: null });

    const [total, setTotal] = useState<number>(0);

    const [searchForm, setSearchForm] = useState<Record<string, string>>({});

    const [pendingApprovals, setPendingApprovals] = useState<BaseResponse<PendingApprovalResponseModel> | null>(null);


    const searchPanelInputs: InputsProps[] = [
        {
            type: "INPUT",
            valueName: "planName",
            label: "Plan Name",
            required: false,
            mainInput: true,
            placeholder: "Enter Plan Name"
        },
        {
            type: "INPUT",
            valueName: "planId",
            label: "Plan ID",
            required: false,
            mainInput: true,
            placeholder: "Enter Plan ID"
        }
    ];

    const approvalsColumn = [
        { title: 'Plan ID', dataIndex: 'planId', key: 'planId', render: formatValue },
        { title: 'Plan Name', dataIndex: 'planName', key: 'planName', render: formatValue },
        { title: 'Approval Status', dataIndex: 'approvalStatus', key: 'approvalStatus', render: formatValue },
        { title: 'Current Approval Level', dataIndex: 'currentApprovalLevel', key: 'currentApprovalLevel', render: formatValue },
        { title: 'Plan Status', dataIndex: 'planStatus', key: 'planStatus', render: formatValue },
        {
            title: "Action",
            key: "action",
            align: "center",
            width: 100,
            render: (_: any, record: any) => (
                <div>
                    <CommonSquareButtonPreDefined
                        type={ButtonTypeEnum.VIEW}
                        onClick={() => {
                            navigate(INTERNAL_ROUTES.PRODUCT_CATALOG, {
                                state: { openRow: record }
                            });
                        }}
                    />
                </div>
            )
        }
    ];

    // Read planId from URL query params on mount / URL change
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const planIdParam = params.get('planId');
        if (planIdParam) {
            setFormValues(prev => ({ ...prev, planId: planIdParam }));
            setPaginationDetails(prev => ({ ...prev, currentPage: 1 }));
        }
    }, [location.search]);

    // Re-fetch whenever search filters change (fires on mount too)
    useEffect(() => {
        searchPendingApprovals();
    }, [formValues]);

    const searchPendingApprovals = async () => {
        try {
            const queryParams: PendingApprovalRequestModel = {
                planId: formValues.planId || undefined,
                planName: formValues.planName || undefined,
            };

            const response = await getPendingApprovals(queryParams);

            if (response) {
                setPendingApprovals(response);
                setTotal(response.data?.pageDetails?.totalRecords ?? response.data?.approvals?.length ?? 0);
            }
        } catch (err: any) {
            console.error("searchPendingApprovals error:", err);
            const errorMessage = err?.response?.data?.message || "Failed to retrieve pending approvals. Please try again.";
            showNotification("ERROR", errorMessage);
        }
    };

    const onSearchFormSubmit = (values?: {
        planId: string | null;
        planName: string | null;
    }) => {
        setFormValues(values ?? { planId: null, planName: null });
        setPaginationDetails((current) => ({ ...current, currentPage: 1 }));
    };

    const onTableChange = (page: number, pageSize: number) => {
        setPaginationDetails({
            currentPage: page,
            currentItemPerPage: pageSize
        });
    };

    return (
        <ActionPermission action={ACTION_PERMISSION.PENDING_APPROVALS_COMPONENT}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Product Catalog</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Pending Approvals</CommonBreadcrumb.Section>
                </CommonBreadcrumb>

                <CommonTabBar
                    initialTabs={[{ key: "search", label: "Pending Approvals" }]}
                    initialActiveKey="search"
                />

                <div className="common-page-margin" style={{ marginTop: "0px" }}>
                    <CommonSearchPanel
                        inputs={searchPanelInputs}
                        title="Search Conditions"
                        isExpandBtnVisible={false}
                        onSubmit={onSearchFormSubmit}
                        onClear={() => onSearchFormSubmit({ planId: null, planName: null })}
                        initialValues={searchForm}
                    />


                    <div>
                        <DynamicTable
                            columns={approvalsColumn}
                            data={pendingApprovals?.data?.approvals || []}
                            pagination={{
                                current: paginationDetails.currentPage,
                                pageSize: paginationDetails.currentItemPerPage,
                                total: total,
                                onChange: onTableChange
                            }}
                            scroll={{ x: 0 }}
                        />
                    </div>
                </div>
            </>
        </ActionPermission>
    )
}

export default PendingApprovals;