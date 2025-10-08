import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const StudentForm = ({ onSubmit, onCancel, initialValues = {} }) => {
    const formik = useFormik({
        initialValues: {
            username: initialValues.username || "",
            email: initialValues.email || "",
            student_id: initialValues.student_id || "",
            major: initialValues.major || "Computer Science",
            enrollment_year: initialValues.enrollment_year || 2024
        },
        validationSchema: Yup.object({
            username: Yup.string().required("Required"),
            email: Yup.string().email("Invalid email").required("Required"),
            student_id: Yup.string().required("Required").matches(/^S\d{3}$/, 'Format: S001'),
            major: Yup.string().required("Required"),
        }),
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="card" style={{ marginTop: "1rem" }}>
            <h3 style={{ background: 'linear-gradient(90deg, #9d4edd, #7b2cbf)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700', marginBottom: '1rem' }}>
                {initialValues.id ? 'Edit Student' : 'Add New Student'}
            </h3>

            <div className="form-group">
                <label>Username</label>
                <input
                    type="text"
                    name="username"
                    className="form-control"
                    {...formik.getFieldProps("username")}
                    />
                {formik.touched.username && formik.errors.username && <div className="error">{formik.errors.username}</div>}
            </div>

            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    className="form-control"
                    {...formik.getFieldProps("email")}
                    />
                {formik.touched.email && formik.errors.email && <div className="error">{formik.errors.email}</div>}
            </div>

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
                <label>Major</label>
                <select name="major" className="form-control" {...formik.getFieldProps("major")}>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Biology">Biology</option>
                    </select>
                    </div>

                    <button type="submit" className="btn btn-success">
                        {initialValues.id ? 'Update Student' : 'Create Student'}
                    </button>
                    {onCancel && (
                        <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ marginLeft: "0.5rem" }}>Cancel</button>
                    )}
        </form>
    );
};

export default StudentForm;