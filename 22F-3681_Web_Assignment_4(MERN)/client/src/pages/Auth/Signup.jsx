import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faPhone } from '@fortawesome/free-solid-svg-icons';
import SignupIllustration from '../../assets/images/signup_illustration.png';
import { GoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from 'react-google-recaptcha';

const RECAPTCHA_SITE_KEY = '6LfqsC0rAAAAAI_xfgjB29mK9BrTeKSeK9IMY7gm'; // Replace with your actual site key

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    otp: ''
  });

  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA');
      return;
    }

    try {
      const { name, email, password, phone } = formData;

      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        name,
        email,
        password,
        phone,
        role: 'client',
        recaptchaToken // Optional: send to backend for server-side verification
      });

      setMessage(response.data.message);
      setError('');
      localStorage.setItem('token', response.data.token);

      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
      setMessage('');
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/google', {
        credential: credentialResponse.credential,
      });
  
      const { token, user } = response.data;
  
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (error) {
      console.error('Google Signup failed:', error);
      setError('Google Signup failed');
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <div className="card-right">
          <div className="signup-box">
            <h3 className="form-title">Create Account</h3>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  className="input-field"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="input-field"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  className="input-field"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <FontAwesomeIcon icon={faPhone} className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  className="input-field"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  className="input-field"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="recaptcha-container">
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => setRecaptchaToken(token)}
                />
              </div>

              <button className="signup-btn" type="submit">Sign Up</button>
            </form>

            <p className="or-divider">OR</p>

            <div className="google-login">
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={() => setError('Google Signup failed')}
              />
            </div>

            <p className="login-redirect">
              Already have an account? <a href="./Login">Sign In</a>
            </p>
          </div>
        </div>

        <div className="card-left">
          <img src={SignupIllustration} alt="Signup Illustration" />
        </div>
      </div>
    </div>
  );
};

export default Signup;
