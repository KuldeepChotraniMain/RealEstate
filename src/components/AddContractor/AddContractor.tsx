import { Form, Input, Button, message } from 'antd';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../Firebase';
import './AddContractor.css';

interface AddContractorProps {
  onSuccess?: () => void;
}

const AddContractor: React.FC<AddContractorProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const newContractor = {
      key: `${Date.now()}`,
      contractorName: values.contractorName,
      number: values.number,
      email: values.email,
      amountDebit: 'N/A',
      amountCredit: 'N/A',
      pendingAmount: 'N/A',
      promisedAmount: 'N/A',
      verification: 'pending'
    };

    try {
      await addDoc(collection(db, 'contractors'), newContractor);
      message.success('Contractor added successfully!');
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding contractor:', error);
      message.error('Failed to add contractor. Please try again.');
    }
  };

  return (
    <div className="add-contractor-container">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="contractor-form"
      >
        <Form.Item
          label="Contractor Name"
          name="contractorName"
          rules={[{ required: true, message: 'Please input contractor name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Phone Number"
          name="number"
          rules={[{ required: true, message: 'Please input phone number!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input email!' },
            { type: 'email', message: 'Please input a valid email!' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Contractor
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddContractor;