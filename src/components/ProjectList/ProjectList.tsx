import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../Firebase';
import { Table, Button, Modal, Form, Input, DatePicker, Select, message, Card, Row, Col, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';
import './project-list.css';

interface Project {
    key: string;
    projectName: string;
    address?: string;
    contractorAssigned: string;
    contractorId?: string;
    dueDate: Date;
    budget: number;
}

const ProjectList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [contractors, setContractors] = useState<{ key: string; contractorName: string }[]>([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    const fetchProjects = async () => {
        const projectsRef = collection(db, 'Projects');
        const snapshot = await getDocs(projectsRef);
        const projectsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                key: doc.id,
                projectName: data.projectName,
                address: data.address || 'N/A',
                contractorAssigned: data.contractorAssigned.name,
                contractorId: data.contractorAssigned.id,
                dueDate: (data.dueDate as Timestamp).toDate().toISOString(),
                budget: data.budget || 0,
            } as unknown as Project;
        });
        setProjects(projectsData);
    };


    useEffect(() => {
        const fetchContractors = async () => {
            const contractorsRef = collection(db, 'contractors');
            const snapshot = await getDocs(contractorsRef);
            const contractorsData = snapshot.docs.map((doc) => ({
                key: doc.id,
                contractorName: doc.data().contractorName,
            }));
            setContractors(contractorsData);
        };

        fetchProjects();
        fetchContractors();
    }, []);

    const columns: ColumnType<Project>[] = [
        {
            title: 'Project Name',
            dataIndex: 'projectName',
            key: 'projectName',
            width: 200,
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            width: 200,
        },
        {
            title: 'Contractor Assigned',
            dataIndex: 'contractorAssigned',
            key: 'contractorAssigned',
            width: 200,
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            width: 150,
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
            width: 150,
            render: (budget) => `${budget.toLocaleString()}`,
        },
    ];

    const handleAddProject = async (values: any) => {
        try {
            const selectedContractor = contractors.find(contractor => contractor.contractorName === values.contractorAssigned);

            if (selectedContractor) {
                const formattedValues = {
                    projectName: values.projectName,
                    address: values.address || 'N/A',
                    contractorAssigned: {
                        id: `/contractors/${selectedContractor.key}`,
                        name: selectedContractor.contractorName
                    },
                    dueDate: Timestamp.fromDate(values.dueDate.toDate()),
                    budget: Number(values.budget) || 0,
                };

                await addDoc(collection(db, 'Projects'), formattedValues);
                setIsAddModalVisible(false);
                message.success('Project added successfully');
                await fetchProjects();
                form.resetFields();
            }
        } catch (error) {
            console.error('Error adding project:', error);
            message.error('Failed to add project. Please try again.');
        }
    };

    const handleEditProject = async (values: any) => {
        try {
            if (!selectedProject) return;

            const selectedContractor = contractors.find(contractor => contractor.contractorName === values.contractorAssigned);

            if (selectedContractor) {
                const formattedValues = {
                    projectName: values.projectName,
                    address: values.address || 'N/A',
                    contractorAssigned: {
                        id: `/contractors/${selectedContractor.key}`,
                        name: selectedContractor.contractorName
                    },
                    dueDate: Timestamp.fromDate(values.dueDate.toDate()),
                    budget: Number(values.budget) || 0,
                };

                const projectRef = doc(db, 'Projects', selectedProject.key);
                await updateDoc(projectRef, formattedValues);
                setIsEditModalVisible(false);
                message.success('Project updated successfully');
                await fetchProjects();
                editForm.resetFields();
                setSelectedProject(null);
            }
        } catch (error) {
            console.error('Error updating project:', error);
            message.error('Failed to update project. Please try again.');
        }
    };

    const handleDeleteProject = async () => {
        try {
            if (!selectedProject) return;

            const projectRef = doc(db, 'Projects', selectedProject.key);
            await deleteDoc(projectRef);
            setIsDeleteModalVisible(false);
            message.success('Project deleted successfully');
            await fetchProjects();
            setSelectedProject(null);
        } catch (error) {
            console.error('Error deleting project:', error);
            message.error('Failed to delete project. Please try again.');
        }
    };

    const handleProjectSelect = (projectId: string) => {
        const project = projects.find(p => p.key === projectId);
        if (project) {
            setSelectedProject(project);
            editForm.setFieldsValue({
                ...project,
                dueDate: moment(project.dueDate),
            });
        }
    };


    const renderMobileCards = () => {
        return (
            <Row gutter={[16, 16]} className="mobile-cards">
                {projects.map((project) => (
                    <Col xs={24} key={project.key}>
                        <Card
                            className="project-card"
                            extra={
                                <Space className="card-actions">
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() => setIsEditModalVisible(true)}
                                    />
                                    <Button
                                        icon={<DeleteOutlined />}
                                        danger
                                        onClick={() => setIsDeleteModalVisible(true)}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => { setIsAddModalVisible(true); } }
                                    />
                                </Space>
                            }
                        >
                            <h3 className="project-name">{project.projectName}</h3>
                            <div className="project-details">
                                <div className="detail-item">
                                    <span className="label">Address:</span>
                                    <span className="value">{project.address}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Contractor:</span>
                                    <span className="value">{project.contractorAssigned}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Due Date:</span>
                                    <span className="value">
                                        {new Date(project.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Budget:</span>
                                    <span className="value">{project.budget.toLocaleString()}</span>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <>
            <div className="project-list-header">
                <Space>
                    <Button type="primary" onClick={() => setIsAddModalVisible(true)}>
                        Add Project
                    </Button>
                    <Button onClick={() => setIsEditModalVisible(true)}>
                        Edit Project
                    </Button>
                    <Button danger onClick={() => setIsDeleteModalVisible(true)}>
                        Delete Project
                    </Button>
                </Space>
            </div>

            {window.innerWidth <= 768 ? renderMobileCards() : (
                <Table
                    columns={columns}
                    dataSource={projects}
                    pagination={false}
                />
            )}

            {/* Add Project Modal */}
            <Modal
                title="Add Project"
                open={isAddModalVisible}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} onFinish={handleAddProject} layout="vertical">
                    <Form.Item
                        name="projectName"
                        label="Project Name"
                        rules={[{ required: true, message: 'Please input the project name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Address">
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="contractorAssigned"
                        label="Contractor Assigned"
                        rules={[{ required: true, message: 'Please select a contractor!' }]}
                    >
                        <Select>
                            {contractors.map((contractor) => (
                                <Select.Option key={contractor.key} value={contractor.contractorName}>
                                    {contractor.contractorName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="dueDate"
                        label="Due Date"
                        rules={[{ required: true, message: 'Please select a due date!' }]}
                    >
                        <DatePicker />
                    </Form.Item>
                    <Form.Item
                        name="budget"
                        label="Budget"
                        rules={[{ required: true, message: 'Please enter the budget!' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Project Modal */}
            <Modal
                title="Edit Project"
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    editForm.resetFields();
                    setSelectedProject(null);
                }}
                footer={null}
            >
                <Form form={editForm} onFinish={handleEditProject} layout="vertical">
                    <Form.Item
                        name="projectSelect"
                        label="Select Project"
                        rules={[{ required: true, message: 'Please select a project!' }]}
                    >
                        <Select onChange={handleProjectSelect}>
                            {projects.map((project) => (
                                <Select.Option key={project.key} value={project.key}>
                                    {project.projectName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="projectName"
                        label="Project Name"
                        rules={[{ required: true, message: 'Please input the project name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Address">
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="contractorAssigned"
                        label="Contractor Assigned"
                        rules={[{ required: true, message: 'Please select a contractor!' }]}
                    >
                        <Select>
                            {contractors.map((contractor) => (
                                <Select.Option key={contractor.key} value={contractor.contractorName}>
                                    {contractor.contractorName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="dueDate"
                        label="Due Date"
                        rules={[{ required: true, message: 'Please select a due date!' }]}
                    >
                        <DatePicker />
                    </Form.Item>
                    <Form.Item
                        name="budget"
                        label="Budget"
                        rules={[{ required: true, message: 'Please enter the budget!' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Update Project
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Project Modal */}
            <Modal
                title="Delete Project"
                open={isDeleteModalVisible}
                onCancel={() => {
                    setIsDeleteModalVisible(false);
                    setSelectedProject(null);
                }}
                footer={null}
            >
                <Form layout="vertical">
                    <Form.Item
                        name="projectSelect"
                        label="Select Project"
                        rules={[{ required: true, message: 'Please select a project!' }]}
                    >
                        <Select onChange={handleProjectSelect}>
                            {projects.map((project) => (
                                <Select.Option key={project.key} value={project.key}>
                                    {project.projectName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {selectedProject && (
                        <Popconfirm
                            title="Delete Project"
                            description="Are you sure you want to delete this project?"
                            onConfirm={handleDeleteProject}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button danger type="primary">
                                Delete Project
                            </Button>
                        </Popconfirm>
                    )}
                </Form>
            </Modal>
        </>
    );
};

export default ProjectList;

function moment(dueDate: Date) {
    throw new Error('Function not implemented.');
}

