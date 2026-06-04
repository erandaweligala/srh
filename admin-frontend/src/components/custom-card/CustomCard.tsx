import { ConfigProvider, Card, type CardProps } from "antd";

const CustomCard: React.FC<CardProps> = (props) => (
  <ConfigProvider
    theme={{
      components: {
        Card: {
          /* here is your component tokens */
          headerBg: "#F8F9FA",
          colorBorderSecondary: "#D9D9D9",
          borderRadiusLG: 4,
        },
      },
    }}
  >
    <Card style={{ minWidth: 100 }} {...props}>
      {props.children}
    </Card>
  </ConfigProvider>
);

export default CustomCard;
