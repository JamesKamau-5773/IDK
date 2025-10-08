import React, { useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { getEnrollments, createEnrollment, updateEnrollment, deleteEnrollment } from '../../api';
import EnrollmentForm from '../EnrollmentForm';

const Enrollments = () => {
  const { searchTerm, searchType } = useSearch();
  const [enrollments, setEnrollments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const filteredEnrollments = searchType === 'enrollment' ? enrollments.filter(enrollment => {
    const term = searchTerm.toLowerCase();
    return (
      (enrollment.student && enrollment.student.name.toLowerCase().includes(term)) ||
      (enrollment.course && enrollment.course.title.toLowerCase().includes(term)) ||
      enrollment.status.toLowerCase().includes(term) ||
      (enrollment.grade && enrollment.grade.toLowerCase().includes(term))
    );
  }) : enrollments;

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const data = await getEnrollments();
      setEnrollments(data);
    } catch (error) {
      alert('Error loading enrollments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEnrollment = async (enrollmentData) => {
    try {
      if (editingItem) {
        await updateEnrollment(editingItem.id, enrollmentData);
        alert('Enrollment updated successfully!');
      } else {
        await createEnrollment(enrollmentData);
        alert('Enrollment created successfully!');
      }
      setShowForm(false);
      setEditingItem(null);
      loadEnrollments();
    } catch (error) {
      alert(`Error ${editingItem ? 'updating' : 'creating'} enrollment: ` + error.message);
    }
  };

  const handleEdit = (enrollment) => {
    setEditingItem(enrollment);
    setShowForm(true);
  };

  const handleDelete = async (enrollment) => {
    if (window.confirm(`Are you sure you want to delete the enrollment for ${enrollment.student ? enrollment.student.name : enrollment.student_id}?`)) {
      try {
        await deleteEnrollment(enrollment.id);
        loadEnrollments();
        alert('Enrollment deleted successfully!');
      } catch (error) {
        alert('Error deleting enrollment: ' + error.message);
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ background: 'linear-gradient(90deg, #9d4edd, #7b2cbf)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700', marginBottom: '1rem' }}>Enrollments</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', fontSize: '18px', color: '#e5e5e5' }}>
            Loading...
          </div>
        ) : (
          <>
            <button className="btn btn-primary" onClick={() => { setEditingItem(null); setShowForm(true); }}>Add Enrollment</button>
            {showForm && (
              <EnrollmentForm
                onSubmit={handleSubmitEnrollment}
                onCancel={() => { setShowForm(false); setEditingItem(null); }}
                initialValues={editingItem || {}}
              />
            )}
            {filteredEnrollments.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td>{enrollment.student ? enrollment.student.name : enrollment.student_id}</td>
                        <td>{enrollment.course ? enrollment.course.title : enrollment.course_id}</td>
                        <td>{enrollment.status}</td>
                        <td>{enrollment.grade || 'N/A'}</td>
                        <td>
                          <button onClick={() => handleEdit(enrollment)} className="btn btn-warning btn-sm">Edit</button>
                          <button onClick={() => handleDelete(enrollment)} className="btn btn-danger btn-sm" style={{ marginLeft: '0.5rem' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#e5e5e5', textAlign: 'center', marginTop: '2rem' }}>No enrollments available.</p>
            )}
            {searchTerm && searchType === 'enrollment' && filteredEnrollments.length === 0 && (
              <p style={{ color: '#ff4d6d', textAlign: 'center' }}>No enrollments found matching "{searchTerm}"</p>
            )}
            {searchTerm && searchType !== 'enrollment' && (
              <p style={{ color: '#aaa', textAlign: 'center' }}>Search for {searchType}s on the {searchType}s page.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Enrollments;
