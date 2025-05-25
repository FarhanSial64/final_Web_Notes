import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faTimes } from '@fortawesome/free-solid-svg-icons';
import loginIllustration from '../../assets/images/Login_illustration.png';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
      setLoading(true);
      const response = await axios.post('http://localhost:5000/auth/login', {
        ...formData,
        recaptchaToken: captchaToken,
      });

      // Use the login function from AuthContext
      login(response.data.user, response.data.token);

      console.log('User data:', response.data.user);

      // Navigate based on user role - ensure case-insensitive comparison
      console.log('Login successful. User data:', response.data.user);

      if (response.data.user && response.data.user.role) {
        const userRole = response.data.user.role.toLowerCase();
        console.log('User role:', userRole);

        if (userRole === 'admin') {
          console.log('Redirecting admin user to admin dashboard');
          navigate('/admin/dashboard');
        } else {
          console.log('Redirecting regular user to home page');
          navigate('/');
        }
      } else {
        console.log('No role found in user data, redirecting to home page');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { credential } = credentialResponse;

      const res = await axios.post('http://localhost:5000/auth/google', {
        credential,
      });

      // Use the login function from AuthContext
      login(res.data.user, res.data.token);

      console.log('Google login successful. User data:', res.data.user);

      // Navigate based on user role - ensure case-insensitive comparison
      if (res.data.user && res.data.user.role) {
        const userRole = res.data.user.role.toLowerCase();
        console.log('User role:', userRole);

        if (userRole === 'admin') {
          console.log('Redirecting admin user to admin dashboard');
          navigate('/admin/dashboard');
        } else {
          console.log('Redirecting regular user to home page');
          navigate('/');
        }
      } else {
        console.log('No role found in user data, redirecting to home page');
        navigate('/');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleFailure = () => {
    setError('Google sign-in failed');
  };

  const handleForgotSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:5000/email/forgot-password', { email: forgotEmail });
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

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'SIGN IN'}
              </button>
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
