// ContractorList.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Card, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../Firebase';
import AddContractor from '../AddContractor/AddContractor';
import './contractor-list.css'

interface Contractor {
    key: string;
    contractorName: string;
    number: string;
    email: string;
    amountDebit: number;
    amountCredit: number;
    pendingAmount: number;
    promisedAmount: number;
}

const ContractorList: React.FC = () => {
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
    const [form] = Form.useForm();

    const fetchContractors = async () => {
        try {
            const contractorsRef = collection(db, 'contractors');
            const snapshot = await getDocs(contractorsRef);
            const contractorsData = snapshot.docs.map((doc) => ({
                key: doc.id,
                ...doc.data(),
            })) as Contractor[];
            setContractors(contractorsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching contractors:', error);
            message.error('Failed to fetch contractors');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContractors();
    }, []);

    const columns = [
        {
            title: 'Contractor Name',
            dataIndex: 'contractorName',
            key: 'contractorName',
        },
        {
            title: 'Phone Number',
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
    ];

    const handleEditSubmit = async (values: any) => {
        if (!selectedContractor) return;

        try {
            const contractorRef = doc(db, 'contractors', selectedContractor.key);
            await updateDoc(contractorRef, values);
            message.success('Contractor updated successfully');
            setShowEditModal(false);
            fetchContractors();
        } catch (error) {
            console.error('Error updating contractor:', error);
            message.error('Failed to update contractor');
        }
    };

    const handleDelete = async () => {
        if (!selectedContractor) return;

        try {
            await deleteDoc(doc(db, 'contractors', selectedContractor.key));
            message.success('Contractor deleted successfully');
            setShowDeleteModal(false);
            fetchContractors();
        } catch (error) {
            console.error('Error deleting contractor:', error);
            message.error('Failed to delete contractor');
        }
    };

    const handleContractorSelect = (contractorKey: string) => {
        const contractor = contractors.find((c) => c.key === contractorKey);
        if (contractor) {
            setSelectedContractor(contractor);
            form.setFieldsValue(contractor);
        }
    };


    const renderMobileCards = () => {
        return (
            <Row gutter={[16, 16]} className="mobile-cards">
                {contractors.map((contractor) => (
                    <Col xs={24} key={contractor.key}>
                        <Card
                            className={`contractor-list-card ${selectedContractor?.key === contractor.key ? 'selected' : ''}`}
                            onClick={() => handleContractorSelect(contractor.key)}
                            extra={
                                <Space className="card-actions">
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleContractorSelect(contractor.key);
                                            setShowEditModal(true);
                                        }}
                                    />
                                    <Button
                                        icon={<DeleteOutlined />}
                                        danger
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleContractorSelect(contractor.key);
                                            setShowDeleteModal(true);
                                        }}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowAddModal(true);
                                        }}
                                    />
                                </Space>
                            }
                        >
                            <h3 className="contractor-name">{contractor.contractorName}</h3>
                            <div className="contractor-details">
                                <div className="detail-item">
                                    <span className="label">Phone:</span>
                                    <span className="value">{contractor.number}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Email:</span>
                                    <span className="value">{contractor.email}</span>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <div>
            <Space className='all-buttons' style={{ marginBottom: 16, justifyContent: 'flex-end', width: '100%' }}>
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => setShowEditModal(true)}
                    >
                        <div className="button-icon-text">
                            Edit Contractor
                        </div>
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <div className="button-icon-text">
                            Delete Contractor
                        </div>
                    </Button>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowAddModal(true)}
                >
                    <div className="button-icon-text">
                        Add Contractor
                    </div>
                </Button>
            </Space>

            {window.innerWidth <= 768 ? renderMobileCards() : (

                <Table
                    columns={columns}
                    dataSource={contractors}
                    loading={loading}
                    rowKey="key"
                    pagination={false}
                />
            )}

            {/* Edit Modal */}
            <Modal
                title="Edit Contractor"
                open={showEditModal}
                onCancel={() => setShowEditModal(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleEditSubmit}>
                    <Form.Item label="Select Contractor">
                        <Select
                            onChange={handleContractorSelect}
                            placeholder="Select a contractor"
                        >
                            {contractors.map((contractor) => (
                                <Select.Option key={contractor.key} value={contractor.key}>
                                    {contractor.contractorName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="email" label="Email">
                        <Input />
                    </Form.Item>
                    <Form.Item name="number" label="Phone Number">
                        <Input />
                    </Form.Item>
                    <Form.Item name="amountCredit" label="Amount Credit">
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="amountDebit" label="Amount Debit">
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="pendingAmount" label="Pending Amount">
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="promisedAmount" label="Promised Amount">
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Update Contractor
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Modal */}
            <Modal
                title="Delete Contractor"
                open={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                footer={null}
            >
                <Form>
                    <Form.Item label="Select Contractor">
                        <Select
                            onChange={handleContractorSelect}
                            placeholder="Select a contractor"
                        >
                            {contractors.map((contractor) => (
                                <Select.Option key={contractor.key} value={contractor.key}>
                                    {contractor.contractorName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {selectedContractor && (
                        <div style={{ marginBottom: 16 }}>
                            Are you sure you want to delete {selectedContractor.contractorName}?
                        </div>
                    )}
                    <Button type="primary" danger onClick={handleDelete}>
                        Confirm Delete
                    </Button>
                </Form>
            </Modal>

            <Modal
                title="Add Contractor"
                open={showAddModal}
                onCancel={() => setShowAddModal(false)}
                footer={null}
            >
                <AddContractor
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchContractors();
                    }}
                />
            </Modal>
        </div>
    );
};

export default ContractorList;