import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import './NewsForm.css';

export default function NewsForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', image: null });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/news/${id}`).then(res => {
        console.log("res is ",res.data)
        setForm({ 
          title: res.data.news.heading, 
          content: res.data.news.news,
          image: null
        });
        setPreview(res.data.news.image);
      });
    }
  }, [id, isEdit]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm({...form, image: files[0]});
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({...form, [name]: value});
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', form.title);
    data.append('content', form.content);
    if (form.image) data.append('image', form.image);
    
    if (isEdit) {
      await api.put(`/news/${id}`, data);
    } else {
      await api.post('/news', data);
    }

    navigate('/');
  };

  return (
    <div className='news-form-container'>
      <h1>{isEdit ? 'Edit News' : 'Create News'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} />
        </div>
        <div>
          <label>Content</label>
          <textarea name="content" value={form.content} onChange={handleChange} />
        </div>
        <div>
          <label>Image</label>
          <input type="file" name="image" onChange={handleChange} />
          {preview && <img src={preview} width="100" alt="" />}
        </div>
        <button type="submit">{isEdit ? 'Update' : 'Create'}</button>
      </form>
    </div>
  );
}
