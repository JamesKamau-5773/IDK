from flask import request
from flask_restful import Resource
from models import db, Users, Students, Instructors, Courses, Enrollments
from datetime import datetime
import jwt
import flask_bcrypt as Bcrypt


class UsersResource(Resource):
    def get(self):
        users = Users.query.all()
        return [user.to_dict() for user in users], 200

    def post(self):
        data = request.get_json()
        try:
            user = Users(
                username=data['username'],
                email=data['email'],
                password_hash=data['password_hash'],
                role=data['role']
            )
            db.session.add(user)
            db.session.commit()
            return user.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 400

class SighnupResource(Resource):
    def post(self):
        data = request.get_json()

        if not data.get('name') or not data.get('password') or not data.get('email'):
            return {'error': 'Name, email and password are required'}, 400

        if Users.query.filter_by(username=data['name']).first():
            return {'error': 'Username already exists'}, 400

        if Users.query.filter_by(email=data['email']).first():
            return {'error': 'Email already exists'}, 400

        try:

            user = Users(
               username=data['name'],
               email=data['email'],
               role='student'

            )

            user.set_password(data['password'])

            db.session.add(user)
            db.session.commit()
            token = user.generate_token()
            return{
                'user': user.to_dict(),
                'token': token
            }

        except Exception as e:
            return {'error': str(e)}, 400

class LoginResource(Resource):
    def post(self):
        data = request.get_json()

        if not data.get ('email') or not data.get ('password'):
            return {'error': 'Email and password are required'}, 400

        user=Users.query.filter_by(email=data['email']).first()

        if not user or not user.check_password(data['password']):
            return {'error': 'Invalid email or password'}, 401

        token = user.generate_token()
        return{
            'user': user.to_dict(),
            'token': token
        }, 200

class LogoutResource(Resource):
    def post(self):
        return {'message': 'Logout successful'}, 200     
        
            
        
        
        
        
        

class UserByIdResource(Resource):
    def get(self, user_id):
        user = Users.query.get_or_404(user_id)
        return user.to_dict(), 200

    def patch(self, user_id):
        user = Users.query.get_or_404(user_id)
        data = request.get_json()
        try:
            for attr, value in data.items():
                if hasattr(user, attr):
                    setattr(user, attr, value)
            db.session.commit()
            return user.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 400

    def delete(self, user_id):
        user = Users.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return {'message': 'User deleted successfully'}, 200


class StudentsResource(Resource):
    def get(self):
        students = Students.query.all()
        return [student.to_dict() for student in students], 200

    def post(self):
        data = request.get_json()
        try:
            # Create user first
            user = Users(
                username=data['username'],
                email=data['email'],
                role='student'
            )
            user.set_password('defaultpassword')  # Or handle password
            db.session.add(user)
            db.session.flush()  # To get user.id

            # Create student
            student = Students(
                name=data['username'],  # Assuming name is username
                age=18,  # Default age
                student_id=data['student_id'],
                enrolment_year=data['enrollment_year'],
                user_id=user.id
            )
            db.session.add(student)
            db.session.commit()
            return student.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400


class StudentByIdResource(Resource):
    def get(self, student_id):
        student = Students.query.get_or_404(student_id)
        return student.to_dict(), 200

    def patch(self, student_id):
        student = Students.query.get_or_404(student_id)
        data = request.get_json()
        try:
            for attr, value in data.items():
                if hasattr(student, attr):
                    setattr(student, attr, value)
            db.session.commit()
            return student.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 400

    def delete(self, student_id):
        student = Students.query.get_or_404(student_id)
        db.session.delete(student)
        db.session.commit()
        return {'message': 'Student deleted successfully'}, 200


class CoursesResource(Resource):
    def get(self):
        courses = Courses.query.all()
        return [course.to_dict() for course in courses], 200

    def post(self):
        data = request.get_json()
        try:
            course = Courses(
                title=data['title'],
                course_code=data['course_code'],
                description=data['description'],
                credit_hours=data['credit_hours'],
                max_capacity=data['max_capacity'],
                instructor_id=data['instructor_id']
            )
            db.session.add(course)
            db.session.commit()
            return course.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 400


