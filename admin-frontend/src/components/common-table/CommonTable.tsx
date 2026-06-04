import { FC } from "react";
import { Table, ConfigProvider } from "antd";
import { ColumnsType } from "antd/es/table";

interface CommonTableProps {
  columns: ColumnsType<any>;
  dataSources: any[];
}

const CommonTable: FC<CommonTableProps> = ({ columns, dataSources }) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#14416E",
          },
        },
      }}
    >
      <Table
        columns={columns}
        dataSource={dataSources}
        className="common-basic-table"
        // rowKey={columns[0].key}
      />
    </ConfigProvider>
  );
};

export default CommonTable;
