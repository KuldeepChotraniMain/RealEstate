import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Layout, Menu, Button, Modal, Spin, message } from 'antd';
import { useMediaQuery } from '@mui/material';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  TeamOutlined,
  EditOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import Analytics from './components/Analytics/Analytics';
import AddContractor from './components/AddContractor/AddContractor';
import NewTransaction from './components/NewTransaction/NewTransaction';
import ProjectList from './components/ProjectList/ProjectList';
import ContractorList from './components/ContractorList/ContractorList';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from './Firebase';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './Firebase';
import './App.css';

const { Header, Sider, Content, Footer } = Layout;

interface Contractor {
  key: string;
  contractorName: string;
  number: string;
  email: string;
  amountDebit: number;
  amountCredit: number;
  pendingAmount: number;
  promisedAmount: number;
  verificationStatus?: 'pending' | 'verified';
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = getAuth(app);
  const user = auth.currentUser;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const mdUp = useMediaQuery('(min-width:767px)');
  const [collapsed, setCollapsed] = useState(false);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchContractors = async () => {
      const contractorsRef = collection(db, 'contractors');
      const snapshot = await getDocs(contractorsRef);
      const contractorsData = snapshot.docs.map((doc) => ({
        key: doc.id,
        ...doc.data(),
        verificationStatus: 'pending',
      })) as Contractor[];
      setContractors(contractorsData);
    };

    fetchContractors();

    const auth = getAuth(app);

    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setIsLoggedIn(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);
      if (user) {
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem('user');
      }
    });

    // Set up token refresh
    let refreshTimeout: NodeJS.Timeout;
    const setupTokenRefresh = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          const decodedToken: any = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
          const timeToRefresh = expirationTime - Date.now() - (5 * 60 * 1000); // Refresh 5 minutes before expiry

          refreshTimeout = setTimeout(async () => {
            await user.getIdToken(true); // Force token refresh
            setupTokenRefresh(); // Set up next refresh
          }, timeToRefresh);
        }
      } catch (error) {
        console.error('Token refresh error:', error);
      }
    };

    setupTokenRefresh();

    return () => {
      unsubscribe();
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, []);

  const handleContractorUpdate = (updatedContractor: Contractor) => {
    setContractors((prevContractors) =>
      prevContractors.map((contractor) =>
        contractor.key === updatedContractor.key ? updatedContractor : contractor
      )
    );
  };

  const handleTransactionSuccess = () => {
    setShowModal(null); // Close the modal
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  const handleModalOpen = (modalName: string) => {
    setShowModal(modalName);
  };

  const handleModalClose = () => {
    setShowModal(null);
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      message.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Failed to logout. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const items = [
    { key: '/', icon: <AppstoreOutlined />, label: <Link to="/">Transaction List</Link> },
    { key: '/projects', icon: <BarChartOutlined />, label: <Link to="/projects">Project List</Link> },
    {
      key: '/contractors',
      icon: <TeamOutlined />,
      label: <Link to="/contractors">Contractor List</Link>
    },
    {
      key: '/new-transaction',
      icon: <EditOutlined />,
      label: <a onClick={() => handleModalOpen('newtransaction')}>New Transaction</a>,
    },
    {
      key: '/logout',
      icon: <LogoutOutlined />,
      label: <a onClick={handleLogout}>Logout</a>,
    },
  ];

  const mobileItems = [
    {
      label: 'Menu',
      key: 'SubMenu',
      icon: <SettingOutlined />,
      children: items,
    },
  ];

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" replace />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                {mdUp && (
                  <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    style={{
                      overflow: 'auto',
                      height: '100vh',
                    }}
                  >
                    <div className="logo" />
                    <Menu
                      theme="dark"
                      mode="inline"
                      defaultSelectedKeys={['/']}
                      items={items}
                    />
                  </Sider>
                )}

                <Layout>
                  <Header style={{ padding: 0, background: 'white' }}>
                    {mdUp ? (
                      <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                          fontSize: '16px',
                          width: 64,
                          height: 64,
                        }}
                      />
                    ) : (
                      <Menu
                        selectedKeys={['/']}
                        mode="horizontal"
                        items={mobileItems}
                      />
                    )}
                  </Header>

                  <Content
                    style={{
                      marginLeft: '16px',
                      marginRight: '16px',
                      marginTop: '10px',
                      padding: 24,
                      minHeight: 280,
                    }}
                  >
                    <Routes>
                      <Route path="/" element={<Home refreshKey={refreshKey} />} />
                      <Route path="/projects" element={<ProjectList />} />
                      <Route path="/contractors" element={<ContractorList />} />
                    </Routes>
                  </Content>

                  <Footer style={{ textAlign: 'center', padding: '10px' }}>
                    Om Prakash ©{new Date().getFullYear()}
                  </Footer>
                </Layout>

                <Modal
                  title="Add Contractor"
                  open={showModal === 'addContractor'}
                  onCancel={handleModalClose}
                  footer={null}
                >
                  <AddContractor />
                </Modal>

                <Modal
                  title="New Transaction"
                  open={showModal === 'newtransaction'}
                  onCancel={handleModalClose}
                  footer={null}
                  className="transaction-modal"
                  style={{ top: '7vh' }}
                >
                  <NewTransaction
                    contractors={contractors}
                    onContractorUpdated={handleContractorUpdate}
                    onTransactionSuccess={handleTransactionSuccess}
                  />
                </Modal>

                <Modal
                  title="Analytics"
                  open={showModal === 'analytics'}
                  onCancel={handleModalClose}
                  footer={null}
                >
                  <Analytics />
                </Modal>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