class CourseByIdResource(Resource):
    def get(self, course_id):
        course = Courses.query.get_or_404(course_id)
        return course.to_dict(), 200

    def patch(self, course_id):
        course = Courses.query.get_or_404(course_id)
        data = request.get_json()
        try:
            for attr, value in data.items():
                if hasattr(course, attr):
                    setattr(course, attr, value)
            db.session.commit()
            return course.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 400

    def delete(self, course_id):
        course = Courses.query.get_or_404(course_id)
        db.session.delete(course)
        db.session.commit()
        return {'message': 'Course deleted successfully'}, 200


class EnrollmentsResource(Resource):
    def get(self):
        enrollments = Enrollments.query.all()
        return [enrollment.to_dict() for enrollment in enrollments], 200

    def post(self):
        data = request.get_json()
        try:
            enrollment = Enrollments(
                student_id=data['student_id'],
                course_id=data['course_id'],
                grade=data.get('grade'),
                semester=data['semester'],
                enrollment_date=data.get('enrollment_date', datetime.utcnow()),
                status=data.get('status', 'enrolled')
            )
            db.session.add(enrollment)
            db.session.commit()
            return enrollment.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 400


class EnrollmentByIdResource(Resource):
    def get(self, enrollment_id):
        enrollment = Enrollments.query.get_or_404(enrollment_id)
        return enrollment.to_dict(), 200

    def patch(self, enrollment_id):
        enrollment = Enrollments.query.get_or_404(enrollment_id)
        data = request.get_json()
        try:
            for attr, value in data.items():
                if hasattr(enrollment, attr):
                    setattr(enrollment, attr, value)
            db.session.commit()
            return enrollment.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 400

    def delete(self, enrollment_id):
        enrollment = Enrollments.query.get_or_404(enrollment_id)
        db.session.delete(enrollment)
        db.session.commit()
        return {'message': 'Enrollment deleted successfully'}, 200


class CourseEnrollmentsResource(Resource):
    def get(self, course_id):
        course = Courses.query.get_or_404(course_id)
        return [enrollment.to_dict() for enrollment in course.enrollments], 200


class StudentEnrollmentsResource(Resource):
    def get(self, student_id):
        student = Students.query.get_or_404(student_id)
        return [enrollment.to_dict() for enrollment in student.enrollments], 200


class InstructorsResource(Resource):
    def get(self):
        instructors = Instructors.query.all()
        return [instructor.to_dict() for instructor in instructors], 200

    def post(self):
        data = request.get_json()
        try:
            # Create user first
            user = Users(
                username=data['username'],
                email=data['email'],
                role='instructor'
            )
            user.set_password('defaultpassword')  # Or handle password
            db.session.add(user)
            db.session.flush()  # To get user.id

            # Create instructor
            instructor = Instructors(
                name=data['name'],
                specialty=data['specialty'],
                user_id=user.id
            )
            db.session.add(instructor)
            db.session.commit()
            return instructor.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400


class InstructorByIdResource(Resource):
    def get(self, instructor_id):
        instructor = Instructors.query.get_or_404(instructor_id)
        return instructor.to_dict(), 200

    def patch(self, instructor_id):
        instructor = Instructors.query.get_or_404(instructor_id)
        data = request.get_json()
        try:
            for attr, value in data.items():
                if hasattr(instructor, attr):
                    setattr(instructor, attr, value)
            db.session.commit()
            return instructor.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 400

    def delete(self, instructor_id):
        instructor = Instructors.query.get_or_404(instructor_id)
        db.session.delete(instructor)
        db.session.commit()
        return {'message': 'Instructor deleted successfully'}, 200


class InstructorCoursesResource(Resource):
    def get(self, instructor_id):
        instructor = Instructors.query.get_or_404(instructor_id)
        return [course.to_dict() for course in instructor.courses], 200
