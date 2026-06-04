import React from 'react';
import { Table } from 'antd';

interface DynamicTableProps {
    columns: any[];
    data: any[];
    rowKey?: string | ((record: any) => string | number);
    pagination?: false | {
        current: number;
        pageSize: number;
        total: number;
        onChange?: (page: number, pageSize: number) => void;
    };
    loading?: boolean;
    scroll?: { x?: number | string; y?: number | string };
}

const DynamicTable: React.FC<DynamicTableProps> = ({ columns, data, rowKey = 'id', pagination, loading, scroll }) => {

    return (
        <div>
            <Table
                columns={columns}
                dataSource={data}
                className="common-basic-table"
                loading={loading}
                pagination={pagination ? {
                    total: pagination.total,
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    pageSizeOptions: [10, 25, 50],
                    showSizeChanger: true,
                    onChange: pagination.onChange
                } : false}
                rowKey={rowKey}
                tableLayout="fixed"
                scroll={scroll}
            />
        </div>
    );
};

export default DynamicTable;