import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../api';
import CourseForm from '../CourseForm';

const Courses = () => {
  const navigate = useNavigate();
  const { searchTerm, searchType } = useSearch();
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = searchType === 'course' ? courses.filter(course => {
    const term = searchTerm.toLowerCase();
    return (
      course.title.toLowerCase().includes(term) ||
      course.course_code.toLowerCase().includes(term) ||
      course.description.toLowerCase().includes(term) ||
      (course.instructor && course.instructor.name.toLowerCase().includes(term))
    );
  }) : courses;

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      alert('Error loading courses: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCourse = async (courseData) => {
    try {
      if (editingItem) {
        await updateCourse(editingItem.id, courseData);
        alert('Course updated successfully!');
      } else {
        await createCourse(courseData);
        alert('Course created successfully!');
      }
      setShowForm(false);
      setEditingItem(null);
      loadCourses();
    } catch (error) {
      alert(`Error ${editingItem ? 'updating' : 'creating'} course: ` + error.message);
    }
  };

  const handleEdit = (course) => {
    setEditingItem(course);
    setShowForm(true);
  };

  const handleDelete = async (course) => {
    if (window.confirm(`Are you sure you want to delete the course "${course.title}"?`)) {
      try {
        await deleteCourse(course.id);
        loadCourses();
        alert('Course deleted successfully!');
      } catch (error) {
        alert('Error deleting course: ' + error.message);
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem' }}>Back to Dashboard</button>
        <h2 style={{ background: 'linear-gradient(90deg, #9d4edd, #7b2cbf)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700', marginBottom: '1rem' }}>Courses</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', fontSize: '18px', color: '#e5e5e5' }}>
            Loading...
          </div>
        ) : (
          <>
            <button className="btn btn-primary" onClick={() => { setEditingItem(null); setShowForm(true); }}>Add Course</button>
            {showForm && (
              <CourseForm
                onSubmit={handleSubmitCourse}
                onCancel={() => { setShowForm(false); setEditingItem(null); }}
                initialValues={editingItem || {}}
              />
            )}
            {filteredCourses.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Course Code</th>
                      <th>Instructor</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id}>
                        <td>{course.title}</td>
                        <td>{course.course_code}</td>
                        <td>{course.instructor ? course.instructor.name : 'N/A'}</td>
                        <td>{course.description}</td>
                        <td>
                          <button onClick={() => handleEdit(course)} className="btn btn-warning btn-sm">Edit</button>
                          <button onClick={() => handleDelete(course)} className="btn btn-danger btn-sm" style={{ marginLeft: '0.5rem' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#e5e5e5', textAlign: 'center', marginTop: '2rem' }}>No courses available.</p>
            )}
            {searchTerm && searchType === 'course' && filteredCourses.length === 0 && (
              <p style={{ color: '#ff4d6d', textAlign: 'center' }}>No courses found matching "{searchTerm}"</p>
            )}
            {searchTerm && searchType !== 'course' && (
              <p style={{ color: '#aaa', textAlign: 'center' }}>Search for {searchType}s on the {searchType}s page.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;
