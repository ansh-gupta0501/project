import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';  // Make sure this path matches your file structure

const Home = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return <div>Loading...</div>;

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="home-container">
      <div className="button-container">
        <Link to="/profile/edit">
          <button className="btn-primary">
            Update Profile Picture
          </button>
        </Link>
      </div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      {user.profile && (
        <img
          className="profile-image"
          src={`http://localhost:8000/images/${user.profile}`}
          alt="Profile"
        />
      )}
      <button className="btn-logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Home;
