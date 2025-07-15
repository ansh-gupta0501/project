import React, { useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import './ProfileUpload.css';

const ProfileUpload = () => {
  const { user, login } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileImage) {
      setError('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('profile', profileImage);

    try {
      const res = await api.put(`/profile/${user?.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(res.data.message);
      setError('');
      login(); // Refresh user info after upload
    } catch (err) {
      console.error(err);
      setMessage('');
      setError(err.response?.data?.errors?.profile || err.response?.data?.message || 'Upload failed');
    }
  };

  return (
  <div className="profile-upload-container">
    <h2>Upload Profile Picture</h2>
    {user?.profile && (
      <img
        src={`http://localhost:8000/images/${user.profile}`}
        alt="Profile"
      />
    )}
    <form onSubmit={handleSubmit}>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button type="submit">Upload</button>
    </form>
    {message && <p className="success">{message}</p>}
    {error && <p className="error">{error}</p>}
  </div>
);
};

export default ProfileUpload;
