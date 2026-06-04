import {FC, useCallback, useEffect, useRef, useState} from "react";
import {Button, Card, Col, Input, Layout, Modal, Row, Space, Table, Typography} from "antd";
import CommonBreadcrumb from "../../components/common-breadcrumb/CommonBreadcrumb";
import "./Home.css";
import INTERNAL_ROUTES from "../../constants/internalRoutes.ts";
import {useNavigate} from "react-router-dom";

import subscriberIcon from '../../assets/images/subscriber.png';
import webinarIcon from '../../assets/images/webinar.png';
import skillsIcon from '../../assets/images/skills.png';
import listIcon from '../../assets/images/list.png';
import logIcon from '../../assets/images/log-2.png';
import reportIcon from '../../assets/images/report.png'
import showNotification from "../../services/notification.service.tsx";
import {getAccountingSummary, getBNGListAll, getUserStatusSummary, pingBng} from "./services/Home.services.ts";
import {AccountingSummaryModel, UserStatusSummaryModel} from "./models/accountingSummary.model.ts";
import { BngItem } from "./models/Home.model.ts";
import ActionPermission from "../../components/access-control/action-permission/ActionPermission.tsx";
import ACTION_PERMISSION from "../../constants/actionPermissions.ts";

type HomeProps = object

const Home: FC<HomeProps> = () => {

    const {Content} = Layout;

    const { Text } = Typography;

    const navigate = useNavigate();

    const [isTestBngModalVisible, setIsTestBngModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [accountingData, setAccountingData] = useState<AccountingSummaryModel | null>(null);

    const [bngList, setBngList] = useState<BngItem[]>([]);
    const [bngLoading, setBngLoading] = useState(false);

    const [pingLoadingIds, setPingLoadingIds] = useState<Record<string, boolean>>({});
    const [pingResults, setPingResults] = useState<Record<string, string>>({});

    const timeoutRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);
    const [userStatusSummary, setUserStatusSummary] = useState<UserStatusSummaryModel|null>(null)

    const handleSearch = useCallback(async () => {
        setBngLoading(true);
        try {
            const res = await getBNGListAll();
            if (!isMountedRef.current) return;
            setBngList(res?.data ?? []);
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to fetch BNGs";
            showNotification("ERROR", msg);
        } finally {
            setBngLoading(false);
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handlePing = async (record: BngItem) => {
        const id = record.bngId || record.bngName;
        if (!record.bngIp) {
            showNotification("ERROR", "BNG IP not available for this row.");
            return;
        }

        setPingLoadingIds(prev => ({ ...prev, [id]: true }));
        try {
            const res = await pingBng(record.bngId as string);

            if (res?.success === false) {
                const errorMsg = res?.message ?? "Network unavailable";
                showNotification("ERROR", errorMsg);
                setPingResults(prev => ({ ...prev, [id]: errorMsg }));
            } else {
                const successMsg = res?.message ?? "Broadband Connection is now active and stable";
                showNotification("SUCCESS", successMsg);
                setPingResults(prev => ({ ...prev, [id]: successMsg }));
            }
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || "Network unavailable";
            showNotification("ERROR", errorMsg);
            setPingResults(prev => ({ ...prev, [id]: errorMsg }));
        } finally {
            setPingLoadingIds(prev => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
        }
    }

    useEffect(() => {
        fetchUserStatusSummary();
        // When the Test BNG modal opens, fetch the first page of BNGs automatically
        if (isTestBngModalVisible) {
            setSearchTerm('');
            handleSearch();
        }
    }, [isTestBngModalVisible, handleSearch]);

    const fetchAccountingSummary = useCallback(async (): Promise<boolean> => {
        try {
            const response = await getAccountingSummary();
            if (!isMountedRef.current) return false;
            setAccountingData(response.data);
            return true;
        } catch (err: any) {
            console.log("ERROR in fetchAccountingSummary:", err);
            const errorMessage = err?.response?.data?.message || "Failed to fetch accounting summary. Please try again.";
            showNotification("ERROR", errorMessage);
            return false;
        }
    }, []);

    const fetchUserStatusSummary = async () => {
        const response = await getUserStatusSummary();
      if(response) {
            setUserStatusSummary(response.data)
        }
    }

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled || !isMountedRef.current) return;
            const ok = await fetchAccountingSummary();
            if (cancelled || !isMountedRef.current) return;
            if (ok) {
                // schedule next poll only on success
                timeoutRef.current = window.setTimeout(run, 2000);
            } else {
                // do not reschedule on error (stops polling)
                timeoutRef.current = null;
            }
        };

        run();

        return () => {
            cancelled = true;
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [fetchAccountingSummary]);


    const coaRequestCount = accountingData?.coaRequestCount ?? 0;
    const authSuccessCount = accountingData?.authenticationSuccessCount ?? 0;
    const coaFailureCount = accountingData?.coaFailureCount ?? 0;
    const authFailureCount = accountingData?.authenticationFailureCount ?? 0;
    const activeSubscriberCount = userStatusSummary?.active ?? 0;
    const inactiveSubscriberCount = userStatusSummary?.inactive ?? 0;

    return (
        <ActionPermission action={ACTION_PERMISSION.BNG_HOME_PAGE}>
            <>
                <CommonBreadcrumb>
                    <CommonBreadcrumb.Section>Admin Console</CommonBreadcrumb.Section>
                    <CommonBreadcrumb.Section>Home</CommonBreadcrumb.Section>
                </CommonBreadcrumb>
                <Content className="common-container">
                    <Row gutter={16} className="common-page-margin" style={{ marginBottom: '16px' }}>
                        <Col span={24}>
                            <div
                                className="home-first-panel"
                            >
                                <ActionPermission action={ACTION_PERMISSION.SUBSCRIBER_SUMMARY}>
                                    <Space align="center" size="middle">
                                        <Card className="home-first-panel-card" bordered={false}>
                                            <Text strong>Active Subscriber Count</Text>
                                            <div className="home-count-box">
                                                <Text style={{ fontWeight: 600 }}>{activeSubscriberCount}</Text>
                                            </div>
                                        </Card>
                                        <Card className="home-first-panel-card" bordered={false}>
                                            <Text strong>Inactive Subscriber Count</Text>
                                            <div className="home-count-box">
                                                <Text style={{ fontWeight: 600 }}>{inactiveSubscriberCount}</Text>
                                            </div>
                                        </Card>
                                    </Space>
                                </ActionPermission>
                                <ActionPermission action={ACTION_PERMISSION.BNG_HOME_PAGE}>
                                    <Button type="primary" size="small" onClick={() => setIsTestBngModalVisible(true)}>
                                        Test BNG
                                    </Button>
                                </ActionPermission>
                            </div>
                        </Col>
                    </Row>

                    <Row gutter={16} className="common-page-margin" style={{ marginBottom: '16px' }}>
                        <Col flex={1}>
                            <div className="home-as-count">
                                <div className="home-as-count-bar" />
                                <div className="home-as-count-right">
                                    <div className="home-as-count-top">
                                        <span>
                                            Count : <span className="home-as-count-number">{authSuccessCount}</span>
                                        </span>
                                        <span className="home-as-count-check">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="#fff"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </span>
                                    </div>
                                    <div className="home-as-count-label">
                                        <Text strong>Authentication Success Count</Text>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col flex={1}>
                            <div className="home-af-count">
                                <div className="home-af-count-bar" />
                                <div className="home-as-count-right">
                                    <div className="home-as-count-top">
                                        <span>
                                            Count : <span className="home-as-count-number">{authFailureCount}</span>
                                        </span>
                                        <span className="home-af-count-check">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                                                <rect x="10" y="3" width="4" height="12" rx="1.5" fill="#fff" />
                                                <circle cx="12" cy="19" r="1.8" fill="#fff" />
                                            </svg>
                                        </span>
                                    </div>
                                    <div className="home-as-count-label">
                                        <Text strong>Authentication Failure Count</Text>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col flex={1}>
                            <div className="home-cr-count">
                                <div className="home-cr-count-bar" />
                                <div className="home-as-count-right">
                                    <div className="home-as-count-top">
                                        <span>
                                            Count : <span className="home-as-count-number">{coaRequestCount}</span>
                                        </span>
                                        <span className="home-cr-count-check">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                                                <rect x="10.5" y="3.5" width="3" height="4" rx="1.2" fill="#fff" />
                                                <rect x="10.5" y="9" width="3" height="10" rx="1.5" fill="#fff" />
                                            </svg>

                                        </span>

                                    </div>
                                    <div className="home-as-count-label">
                                        <Text strong>CoA Request Count</Text>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col flex={1}>
                            <div className="home-af-count">
                                <div className="home-af-count-bar" />
                                <div className="home-as-count-right">
                                    <div className="home-as-count-top">
                                        <span>
                                            Count : <span className="home-as-count-number">{coaFailureCount}</span>
                                        </span>
                                        <span className="home-af-count-check">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                                                <rect x="10" y="3" width="4" height="12" rx="1.5" fill="#fff" />
                                                <circle cx="12" cy="19" r="1.8" fill="#fff" />
                                            </svg>
                                        </span>
                                    </div>
                                    <div className="home-as-count-label">
                                        <Text strong>CoA Failure Count</Text>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row gutter={16} className="common-page-margin">
                        <Col className="pb-2">
                            <Card hoverable className="home-card">
                                <div className="home-card-icon">
                                    <img src={subscriberIcon} alt="Subscriber Management" style={{ width: 40, height: 40 }} />
                                </div>
                                <div className="home-card-text">
                                    <Text style={{ fontSize: 12, fontWeight: 600 }}>Subscriber Management</Text>
                                    <div>
                                        <Text style={{ fontSize: 12, fontWeight: 600 }}>Individual</Text>
                                    </div>
                                </div>
                                <Button
                                    size="small"
                                    type="default"
                                    className="home-card-button"
                                    onClick={() => navigate(INTERNAL_ROUTES.SUBSCRIBERS)}
                                >
                                    Continue
                                </Button>
                            </Card>
                        </Col>
                        <Col className="pb-2">
                            <Card hoverable className="home-card">
                                <div className="home-card-icon">
                                    <img src={webinarIcon} alt="Session Details" style={{ width: 35, height: 35 }} />
                                </div>
                                <div className="home-card-text">
                                    <Text style={{ fontSize: 12, fontWeight: 600 }}>Session Details</Text>
                                </div>
                                <Button
                                    size="small"
                                    type="default"
                                    className="home-card-button"
                                    onClick={() => navigate(INTERNAL_ROUTES.SESSION_HISTORY)}
                                >
                                    Continue
                                </Button>
                            </Card>
                        </Col>
                        <Col className="pb-2">
                            <Card hoverable className="home-card">
                                <div className="home-card-icon">
                                    <img src={skillsIcon} alt="User Management" style={{ width: 31, height: 31 }} />
                                </div>
                                <div className="home-card-text">
                                    <Text style={{ fontSize: 12, fontWeight: 600 }}>User Management</Text>
                                </div>
                                <Button
                                    size="small"
                                    type="default"
                                    className="home-card-button"
                                    onClick={() => navigate(INTERNAL_ROUTES.USERS)}
                                >
                                    Continue
                                </Button>
                            </Card>
                        </Col>
                        <Col className="pb-2">
                            <Card hoverable className="home-card">
                                <div className="home-card-icon">
                                    <img src={listIcon} alt="Product Catalog" style={{ width: 28, height: 28 }} />
                                </div>
                                <div className="home-card-text">
                                    <Text style={{ fontSize: 12, fontWeight: 600 }}>Product Catalog</Text>
                                </div>
                                <Button
                                    size="small"
                                    type="default"
                                    className="home-card-button"
                                    onClick={() => navigate(INTERNAL_ROUTES.PRODUCT_CATALOG)}
                                >
                                    Continue
                                </Button>
                            </Card>
                        </Col>
                        <Col className="pb-2">
                            <Card hoverable className="home-card">
                                <div className="home-card-icon">
                                    <img src={logIcon} alt="Logs" style={{ width: 28, height: 28 }} />
                                </div>
                                <div className="home-card-text">
                                    <Text style={{ fontSize: 12, fontWeight: 600 }}>Logs</Text>
                                </div>
                                <Button
                                    size="small"
                                    type="default"
                                    className="home-card-button"
                                    onClick={() => navigate(INTERNAL_ROUTES.MESSAGE_LOGS)}
                                >
                                    Continue
                                </Button>
                            </Card>
                        </Col>
                        <Col className="pb-2">
                            <Card hoverable className="home-card">
                                <div className="home-card-icon">
                                    <img src={reportIcon} alt="Reports" style={{ width: 28, height: 28 }} />
                                </div>
                                <div className="home-card-text">
                                    <Text style={{ fontSize: 12, fontWeight: 600 }}>Reports</Text>
                                </div>
                                <Button
                                    size="small"
                                    type="default"
                                    className="home-card-button"
                                    onClick={() => navigate(INTERNAL_ROUTES.REPORTS_PAGE)}
                                >
                                    Continue
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </Content>

                <Modal
                    className="modal-with-border"
                    title="Test BNG"
                    open={isTestBngModalVisible}
                    onCancel={() => {
                        setIsTestBngModalVisible(false);
                        setSearchTerm('');
                    }}
                    footer={null}
                    width={509}
                >
                    <div style={{ marginBottom: '16px', padding: '16px', border: '1px solid #00000015', borderRadius: '4px' }}>
                        <Space style={{ width: '100%' }}>
                            <Text style={{ fontWeight: 500 }}>BNG</Text>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <Input
                                    placeholder="Enter BNG"
                                    style={{ width: '298px' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    maxLength={36}
                                />
                                <Text style={{ fontSize: '12px', color: searchTerm.length > 30 ? '#faad14' : '#666' }}>
                                    {searchTerm.length}/36 characters
                                </Text>
                            </div>
                            <Button
                                type="primary"
                                loading={bngLoading}
                                onClick={handleSearch}
                            >
                                Search
                            </Button>
                        </Space>
                    </div>

                    <div className="bordered-container">
                        <Table
                            className="common-basic-table custom-bordered-table"
                            pagination={false}
                            showHeader={false}
                            dataSource={bngList.filter(item => (item.bngName || '').toLowerCase().includes(searchTerm.toLowerCase()))}
                            columns={[
                                {
                                    title: 'Label',
                                    dataIndex: 'bngName',
                                    key: 'bngName',
                                    width: '315px',
                                    onCell: () => ({
                                        style: { backgroundColor: '#FAFAFA', fontWeight: 500 }
                                    }),
                                },
                                {
                                    title: 'Action',
                                    dataIndex: 'action',
                                    key: 'action',
                                    align: 'center',
                                    render: (_: any, record: BngItem) => {
                                        const id = record.bngId || record.bngName;
                                        return (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <ActionPermission action={ACTION_PERMISSION.CHECK_HOME_PAGE}>
                                                    <Button size="small" loading={!!pingLoadingIds[id]} onClick={() => handlePing(record)}>
                                                        Check
                                                    </Button>
                                                </ActionPermission>

                                                {pingResults[id] && (
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {pingResults[id]}
                                                    </Text>
                                                )}
                                            </div>
                                        );
                                    }
                                },
                            ]}
                            rowKey={(record: BngItem) => record.bngId || record.bngName}
                            scroll={{ y: 200 }}
                        />
                    </div>
                </Modal>
            </>
        </ActionPermission>
    );
};

export default Home;
