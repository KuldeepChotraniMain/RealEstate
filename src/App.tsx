
import Sider from 'antd/es/layout/Sider';
import './App.css'
import {Button, Layout, Menu, Table } from 'antd';
import {
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  BarChartOutlined,
  CloudOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ShopOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { CSSProperties, useState } from 'react';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import { ColumnType } from 'antd/es/table';
import { useMediaQuery } from '@mui/material';

interface MenuItem {
  key: string;
  icon: JSX.Element;
  label: string;
  children?:{
    label: string;
    key: string;
    icon: JSX.Element;
}[];
}
interface DataType {
  key: string;
  contractorName: string;
  number: string;
  email: string;
  amountDebit: number;
  amountCredit: number;
  pendingAmount: number;
  promisedAmount: number;
}

function App() {
  const mdUp = useMediaQuery('(min-width:600px)');
  const [collapsed, setCollapsed] = useState(false);
  const items: MenuItem[] = [

    { key: '1', icon: <AppstoreOutlined />, label: 'Home' },
    { key: '2', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '3', icon: <TeamOutlined />, label: 'Add Contractor' },
  ];
  const mobileItems: MenuItem[] = [
    {
      label: 'Menu',
      key: 'SubMenu',
      icon: <SettingOutlined />,
      children: [
        { key: '1', icon: <AppstoreOutlined />, label: 'Home' },
        { key: '2', icon: <BarChartOutlined />, label: 'Analytics' },
        { key: '3', icon: <TeamOutlined />, label: 'Add Contractor' },
      ],
    },
  ];
  const siderStyle: CSSProperties = {
    overflow: 'auto',
    display: mdUp? 'block':'none',
    height: '100vh',
  };
  

  const columns: ColumnType<DataType>[] = [
    {
      title: 'Contractor Name',
      width: 150,
      dataIndex: 'contractorName',
      key: 'contractorName',
      fixed: 'left',
    },
    {
      title: 'Number',
      width: 120,
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: 'Email',
      width: 200,
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Amount Debit',
      width: 150,
      dataIndex: 'amountDebit',
      key: 'amountDebit',
      sorter: (a: DataType, b: DataType) => a.amountDebit - b.amountDebit,
    },
    {
      title: 'Amount Credit',
      width: 150,
      dataIndex: 'amountCredit',
      key: 'amountCredit',
      sorter: (a: DataType, b: DataType) => a.amountCredit - b.amountCredit,
    },
    {
      title: 'Pending Amount',
      width: 150,
      dataIndex: 'pendingAmount',
      key: 'pendingAmount',
    },
    {
      title: 'Promised Amount',
      width: 150,
      dataIndex: 'promisedAmount',
      key: 'promisedAmount',
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      width: 100,
      render: () => <a>action</a>,
    },
  ];
  const dataSource: DataType[] = [
    {
      key: '1',
      contractorName: 'Olivia Smith',
      number: '123-456-7890',
      email: 'olivia.smith@example.com',
      amountDebit: 500,
      amountCredit: 300,
      pendingAmount: 200,
      promisedAmount: 250,
    },
    {
      key: '2',
      contractorName: 'Ethan Johnson',
      number: '234-567-8901',
      email: 'ethan.johnson@example.com',
      amountDebit: 800,
      amountCredit: 600,
      pendingAmount: 200,
      promisedAmount: 300,
    },
    {
      key: '3',
      contractorName: 'Emma Williams',
      number: '345-678-9012',
      email: 'emma.williams@example.com',
      amountDebit: 750,
      amountCredit: 500,
      pendingAmount: 250,
      promisedAmount: 300,
    },
    {
      key: '4',
      contractorName: 'Liam Brown',
      number: '456-789-0123',
      email: 'liam.brown@example.com',
      amountDebit: 900,
      amountCredit: 700,
      pendingAmount: 200,
      promisedAmount: 350,
    },
    {
      key: '5',
      contractorName: 'Sophia Garcia',
      number: '567-890-1234',
      email: 'sophia.garcia@example.com',
      amountDebit: 650,
      amountCredit: 500,
      pendingAmount: 150,
      promisedAmount: 200,
    },
    {
      key: '6',
      contractorName: 'William Martinez',
      number: '678-901-2345',
      email: 'william.martinez@example.com',
      amountDebit: 300,
      amountCredit: 200,
      pendingAmount: 100,
      promisedAmount: 150,
    },
    {
      key: '7',
      contractorName: 'Isabella Hernandez',
      number: '789-012-3456',
      email: 'isabella.hernandez@example.com',
      amountDebit: 1200,
      amountCredit: 950,
      pendingAmount: 250,
      promisedAmount: 300,
    },
    {
      key: '8',
      contractorName: 'James Moore',
      number: '890-123-4567',
      email: 'james.moore@example.com',
      amountDebit: 560,
      amountCredit: 450,
      pendingAmount: 110,
      promisedAmount: 160,
    },
    {
      key: '9',
      contractorName: 'Mia Lopez',
      number: '901-234-5678',
      email: 'mia.lopez@example.com',
      amountDebit: 700,
      amountCredit: 600,
      pendingAmount: 100,
      promisedAmount: 180,
    },
    {
      key: '10',
      contractorName: 'Alexander Wilson',
      number: '012-345-6789',
      email: 'alexander.wilson@example.com',
      amountDebit: 450,
      amountCredit: 350,
      pendingAmount: 100,
      promisedAmount: 130,
    },
    // Add more entries if needed
  ];
  

  return (

    <Layout>
      {mdUp?
    <Sider trigger={null} collapsible collapsed={collapsed} style={siderStyle}>
      <div className="demo-logo-vertical" />
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        items={items}
      />
    </Sider>:''}
    <Layout>
      <Header style={{ padding: 0, background:'white' }}>
        {mdUp?
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
          }}
        />:
        <Menu selectedKeys={['1']} mode="horizontal" items={mobileItems} />}
      </Header>
      <Content
        style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
        }}
      >
    <div style={{ height: '80vh', overflowY: 'auto' }}>
      <Table
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        scroll={{
          x: 'max-content', // Horizontal scrolling for wide content
          y: '100vh', // Makes the table height scrollable within the container
        }}
      />
    </div>
      </Content>
      <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Om Prakash ©{new Date().getFullYear()} 
        </Footer>
    </Layout>
  </Layout>
  )
}

export default App
