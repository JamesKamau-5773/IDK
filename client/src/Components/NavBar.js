import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';

const Navbar = () => {
  const location = useLocation();
  const { searchTerm, setSearchTerm, searchType, setSearchType } = useSearch();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const isLoggedIn = localStorage.getItem('token');

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <h1>CourseHub</h1>
          <div className="nav-links">
            {isLoggedIn ? (
              <>
                <Link to="/" className={isActive('/') ? 'active' : ''}>
                  Dashboard
                </Link>
                <Link to="/courses" className={isActive('/courses') ? 'active' : ''}>
                  Courses
                </Link>
                <Link to="/students" className={isActive('/students') ? 'active' : ''}>
                  Students
                </Link>
                <Link to="/instructors" className={isActive('/instructors') ? 'active' : ''}>
                  Instructors
                </Link>
                <Link to="/enrollments" className={isActive('/enrollments') ? 'active' : ''}>
                  Enrollments
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', margin: '0 10px' }}>
                  <select
                    onChange={(e) => setSearchType(e.target.value)}
                    defaultValue="course"
                    style={{ marginRight: '5px', padding: '5px' }}
                  >
                    <option value="course">Search Courses</option>
                    <option value="enrollment">Search Enrollments</option>
                    <option value="student">Search Students</option>
                    <option value="instructor">Search Instructors</option>
                  </select>
                  <input
                    type="text"
                    placeholder={`Search ${searchType}s...`}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '5px', width: '200px' }}
                  />
                </div>
                <button
                  className="logout-button"
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={isActive('/login') ? 'active' : ''}>
                  Login
                </Link>
                <Link to="/signup" className={isActive('/signup') ? 'active' : ''}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
