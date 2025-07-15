import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import './NewsList.css';

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [meta, setMeta] = useState({ currentPage:1, totalPages:1 });
  const [page,setPage] = useState(1);

  const fetchNews = async () => {
    const res = await api.get(`/news?page=${page}&limit=2`);
    // console.log("news data",res.data);
    setNews(res.data.news);
    setMeta(res.data.metadata);
  };

  useEffect(() => { fetchNews(); }, [page]);

  return (
    <div className="news-list-container">
      <h1>Latest News</h1>
      <Link to="/news/create">Create News</Link>
      <ul>
        {news.map(item => (
         <li key={item.id}>
           <Link to={`/news/${item.id}`}>{item.heading}</Link>
           <img src={item.image} alt="" width="100" />
           <p>by {item.reporter.name}</p>
         </li>
        ))}
      </ul>
      <div>
        {Array.from({ length: meta.totalPages }).map((_,i)=>(
          <button
            key={i+1}
            disabled={i+1===meta.currentPage}
            onClick={()=>setPage(i+1)}
          >{i+1}</button>
        ))}
      </div>
    </div>
  );
}
