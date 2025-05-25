import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faTimes } from '@fortawesome/free-solid-svg-icons';
import loginIllustration from '../../assets/images/Login_illustration.png';
import { GoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from 'react-google-recaptcha';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!captchaToken) {
      setError('Please verify reCAPTCHA');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
        recaptchaToken: captchaToken // Send the token to backend
      });
      
      console.log("Full Response Data:", response.data);
      localStorage.setItem('token', response.data.token);
      if (response.data.user.role === 'client') {
        navigate('/client/home');
      } else {
        navigate('/freelancer/home');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Login failed');
      
      // Handle reCAPTCHA errors specifically
      if (err.response?.data?.errors?.includes('timeout-or-duplicate')) {
        setError('reCAPTCHA expired. Please verify again.');
      }
    }
  };


  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
  
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        credential,
      });
  
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
  
      if (res.data.user.role === 'client') {
        navigate('/client/home');
      } else {
        navigate('/freelancer/home');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed');
    }
  };
  

  const handleGoogleFailure = () => {
    setError('Google sign-in failed');
  };

  const handleForgotSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email: forgotEmail });
      setForgotStatus(res.data.message);
    } catch (err) {
      setForgotStatus(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="card-left">
          <img src={loginIllustration} alt="Login Illustration" />
        </div>

        <div className="card-right">
          <div className="login-box">
            <div className="login-header">
              <h4>ALREADY MEMBERS</h4>
              <span className="help">Need help?</span>
            </div>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="input-field"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  className="input-field"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                />
              </div>

              <div className="forgot-password">
                <span onClick={() => setShowForgotModal(true)} style={{ cursor: 'pointer', color: '#007bff' }}>
                  Forgot password?
                </span>
              </div>

              <ReCAPTCHA
                sitekey="6LfqsC0rAAAAAI_xfgjB29mK9BrTeKSeK9IMY7gm"
                onChange={handleCaptchaChange}
              />

              {error && <p className="error-message">{error}</p>}

              <button className="login-btn" type="submit">SIGN IN</button>
            </form>

            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
              />
            </div>

            <p className="signup-text">
              Don’t have an account yet? <a href="./Signup">Create an account</a>
            </p>
          </div>
        </div>
      </div>

      {showForgotModal && (
        <div className="forgot-modal">
          <div className="modal-content">
            <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={() => {
              setShowForgotModal(false);
              setForgotStatus('');
              setForgotEmail('');
            }} />
            <h3>Reset Password</h3>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="input-field"
            />
            <button className="login-btn" onClick={handleForgotSubmit}>Send Reset Link</button>
            {forgotStatus && <p className="status-message">{forgotStatus}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
