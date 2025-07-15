import {BrowserRouter as Router , Routes, Route, Navigate} from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './components/Home.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import NewsList from './pages/NewsList.jsx';
import NewsView from './pages/NewsView.jsx';
import NewsForm from './pages/NewsForm.jsx';
import ProfileUpload from './components/ProfileUpload.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function App(){
  return (
    <Router>
      <Routes>
         <Route path="/" element={
              <PrivateRoute>
                <Home />
                <NewsList></NewsList>
              </PrivateRoute>
            }
          />
        <Route path="/news/:id" element={<PrivateRoute><NewsView /></PrivateRoute>} />
        <Route path="/news/create" element={<PrivateRoute><NewsForm /></PrivateRoute>} />
        <Route path="/news/:id/edit" element={<PrivateRoute><NewsForm /></PrivateRoute>} />
       
        <Route path="/profile/edit" element={<PrivateRoute><ProfileUpload /></PrivateRoute>} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App;