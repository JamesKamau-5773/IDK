


# Standard library imports
import os

# Remote library imports
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api

# Local imports
from models import db  # Import db from models

#Important resources
from resources import(
    UsersResource,UserByIdResource,StudentsResource,StudentByIdResource,CoursesResource,CourseByIdResource,EnrollmentsResource,EnrollmentByIdResource,CourseEnrollmentsResource,StudentEnrollmentsResource,InstructorsResource,InstructorByIdResource,InstructorCoursesResource,SighnupResource,LoginResource,LogoutResource
)

# Instantiate app, set attributes
app = Flask(__name__)
import os
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(app.root_path, "instance", "app.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
print(f"Instance path: {app.instance_path}")

# Initialize db with app
db.init_app(app)

from models import bcrypt
bcrypt.init_app(app)

migrate = Migrate(app, db)

# Instantiate REST API
api = Api(app)
api.prefix = '/api'

# Instantiate CORS
CORS(app)


# add API routes
api.add_resource(SighnupResource, '/auth/signup')
api.add_resource(LoginResource, '/auth/login')
api.add_resource(LogoutResource, '/auth/logout')
api.add_resource(UsersResource, '/users')
api.add_resource(UserByIdResource, '/users/<int:user_id>')
api.add_resource(StudentsResource, '/students')
api.add_resource(StudentByIdResource, '/students/<int:student_id>')
api.add_resource(CoursesResource, '/courses')
api.add_resource(CourseByIdResource, '/courses/<int:course_id>')
api.add_resource(EnrollmentsResource, '/enrollments')
api.add_resource(EnrollmentByIdResource, '/enrollments/<int:enrollment_id>')
api.add_resource(CourseEnrollmentsResource, '/courses/<int:course_id>/enrollments')
api.add_resource(StudentEnrollmentsResource, '/students/<int:student_id>/enrollments')
api.add_resource(InstructorsResource, '/instructors')
api.add_resource(InstructorByIdResource, '/instructors/<int:instructor_id>')
api.add_resource(InstructorCoursesResource, '/instructors/<int:instructor_id>/courses')

@app.route('/')
def home():
    return 'Course Hub API'

if __name__ == '__main__':
    app.run(debug=True, port=5001)
