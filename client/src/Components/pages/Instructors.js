import React, { useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { getInstructors, createInstructor, updateInstructor, deleteInstructor } from '../../api';
import InstructorForm from '../InstructorForm';

const Instructors = () => {
  const { searchTerm, searchType } = useSearch();
  const [instructors, setInstructors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadInstructors();
  }, []);

  const filteredInstructors = searchType === 'instructor' ? instructors.filter(instructor => {
    const term = searchTerm.toLowerCase();
    return (
      instructor.name.toLowerCase().includes(term) ||
      instructor.specialty.toLowerCase().includes(term)
    );
  }) : instructors;

  const loadInstructors = async () => {
    setLoading(true);
    try {
      const data = await getInstructors();
      setInstructors(data);
    } catch (error) {
      alert('Error loading instructors: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitInstructor = async (instructorData) => {
    try {
      if (editingItem) {
        await updateInstructor(editingItem.id, instructorData);
        alert('Instructor updated successfully!');
      } else {
        await createInstructor(instructorData);
        alert('Instructor created successfully!');
      }
      setShowForm(false);
      setEditingItem(null);
      loadInstructors();
    } catch (error) {
      alert(`Error ${editingItem ? 'updating' : 'creating'} instructor: ` + error.message);
    }
  };

  const handleEdit = (instructor) => {
    setEditingItem(instructor);
    setShowForm(true);
  };

  const handleDelete = async (instructor) => {
    if (window.confirm(`Are you sure you want to delete the instructor "${instructor.name}"?`)) {
      try {
        await deleteInstructor(instructor.id);
        loadInstructors();
        alert('Instructor deleted successfully!');
      } catch (error) {
        alert('Error deleting instructor: ' + error.message);
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ background: 'linear-gradient(90deg, #9d4edd, #7b2cbf)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700', marginBottom: '1rem' }}>Instructors</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', fontSize: '18px', color: '#e5e5e5' }}>
            Loading...
          </div>
        ) : (
          <>
            <button className="btn btn-primary" onClick={() => { setEditingItem(null); setShowForm(true); }}>Add Instructor</button>
            {showForm && (
              <InstructorForm
                onSubmit={handleSubmitInstructor}
                onCancel={() => { setShowForm(false); setEditingItem(null); }}
                initialValues={editingItem || {}}
              />
            )}
            {filteredInstructors.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Specialty</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstructors.map((instructor) => (
                      <tr key={instructor.id}>
                        <td>{instructor.name}</td>
                        <td>{instructor.specialty}</td>
                        <td>
                          <button onClick={() => handleEdit(instructor)} className="btn btn-warning btn-sm">Edit</button>
                          <button onClick={() => handleDelete(instructor)} className="btn btn-danger btn-sm" style={{ marginLeft: '0.5rem' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#e5e5e5', textAlign: 'center', marginTop: '2rem' }}>No instructors available.</p>
            )}
            {searchTerm && searchType === 'instructor' && filteredInstructors.length === 0 && (
              <p style={{ color: '#ff4d6d', textAlign: 'center' }}>No instructors found matching "{searchTerm}"</p>
            )}
            {searchTerm && searchType !== 'instructor' && (
              <p style={{ color: '#aaa', textAlign: 'center' }}>Search for {searchType}s on the {searchType}s page.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Instructors;
