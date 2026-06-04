import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "antd";
import { CloseOutlined, HomeOutlined } from "@ant-design/icons";
import INTERNAL_ROUTES from "../../constants/internalRoutes.ts";
import {useNavigate} from "react-router-dom";

export type Tab = { key: string; label: string };

type Props = {
    initialTabs: Tab[];
    initialActiveKey: string;
    onTabClick?: (key: string) => void;
    style?: React.CSSProperties;
};

export type CommonTabBarRef = {
    openTab: (tab: Tab) => void;
};

const CommonTabBar = forwardRef<CommonTabBarRef, Props>(({ initialTabs, initialActiveKey, onTabClick, style }, ref) => {
    const [tabs, setTabs] = useState(initialTabs);
    const [activeKey, setActiveKey] = useState(initialActiveKey);
    const navigate = useNavigate();

    const updateTabs = (tab: Tab) => {
        setTabs((prevTabs) => {
            if (!prevTabs.find((t) => t.key === tab.key)) {
                return [...prevTabs, tab];
            }
            return prevTabs;
        });
        setActiveKey(tab.key);
        onTabClick?.(tab.key);
    };

    useImperativeHandle(ref, () => ({
        openTab: updateTabs,
    }));

    const handleTabClick = (key: string) => {
        setActiveKey(key);
        onTabClick?.(key);
    };

    const handleClose = (key: string) => {
        setTabs(tabs => tabs.filter(t => t.key !== key));
        if (key === "search") {
            navigate(INTERNAL_ROUTES.HOME_PAGE);
        } else if (activeKey === key) {
            setActiveKey("search");
            onTabClick?.("search")
        }
    };

    return (
        <div style={{ position: "relative", ...style }}>
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    marginLeft: 40,
                    marginRight: 40,
                }}
            >
                <button
                    type="button"
                    onClick={() => navigate(INTERNAL_ROUTES.HOME_PAGE)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        background: "#f5f5f5",
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        border: "1px solid #e0e0e0",
                        borderBottom: "none",
                        padding: "6px 12px",
                        cursor: "pointer",
                    }}
                >
                    <HomeOutlined style={{ fontSize: 18 }} />
                </button>

                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => handleTabClick(tab.key)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            background: activeKey === tab.key ? "#E7E7E7FF" : "#f5f5f5",
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            border: "1px solid #e0e0e0",
                            borderBottom: "none",
                            padding: "6px 12px",
                            cursor: "pointer",
                        }}
                    >
                        <span style={{ fontWeight: 500, fontSize: 14 }}>{tab.label}</span>
                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClose(tab.key);
                            }}
                        />
                    </button>
                ))}
            </div>

            <div
                style={{
                    borderBottom: "1px solid #e0e0e0",
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "100%",
                    width: "100%",
                    zIndex: 1,
                }}
            />
        </div>
    );
});

export default CommonTabBar;