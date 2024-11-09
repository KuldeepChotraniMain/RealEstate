import { useState, useEffect } from 'react';
import { Table, Modal, Checkbox, Button, message, Card, Row, Col } from 'antd';
import { ColumnType } from 'antd/es/table';
import SignatureCanvas from 'react-signature-canvas';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../Firebase';
import './Home.css';

interface Contractor {
  key: string;
  contractorName: string;
  number: string;
  email: string;
  amountDebit: number;
  amountCredit: number;
  pendingAmount: number;
  promisedAmount: number;
  verification?: 'pending' | 'verified';
}

interface HomeProps {
  refreshKey?: number;
}

const Home: React.FC<HomeProps> = ({ refreshKey = 0 }) => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [signatureRef, setSignatureRef] = useState<SignatureCanvas | null>(null);

  useEffect(() => {
    const fetchContractors = async () => {
      const contractorsRef = collection(db, 'contractors');
      const snapshot = await getDocs(contractorsRef);
      const contractorsData = snapshot.docs.map((doc) => ({
        key: doc.id,
        ...doc.data(),
      })) as Contractor[];
      setContractors(contractorsData);
    };
    fetchContractors();
  }, [refreshKey]);

  const handleActionClick = (record: Contractor) => {
    if (record.verification === 'verified') return;

    setSelectedContractor(record);
    setModalVisible(true);
    setIsConfirmed(false);
    signatureRef?.clear();
  };

  const handleModalSubmit = async () => {
    if (!isConfirmed || !signatureRef?.isEmpty()) {
      if (selectedContractor) {
        try {
          // Update the document in the database
          await updateDoc(doc(db, 'contractors', selectedContractor.key), {
            verification: 'verified',
          });

          // Refetch the data to update the table
          const contractorsRef = collection(db, 'contractors');
          const snapshot = await getDocs(contractorsRef);
          const contractorsData = snapshot.docs.map((doc) => ({
            key: doc.id,
            ...doc.data(),
          })) as Contractor[];
          setContractors(contractorsData);

          setModalVisible(false);
          setIsConfirmed(false);
          signatureRef?.clear();
        } catch (error) {
          console.error('Error updating contractor verification:', error);
          message.error('Failed to update contractor verification. Please try again.');
        }
      }
    }
  };


  const columns: ColumnType<Contractor>[] = [
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
      align: 'center',
    },
    {
      title: 'Email',
      width: 200,
      dataIndex: 'email',
      key: 'email',
      align: 'center',
    },
    {
      title: 'Amount Debit',
      width: 150,
      dataIndex: 'amountDebit',
      key: 'amountDebit',
      sorter: (a, b) => a.amountDebit - b.amountDebit,
      align: 'center',
    },
    {
      title: 'Amount Credit',
      width: 150,
      dataIndex: 'amountCredit',
      key: 'amountCredit',
      sorter: (a, b) => a.amountCredit - b.amountCredit,
      align: 'center',
    },
    {
      title: 'Pending Amount',
      width: 150,
      dataIndex: 'pendingAmount',
      key: 'pendingAmount',
      align: 'center',
    },
    {
      title: 'Promised Amount',
      width: 150,
      dataIndex: 'promisedAmount',
      key: 'promisedAmount',
      align: 'center',
    },
    {
      title: 'Verifcation',
      key: 'operation',
      width: 100,
      render: (_, record: Contractor) => (
        <a
          onClick={() => handleActionClick(record)}
          style={{
            color: record.verification === 'verified' ? '#52c41a' : '#1890ff',
            cursor: record.verification === 'verified' ? 'default' : 'pointer',
          }}
        >
          {record.verification}
        </a>
      ),
      align: 'center',
    },
  ];


  const renderMobileCards = () => {
    return (
      <Row gutter={[16, 16]} className="mobile-cards">
        {contractors.map((contractor) => (
          <Col xs={24} key={contractor.key}>
            <Card
              className={`contractor-card ${selectedContractor?.key === contractor.key ? 'selected' : ''}`}
              onClick={() => contractor.verification !== 'verified' && handleActionClick(contractor)}
            >
              <h3 className="contractor-name">{contractor.contractorName}</h3>
              <div className="divider" />
              <div className="amount-row">
                <div className="amount-item">
                  <span className="label">Credit:</span>
                  <span className="value">₹{contractor.amountCredit}</span>
                </div>
                <div className="amount-item">
                  <span className="label">Debit:</span>
                  <span className="value">₹{contractor.amountDebit}</span>
                </div>
              </div>
              <div className="pending-amount">
                <span className="label">Pending:</span>
                <span className="value">₹{contractor.pendingAmount}</span>
              </div>
              <div className="divider" />
              <div className={`verification-status ${contractor.verification}`}>
                <span className="label">Verification:</span>
                {contractor.verification}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="home-container">
      <div className="table-container">
        {window.innerWidth <= 768 ? renderMobileCards() : (
          <Table
            pagination={false}
            columns={columns}
            dataSource={contractors}
            scroll={{
              x: 'max-content',
              y: 'calc(100vh - 230px)',
            }}
          />
        )}
      </div>

      <Modal
        title="Verification Confirmation"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleModalSubmit}
            disabled={!isConfirmed || signatureRef?.isEmpty()}
          >
            Submit
          </Button>,
        ]}
      >
        <div className="verification-modal">
          <Checkbox
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
          >
            I hereby confirm that the amount of ₹{selectedContractor?.amountCredit} has been credited to my account
            and I acknowledge receipt of the payment.
          </Checkbox>

          <div className="signature-section">
            <h4>Please draw your signature below:</h4>
            <div className="signature-container">
              <SignatureCanvas
                ref={(ref) => setSignatureRef(ref)}
                canvasProps={{
                  className: 'signature-canvas',
                  width: 500,
                  height: 200,
                }}
              />
            </div>
          </div>
        </div>
        <Button size="small" onClick={() => signatureRef?.clear()}>
          Clear Signature
        </Button>
      </Modal>
    </div>
  );
};

export default Home;
