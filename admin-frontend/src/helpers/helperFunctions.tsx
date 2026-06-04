import OperationActionsEnum from "../model/operationsActionsEnum.model.ts";
import {TablePaginationConfig} from "antd";
import CommonStatusTagPredefined from "../components/common-status-tag/CommonStatusTagPredefined.tsx";
import { StatusTagEnum } from "../components/common-status-tag/models/statusTagEnum.model.ts";
import dayjs, { Dayjs } from 'dayjs';
import { ServiceInfoModel } from "../pages/subscriber-management/models/subscriber/service.info.model.ts";
import { ServiceDetailsResponseModel } from "../pages/subscriber-management/models/subscriber/service.details.model.ts";

type DebounceFunction = <T extends (...args: any[]) => any>(func: T, delay: number) => (...args: Parameters<T>) => void;

export const debounce: DebounceFunction = <T extends (...args: any[]) => any>(func: T, delay: number) => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
};

export type DrawerState = {
    isDrawerOpen: boolean;
    operation: OperationActionsEnum;
    drawerData: any;
    drawerTitle?: string;
};

export const updateDrawerState = (
    setState: React.Dispatch<React.SetStateAction<DrawerState>>,
    newState: Partial<DrawerState>
) => {
    setState(prevState => ({
        ...prevState,
        ...newState
    }));
};

export const updatePaginationDetails = <T extends { currentPage: number; currentItemPerPage: number; totalCount?: number }>(
    pagination: TablePaginationConfig,
    currentPagination: T
): T => {
    if (pagination.current !== currentPagination.currentPage && pagination.pageSize === currentPagination.currentItemPerPage) {
        return { ...currentPagination, currentPage: pagination.current! } as T;
    } else if (pagination.pageSize !== currentPagination.currentItemPerPage) {
        return { ...currentPagination, currentItemPerPage: pagination.pageSize!, currentPage: 1 } as T;
    } else {
        return currentPagination;
    }
};

