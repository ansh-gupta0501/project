import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NewsView.css';

export default function NewsView() {
  const { id } = useParams();
  console.log("id",id)
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);

useEffect(() => {
  api.get(`/news/${id}`).then(res => {
    setItem(res.data.news);
    console.log("news data", res.data.news);
  });
}, [id]);
  const handleDelete = async () => {
    if (window.confirm('Delete?')) {
      await api.delete(`/news/${id}`);
      navigate('/');
    }
  };

  if (!item) return <div>Loading...</div>;

  const isOwner = user?.id === item.reporter.id;

  return (
  <div className="news-view-container">
    <h2>{item.heading}</h2>
    <img className="main-image" src={item.image} alt="" />
    <p>{item.news}</p>
    <div className="author-info">
      <img className="profile-pic" src={item.reporter.profile} alt="" />
      <span>By {item.reporter.name}</span>
    </div>
    {isOwner && (
      <div className="actions">
        <Link to={`/news/${id}/edit`}>Edit</Link>
        <button onClick={handleDelete}>Delete</button>
      </div>
    )}
  </div>
);
}
