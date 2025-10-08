import React, { useState, useEffect } from 'react';
import { getCourses, getStudents, getEnrollments, getInstructors } from '../../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    enrollments: 0,
    instructors: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [courses, students, enrollments, instructors] = await Promise.all([
        getCourses(),
        getStudents(),
        getEnrollments(),
        getInstructors()
      ]);

      setStats({
        courses: courses.length,
        students: students.length,
        enrollments: enrollments.length,
        instructors: instructors.length
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Courses</h3>
          <div className="stat-number">{stats.courses}</div>
          <a href="/courses" className="stat-link">View Courses</a>
        </div>
        <div className="stat-card">
          <h3>Total Students</h3>
          <div className="stat-number">{stats.students}</div>
          <a href="/students" className="stat-link">View Students</a>
        </div>
        <div className="stat-card">
          <h3>Total Enrollments</h3>
          <div className="stat-number">{stats.enrollments}</div>
          <a href="/enrollments" className="stat-link">View Enrollments</a>
        </div>
        <div className="stat-card">
          <h3>Total Instructors</h3>
          <div className="stat-number">{stats.instructors}</div>
          <a href="/instructors" className="stat-link">View Instructors</a>
        </div>
      </div>
      <div className="dashboard-recent">
        <h3>Recent Activity</h3>
        <p>Welcome to CourseHub! Here you can manage courses, students, and enrollments.</p>
      </div>
    </div>
  );
};

export default Dashboard;
