from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from datetime import datetime, timedelta
from sqlalchemy.orm import validates
from sqlalchemy import MetaData, Integer, String, Column, ForeignKey, DateTime, CheckConstraint
from flask_sqlalchemy import SQLAlchemy
import re
import jwt
from flask_bcrypt import Bcrypt

# Define naming convention
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

# Create db instance here (remove the import from config)
db = SQLAlchemy(metadata=metadata)
bcrypt = Bcrypt()

class Users(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    password_hash = db.Column(db.String)
    role = db.Column(db.String(50), nullable=False)

    student_profile = db.relationship(
        'Students', back_populates='user', uselist=False, cascade='all, delete-orphan')
    instructor_profile = db.relationship(
        'Instructors', back_populates='user', uselist=False, cascade='all, delete-orphan')

    serialize_rules = ('-student_profile.user', '-instructor_profile.user')

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def generate_token(self):
        payload = {
            'user_id': self.id,
            'user_name': self.username,
            'role': self.role,
            'exp': datetime.utcnow() + timedelta(days=1)
        }
        return jwt.encode(payload, 'secret_key', algorithm='HS256')    
    @staticmethod
    def verify_token(token):
        try:
            payload = jwt.decode(token, 'secret_key', algorithms=['HS256'])
            return Users.query.get(payload['user_id'])
        except: 
            return None

    def __repr__(self):
        return f'<User {self.username} {self.role}>'


class Students(db.Model, SerializerMixin):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    enrolment_year = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('Users', back_populates='student_profile')
    enrollments = db.relationship('Enrollments', back_populates='student', cascade='all, delete-orphan')
    courses = association_proxy('enrollments', 'course')

    serialize_rules = ('-user.student_profile', '-enrollments.student')

    def __repr__(self):
        return f'<Student {self.student_id} {self.name}>'


class Instructors(db.Model, SerializerMixin):
    __tablename__ = 'instructors'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    specialty = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('Users', back_populates='instructor_profile')
    courses = db.relationship('Courses', back_populates='instructor', cascade='all, delete-orphan')

    serialize_rules = ('-user.instructor_profile', '-courses.instructor')

    def __repr__(self):
        return f'<Instructor {self.name} {self.specialty}>'


class Courses(db.Model, SerializerMixin):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    course_code = db.Column(db.String(10), unique=True, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    credit_hours = db.Column(db.Integer, nullable=False)
    max_capacity = db.Column(db.Integer, nullable=False)
    instructor_id = db.Column(db.Integer, db.ForeignKey('instructors.id'), nullable=False)

    instructor = db.relationship('Instructors', back_populates='courses')
    enrollments = db.relationship('Enrollments', back_populates='course', cascade='all, delete-orphan')
    students = association_proxy('enrollments', 'student')

    serialize_rules = ('-instructor.courses', '-enrollments.course')

    def __repr__(self):
        return f'<Course {self.course_code} {self.title}>'

    def current_enrollment(self):
        return len([enrollment for enrollment in self.enrollments if enrollment.status == 'enrolled'])


class Enrollments(db.Model, SerializerMixin):
    __tablename__ = 'enrollments'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    grade = db.Column(db.String(3), nullable=True)
    semester = db.Column(db.String(10), nullable=False)
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(10), nullable=False, default='enrolled')

    student = db.relationship('Students', back_populates='enrollments')
    course = db.relationship('Courses', back_populates='enrollments')

    serialize_rules = ('-student.enrollments', '-course.enrollments')

    def __repr__(self):
        return f'<Enrollment {self.student_id} {self.course_id}>'
    
    __table_args__ = (
        db.UniqueConstraint('student_id', 'course_id', 'semester', name='unique_enrollment_per_semester'),
    )