import { useState, useEffect } from 'react';
import { Form, Select, Input, Button, Radio, Upload, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
//import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../Firebase';

interface Project {
    key: string;
    projectName: string;
    contractorAssigned: { id: string, name: string };
}

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

interface NewTransactionProps {
    contractors: Contractor[];
    onContractorUpdated: (updatedContractor: Contractor) => void;
    onTransactionSuccess?: () => void;
}

const NewTransaction: React.FC<NewTransactionProps> = ({ onContractorUpdated, onTransactionSuccess }) => {
    const [form] = Form.useForm();
    const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    //const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            const projectsRef = collection(db, 'Projects');
            const snapshot = await getDocs(projectsRef);
            const projectsData = snapshot.docs.map((doc) => ({
                key: doc.id,
                projectName: doc.data().projectName,
                contractorAssigned: doc.data().contractorAssigned,
            }));
            setProjects(projectsData);
        };

        fetchProjects();
    }, []);

    const onProjectSelect = async (value: string) => {
        const selectedProject = projects.find(project => project.key === value);
        if (selectedProject) {
            const contractorDoc = await getDoc(doc(db, selectedProject.contractorAssigned.id));
            if (contractorDoc.exists()) {
                const contractorData = contractorDoc.data() as Contractor;

                setSelectedContractor({ ...contractorData, key: contractorDoc.id });
                form.setFieldsValue({
                    contractorName: selectedProject.contractorAssigned.name,
                    number: contractorData?.number || '',
                    email: contractorData?.email || '',
                    amountDebit: contractorData?.amountDebit || 0,
                    amountCredit: contractorData?.amountCredit || 0,
                    pendingAmount: contractorData?.pendingAmount || 0,
                    promisedAmount: contractorData?.promisedAmount || 0,
                });
            } else {
                message.error('Selected contractor not found');
            }
        }
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        if (selectedContractor) {
            const updatedContractor = {
                ...selectedContractor,
                ...values,
            };

            try {
                await updateDoc(doc(db, 'contractors', selectedContractor.key), updatedContractor);
                message.success('Transaction successful');
                onContractorUpdated(updatedContractor);
                onTransactionSuccess?.(); // Call the success handler
            } catch (error) {
                console.error('Error updating contractor:', error);
                message.error('Failed to update contractor. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    scrollToFirstError
                >
                    <Form.Item
                        name="projectKey"
                        label="Select Project"
                        rules={[{ required: true, message: 'Please select a project' }]}
                    >
                        <Select
                            placeholder="Select a project"
                            onChange={onProjectSelect}
                        >
                            {projects.map(project => (
                                <Select.Option key={project.key} value={project.key}>
                                    {project.projectName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="contractorName"
                        label="Contractor Name"
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        name="amountDebit"
                        label="Amount Debit"
                        rules={[{ required: true, message: 'Please input debit amount' }]}
                    >
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item
                        name="debitType"
                        label="Debit Payment Type"
                        rules={[{ required: true }]}
                    >
                        <Radio.Group>
                            <Radio value="online">Online</Radio>
                            <Radio value="cash">Cash</Radio>
                        </Radio.Group>
                    </Form.Item>

                    {form.getFieldValue('debitType') === 'online' && (
                        <Form.Item
                            name="debitReceipt"
                            label="Debit Payment Receipt"
                        >
                            <Upload>
                                <Button icon={<UploadOutlined />}>Upload Receipt</Button>
                            </Upload>
                        </Form.Item>
                    )}

                    <Form.Item
                        name="amountCredit"
                        label="Amount Credit"
                        rules={[{ required: true, message: 'Please input credit amount' }]}
                    >
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item
                        name="creditType"
                        label="Credit Payment Type"
                        rules={[{ required: true }]}
                    >
                        <Radio.Group>
                            <Radio value="online">Online</Radio>
                            <Radio value="cash">Cash</Radio>
                        </Radio.Group>
                    </Form.Item>

                    {form.getFieldValue('creditType') === 'online' && (
                        <Form.Item
                            name="creditReceipt"
                            label="Credit Payment Receipt"
                        >
                            <Upload>
                                <Button icon={<UploadOutlined />}>Upload Receipt</Button>
                            </Upload>
                        </Form.Item>
                    )}

                    <Form.Item
                        name="pendingAmount"
                        label="Pending Amount"
                        rules={[{ required: true, message: 'Please input pending amount' }]}
                    >
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item
                        name="promisedAmount"
                        label="Promised Amount"
                        rules={[{ required: true, message: 'Please input promised amount' }]}
                    >
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Spin>
        </div>
    );
};

export default NewTransaction;
