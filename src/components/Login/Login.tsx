//import React from 'react';
import { useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { app } from '../../Firebase';
import { Button, Card, Spin } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import './Login.css';


const Login = () => {
    const [isLoading, setIsLoading] = useState(false);

    const loginWithGoogle = async () => {
        setIsLoading(true);
        const auth = getAuth(app);

        try {
            await setPersistence(auth, browserLocalPersistence);

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            localStorage.setItem('user', JSON.stringify({
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName
            }));

        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="layout">
            <div className="left">
                <img src="src/assets/Om-Prakash-Logo_processed.jpg" alt="Logo" className='full-logo-img' />
            </div>
            <div className="right">
                <div className="logo">
                    <img src="src/assets/only-logo_processed.jpg" alt="Logo" className='logo-img' />
                </div>
                <Card className="card">
                    
                    <Button
                        type="primary"
                        icon={<GoogleOutlined />}
                        onClick={loginWithGoogle}
                        size="large"
                        style={{ width: '100%' }}
                        disabled={isLoading}
                    >
                        {isLoading ? <Spin /> : 'Login with Google'}
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default Login;