export const formatDateAndTime = (datetimeStr: string | null | undefined): { formattedDate: string, formattedTime: string } => {
    if (!datetimeStr) {
        return { formattedDate: '-', formattedTime: '-' };
    }

    const date = new Date(datetimeStr.replace(' ', 'T'));

    if (isNaN(date.getTime())) {
        return { formattedDate: '-', formattedTime: '-' };
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]}, ${date.getFullYear()}`;

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    return { formattedDate, formattedTime };
};

export const renderTableDateAndTime = (datetimeStr: string | null | undefined): string => {
    const { formattedDate, formattedTime } = formatDateAndTime(datetimeStr);

    if (formattedDate !== '-' && formattedTime !== '-') {
        return formattedDate + ' ' + formattedTime;
    } else if (formattedDate !== '-' && formattedTime === '-') {
        return formattedDate;
    } else {
        return '-';
    }
}

export const renderStatusTag = (item: string, className?: unknown) => {
    const safeClassName = typeof className === "string" ? className : undefined;
    return (
        <CommonStatusTagPredefined
            type={item ? item.toLowerCase() : StatusTagEnum.NO_STATUS}
            className={safeClassName}
        >
        </CommonStatusTagPredefined>
    )
}

export const toSnakeCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;

    if (obj instanceof Date) {
        return obj.toISOString();
    }

    if (obj?.$d) {
        return obj.toISOString();
    }
    if (Array.isArray(obj)) {
        return obj.map(toSnakeCase);
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        result[snakeKey] = toSnakeCase(value);
    }
    return result;
};

export const toCamelCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(toCamelCase);
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = toCamelCase(value);
    }
    return result;
};

export const formatDateTime = (date?: Date | string | Dayjs | null): string | undefined => {
    if (date === undefined || date === null) return undefined;

    // Always parse with dayjs. Do not branch on `.format` — some non-Dayjs values
    // expose `format` but not `isValid`, which caused "t.isValid is not a function".
    const base = dayjs(date as any);

    if (!base.isValid()) return undefined;

    return base.format('YYYY-MM-DD HH:mm:ss');
};

export const formatBytes = (input: number | string | null | undefined, decimals = 2): string => {
    if (input === null || input === undefined || input === '') return 'N/A';
    const bytes = Number(input);
    if (Number.isNaN(bytes)) return 'N/A';
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let value = Math.abs(bytes);
    let unitIndex = 0;

    while (value >= k && unitIndex < sizes.length - 1) {
        value /= k;
        unitIndex++;
    }

    return `${bytes < 0 ? '-' : ''}${value.toFixed(decimals)} ${sizes[unitIndex]}`;
};

export const toBytes = (value: any, unit?: string): number | undefined => {
    if (value == null || value === '') return undefined;
    const num = Number(String(value).replace(/,/g, '').trim());
    if (!Number.isFinite(num)) return undefined;

    const factorMap: Record<string, number> = {
        B: 1,
        KB: 1024,
        MB: 1024 ** 2,
        GB: 1024 ** 3,
        TB: 1024 ** 4
    };

    const key = (unit ?? 'B').toString().toUpperCase();
    const factor = factorMap[key] ?? 1;
    return Math.round(num * factor);
};


export const bytesToValueUnit = (bytes?: number, decimals = 2): { value?: string; unit: string } => {
    if (bytes == null || Number.isNaN(Number(bytes))) return { value: undefined, unit: 'B' };

    const signed = bytes < 0 ? -1 : 1;
    const absBytes = Math.abs(bytes);
    if (absBytes === 0) return { value: '0', unit: 'B' };

    const units = [
        { key: 'TB', factor: 1024 ** 4 },
        { key: 'GB', factor: 1024 ** 3 },
        { key: 'MB', factor: 1024 ** 2 },
        { key: 'KB', factor: 1024 },
        { key: 'B', factor: 1 }
    ];

    // Helper to safely trim trailing zeros without regex
    const trimTrailingZeros = (num: number, decimals: number): string => {
        let str = num.toFixed(decimals);
        if (!str.includes('.')) return str;

        // Remove trailing zeros
        while (str.endsWith('0')) str = str.slice(0, -1);
        // Remove trailing dot if present
        if (str.endsWith('.')) str = str.slice(0, -1);
        return str;
    };

    for (const u of units) {
        const val = absBytes / u.factor;
        if (val >= 1 && val <= 99999) {
            const rounded = Math.round(val * 10 ** decimals) / 10 ** decimals;
            const formatted = trimTrailingZeros(rounded, decimals);
            return { value: (signed < 0 ? '-' : '') + formatted, unit: u.key };
        }
    }

    // fallback to raw bytes (for extremely large numbers)
    return { value: String(bytes), unit: 'B' };
};

// delete confirmation remaining values
export const getRemainingDays = (service?: ServiceInfoModel | null): string => {
    if (!service?.expiryDate) return 'N/A';

    const endDate = dayjs(service.expiryDate);
    const today = dayjs();

    const diff = endDate.diff(today, 'day');

    if (diff < 0) return 'Expired';

    const dayLabel = diff === 1 ? 'Day' : 'Days';
    return `${diff} ${dayLabel}`;
};

export const getRemainingQuota = (
    service?: ServiceInfoModel | null,
    serviceDetails?: ServiceDetailsResponseModel
): string => {
    if (!service?.serviceId) return 'N/A';

    const details = serviceDetails ?? [];
    if (!Array.isArray(details) || details.length === 0) return 'N/A';

    // find the highest priority (lowest number)
    const minPriority = Math.min(
        ...details
            .map(d => d.priority)
            .filter(p => typeof p === 'number')
    );

    if (!Number.isFinite(minPriority)) return 'N/A';

    // find the first bucket with that priority
    const selectedBucket = details.find(
        d => d.priority === minPriority
    );

    if (!selectedBucket?.remainingQuota && selectedBucket?.remainingQuota !== 0) {
        return 'N/A';
    }

    return formatBytes(selectedBucket.remainingQuota);
};
