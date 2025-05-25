import React, { useState } from 'react';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';
import NavbarTop from '../../components/Navbar/NavbarTop';
import NavbarBottom from '../../components/Navbar/NavbarBottom';
import Footer from '../../components/Footer/Footer';
import { sendContactEmail } from '../../services/emailServices';
import './ContactPage.css';
import MapPicker from '../../components/Map/MapPicker';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    location: null, // Add location to form data
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: false });
  
  // Update this state to track the selected location
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setFormData(prevState => ({
      ...prevState,
      location: location, // Include location in formData
    }));
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: false });

    try {
      // Add the location data to the form data when sending the email
      await sendContactEmail(formData);
      setStatus({ loading: false, success: true, error: false });
      setFormData({ name: '', email: '', subject: '', message: '', location: null });
    } catch (err) {
      setStatus({ loading: false, success: false, error: true });
    }

    setTimeout(() => {
      setStatus({ loading: false, success: false, error: false });
    }, 3000);
  };

  return (
    <>
      <NavbarTop />
      <NavbarBottom />

      <div className="contact-page-container">
        <h2 className="contact-page-title">Contact Us</h2>
        <div className="contact-page-grid">
          {/* Contact Form */}
          <div className="contact-form-column">
            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
              />
              <textarea
                name="message"
                rows="7"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <button type="submit" disabled={status.loading}>
                {status.loading ? 'Sending...' : 'Send Message'}
              </button>
              {status.success && <p className="form-success-message">Message sent successfully!</p>}
              {status.error && <p className="form-error-message">Failed to send message. Please try again.</p>}
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-details-column">
            <h3>Get in Touch</h3>
            <p>We're here to help! Feel free to reach out to us with any questions or feedback.</p>
            <div className="contact-info">
              <div className="contact-info-item">
                <FaMapMarkerAlt /> <span>Your Business Address Here</span>
              </div>
              <div className="contact-info-item">
                <FaEnvelope /> <span>info@yourbusiness.com</span>
              </div>
              <div className="contact-info-item">
                <FaPhone /> <span>+123 456 7890</span>
              </div>
            </div>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>

        {/* Google Map */}
        <div className="map-container">
          <MapPicker
            onLocationSelect={handleLocationSelect}
            apiKey="AIzaSyB9irjntPHdEJf024h7H_XKpS11OeW1Nh8"
          />
        </div>

        {/* Display Selected Location */}
        {selectedLocation && (
          <div className="selected-location">
            <h4>Selected Location:</h4>
            <p>Latitude: {selectedLocation.lat}</p>
            <p>Longitude: {selectedLocation.lng}</p>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;
