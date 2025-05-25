import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../../assets/css/loginPage.css';

function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'identifier') setIdentifier(e.target.value);
    if (e.target.name === 'password') setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset previous errors

    if (!identifier || !password) {
      setError('Username/Email and password are required.');
      return;
    }

      try {
        const response = await fetch('http://localhost:5000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === 'student') {
          navigate('/student/dashboard');
        } else if (data.user.role === 'tutor') {
          navigate('/tutor/dashboard');
        } else if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/'); // Default fallback
        }

      } catch (error) {
        alert(`❌ Login Error: ${error.message}`);
      }
  };

  return (
    <div className="login-page-container">
      <div className="login-container">
          <h2>Login</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
              <input
                  type="text"
                  name="identifier"
                  placeholder="Username or Email"
                  value={identifier}
                  onChange={handleChange}
              />

              <div className="password-container">
                  <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={handleChange}
                  />
                  <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                  />
              </div>

              <button type="submit">Login</button>
          </form>
          <p>Don't have an account? <Link to="/signup">Signup</Link></p>
      </div>
  </div>
  );
}

export default LoginPage;
