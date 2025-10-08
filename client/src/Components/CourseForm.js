import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getInstructors } from "../api";

const CourseForm = ({ onSubmit, onCancel, initialValues = {} }) => {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    const loadInstructors = async () => {
      try {
        const data = await getInstructors();
        setInstructors(data);
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    };
    loadInstructors();
  }, []);

  const formik = useFormik({
    initialValues: {
      title: initialValues.title || "",
      course_code: initialValues.course_code || "",
      description: initialValues.description || "",
      credit_hours: initialValues.credit_hours || "",
      max_capacity: initialValues.max_capacity || "",
      instructor_id: initialValues.instructor_id || "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Required"),
      course_code: Yup.string().required("Required"),
      description: Yup.string().required("Required"),
      credit_hours: Yup.number().required("Required").positive("Must be positive"),
      max_capacity: Yup.number().required("Required").positive("Must be positive"),
      instructor_id: Yup.string().required("Required"),
    }),
    onSubmit: (values) => {
      // Convert string numbers to numbers
      const courseData = {
        ...values,
        credit_hours: parseInt(values.credit_hours),
        max_capacity: parseInt(values.max_capacity),
        instructor_id: parseInt(values.instructor_id),
      };
      onSubmit(courseData);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="card" style={{ marginTop: "1rem" }}>
      <h3 style={{ background: 'linear-gradient(90deg, #9d4edd, #7b2cbf)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700', marginBottom: '1rem' }}>
        {initialValues.id ? 'Edit Course' : 'Add New Course'}
      </h3>

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          name="title"
          className="form-control"
          {...formik.getFieldProps("title")}
        />
        {formik.touched.title && formik.errors.title && <div className="error">{formik.errors.title}</div>}
      </div>

      <div className="form-group">
        <label>Course Code</label>
        <input
          type="text"
          name="course_code"
          className="form-control"
          {...formik.getFieldProps("course_code")}
        />
        {formik.touched.course_code && formik.errors.course_code && <div className="error">{formik.errors.course_code}</div>}
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          className="form-control"
          rows="3"
          {...formik.getFieldProps("description")}
        />
        {formik.touched.description && formik.errors.description && <div className="error">{formik.errors.description}</div>}
      </div>

      <div className="form-group">
        <label>Credit Hours</label>
        <input
          type="number"
          name="credit_hours"
          className="form-control"
          {...formik.getFieldProps("credit_hours")}
        />
        {formik.touched.credit_hours && formik.errors.credit_hours && <div className="error">{formik.errors.credit_hours}</div>}
      </div>

      <div className="form-group">
        <label>Max Capacity</label>
        <input
          type="number"
          name="max_capacity"
          className="form-control"
          {...formik.getFieldProps("max_capacity")}
        />
        {formik.touched.max_capacity && formik.errors.max_capacity && <div className="error">{formik.errors.max_capacity}</div>}
      </div>

      <div className="form-group">
        <label>Instructor</label>
        <select
          name="instructor_id"
          className="form-control"
          {...formik.getFieldProps("instructor_id")}
        >
          <option value="">Select Instructor</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.name} - {instructor.specialty}
            </option>
          ))}
        </select>
        {formik.touched.instructor_id && formik.errors.instructor_id && <div className="error">{formik.errors.instructor_id}</div>}
      </div>

      <button type="submit" className="btn btn-success">
        {initialValues.id ? 'Update Course' : 'Create Course'}
      </button>
      <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ marginLeft: "0.5rem" }}>Cancel</button>
    </form>
  );
};

export default CourseForm;
