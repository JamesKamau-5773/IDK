#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc, sample

# Remote library imports
from faker import Faker
from datetime import datetime

# Local imports
from app import app
from models import db, Users, Students, Instructors, Courses, Enrollments

fake = Faker()

def clear_data():
    print("Clearing data...")
    db.drop_all()
    db.create_all()

def create_users():
    print("Creating users...")
    users = []

    # Create 5 instructors
    for _ in range(5):
        user = Users(
            username=fake.user_name(),
            email=fake.email(),
            role='instructor'
        )
        user.set_password(fake.password(length=12))
        users.append(user)

    # Create 20 students
    for _ in range(20):
        user = Users(
            username=fake.user_name(),
            email=fake.email(),
            role='student'
        )
        user.set_password(fake.password(length=12))
        users.append(user)

    # Add test user
    test_user = Users(
        username='testuser',
        email='test@example.com',
        role='student'
    )
    test_user.set_password('password123')
    users.append(test_user)

    db.session.add_all(users)
    db.session.commit()
    return users

def create_instructors(users):
    print("Creating instructors...")
    instructors = []

    instructor_users = [user for user in users if user.role == 'instructor']

    specialties = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science']

    for user in instructor_users:
        instructor = Instructors(
            name=fake.name(),
            specialty=rc(specialties),
            user_id=user.id
        )
        instructors.append(instructor)

    db.session.add_all(instructors)
    db.session.commit()
    return instructors

def create_students(users):
    print("Creating students...")
    students = []
    student_users = [user for user in users if user.role == 'student']

    for user in student_users:
        student = Students(
            name=fake.name(),
            age=randint(18, 25),
            student_id=f"STU{fake.unique.random_int(min=1000, max=9999)}",
            enrolment_year=randint(2020, 2023),
            user_id=user.id
        )
        students.append(student)

    db.session.add_all(students)
    db.session.commit()
    return students

def create_courses(instructors):
    print("Creating courses...")
    courses_data = [
        {
            'title': 'Mathematics',
            'course_code': 'MTH101',
            'description': 'Introduction to Mathematics',
            'credit_hours': 3,
            'max_capacity': 30,
        },
        {
            'title': 'Physics',
            'course_code': 'PHY101',
            'description': 'Introduction to Physics',
            'credit_hours': 3,
            'max_capacity': 30,
        },
        {
            'title': 'Chemistry',
            'course_code': 'CHM101',
            'description': 'Introduction to Chemistry',
            'credit_hours': 3,
            'max_capacity': 30,
        },
        {
            'title': 'Biology',
            'course_code': 'BIO101',
            'description': 'Introduction to Biology',
            'credit_hours': 3,
            'max_capacity': 30,
        },
        {
            'title': 'Computer Science',
            'course_code': 'CSC101',
            'description': 'Introduction to Computer Science',
            'credit_hours': 3,
            'max_capacity': 30,
        }
    ]

    courses = []

    for course_data in courses_data:
        course = Courses(
            title=course_data['title'],
            course_code=course_data['course_code'],
            description=course_data['description'],
            credit_hours=course_data['credit_hours'],
            max_capacity=course_data['max_capacity'],
            instructor_id=rc(instructors).id
        )
        courses.append(course)

    db.session.add_all(courses)
    db.session.commit()
    return courses

def create_enrollments(students, courses):
    print("Creating enrollments...")
    enrollments = []
    semesters = ['phase1', 'phase2', 'phase3']
    grades = ['A', 'B', 'C', 'D', 'F']
    statuses = ['enrolled', 'completed', 'dropped']

    for student in students:
        # Ensure we don't try to sample more courses than available
        max_possible = min(6, len(courses))
        num_courses = randint(3, max_possible) if max_possible >= 3 else len(courses)
        
        if num_courses > 0 and len(courses) >= num_courses:
            student_courses = sample(courses, num_courses)

            for course in student_courses:
                semester = rc(semesters)
                status = rc(statuses)
                grade = rc(grades) if status == 'completed' else None

                enrollment = Enrollments(
                    student_id=student.id,
                    course_id=course.id,
                    grade=grade,
                    semester=semester,
                    enrollment_date=fake.date_time_between(start_date='-1y', end_date='now'),
                    status=status,
                )
                enrollments.append(enrollment)

    db.session.add_all(enrollments)
    db.session.commit()
    return enrollments

def main():
    with app.app_context():
        print("Starting seed data generation...")

        clear_data()

        users = create_users()
        instructors = create_instructors(users)
        students = create_students(users)
        courses = create_courses(instructors)
        enrollments = create_enrollments(students, courses)

        print("Seed data generation complete!")
        print(f"Created: {len(users)} users, {len(instructors)} instructors, "
              f"{len(students)} students, {len(courses)} courses, "
              f"{len(enrollments)} enrollments")

if __name__ == '__main__':
    main()