import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import Navbar from './Components/NavBar';
import Courses from './Components/pages/Courses';
import Students from './Components/pages/Students';
import Instructors from './Components/pages/Instructors';
import Enrollments from './Components/pages/Enrollments';
import Login from './Components/pages/Login';
import Signup from './Components/pages/Signup';
import Dashboard from './Components/pages/Dashboard';
import "./index.css"

function App() {
  return (
    <SearchProvider>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/students" element={<Students />} />
          <Route path="/instructors" element={<Instructors />} />
          <Route path="/enrollments" element={<Enrollments />} />
        </Routes>
      </div>
    </SearchProvider>
  );
}

export default App;
