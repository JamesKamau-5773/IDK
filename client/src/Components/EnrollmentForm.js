import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const EnrollmentForm = ({ onSubmit, onCancel, initialValues = {} }) => {
    const formik = useFormik({
        initialValues: {
            student_id: initialValues.student_id || "",
            course_id: initialValues.course_id || "",
            grade: initialValues.grade || "",
            semester: initialValues.semester || "Fall 2024",
            status: initialValues.status || "enrolled"
        },
        validationSchema: Yup.object({
            student_id: Yup.string().required("Required"),
            course_id: Yup.string().required("Required"),
            grade: Yup.string(),
            semester: Yup.string().required("Required"),
            status: Yup.string().required("Required"),
        }),
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="card" style={{ marginTop: "1rem" }}>
            <h3 style={{ background: 'linear-gradient(90deg, #9d4edd, #7b2cbf)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700', marginBottom: '1rem' }}>
                {initialValues.id ? 'Edit Enrollment' : 'Add New Enrollment'}
            </h3>

            <div className="form-group">
                <label>Student ID</label>
                <input
                    type="text"
                    name="student_id"
                    className="form-control"
                    {...formik.getFieldProps("student_id")}
                />
                {formik.touched.student_id && formik.errors.student_id && <div className="error">{formik.errors.student_id}</div>}
            </div>

            <div className="form-group">
                <label>Course ID</label>
                <input
                    type="text"
                    name="course_id"
                    className="form-control"
                    {...formik.getFieldProps("course_id")}
                />
                {formik.touched.course_id && formik.errors.course_id && <div className="error">{formik.errors.course_id}</div>}
            </div>

            <div className="form-group">
                <label>Grade</label>
                <input
                    type="text"
                    name="grade"
                    className="form-control"
                    {...formik.getFieldProps("grade")}
                />
                {formik.touched.grade && formik.errors.grade && <div className="error">{formik.errors.grade}</div>}
            </div>

            <div className="form-group">
                <label>Semester</label>
                <select name="semester" className="form-control" {...formik.getFieldProps("semester")}>
                    <option value="Fall 2024">Fall 2024</option>
                    <option value="Spring 2024">Spring 2024</option>
                    <option value="Summer 2024">Summer 2024</option>
                </select>
            </div>

            <div className="form-group">
                <label>Status</label>
                <select name="status" className="form-control" {...formik.getFieldProps("status")}>
                    <option value="enrolled">Enrolled</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                </select>
            </div>

            <button type="submit" className="btn btn-success">
                {initialValues.id ? 'Update Enrollment' : 'Create Enrollment'}
            </button>
            {onCancel && (
                <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ marginLeft: "0.5rem" }}>Cancel</button>
            )}
        </form>
    );
};

export default EnrollmentForm;
