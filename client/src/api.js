const API_URL = 'http://localhost:5001/api';

const getToken = () => localStorage.getItem('token');

const fetchData = async (endpoint, options = {}) => {
  const token = getToken();
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401 && !endpoint.startsWith('/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

export const signup = (data) => fetchData('/auth/signup', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const login = (data) => fetchData('/auth/login', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const getCourses = () => fetchData('/courses');
export const createCourse = (data) => fetchData('/courses', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const updateCourse = (id, data) => fetchData(`/courses/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
});
export const deleteCourse = (id) => fetchData(`/courses/${id}`, {
  method: 'DELETE',
});

export const getStudents = () => fetchData('/students');
export const getStudent = (id) => fetchData(`/students/${id}`);
export const createStudent = (data) => fetchData('/students', {
  method: 'POST',
  body: JSON.stringify(data),
});
export const updateStudent = (id, data) => fetchData(`/students/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
});
export const deleteStudent = (id) => fetchData(`/students/${id}`, {
  method: 'DELETE',
});

export const getInstructors = () => fetchData('/instructors');
export const createInstructor = (data) => fetchData('/instructors', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const updateInstructor = (id, data) => fetchData(`/instructors/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
});
export const deleteInstructor = (id) => fetchData(`/instructors/${id}`, {
  method: 'DELETE',
});

export const getEnrollments = () => fetchData('/enrollments');
export const createEnrollment = (data) => fetchData('/enrollments', {
  method: 'POST',
  body: JSON.stringify(data),
});
export const updateEnrollment = (id, data) => fetchData(`/enrollments/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
});
export const deleteEnrollment = (id) => fetchData(`/enrollments/${id}`, {
  method: 'DELETE',
});
