
import os
import django
import sys

# Setup Django environment
sys.path.append('/home/musabsting/AntigravityProjects/unviversity_system_management/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.academic.models import Course, Department
from apps.accounts.models import User, UserRole

def debug_create():
    try:
        # Get a supervisor
        supervisor = User.objects.filter(role=UserRole.SUPERVISOR).first()
        if not supervisor:
            print("No supervisor found")
            return

        dept = supervisor.supervised_department
        if not dept:
            print("Supervisor has no department")
            return


        print(f"Attempting to create course for Dept: {dept.name_ar}, Supervisor: {supervisor.username}")

        # Simulate perform_create logic
        try:
            if supervisor.supervised_department:
                print(f"Found department: {supervisor.supervised_department}")
                # Create a test course
                course = Course.objects.create(
                    code='DEBUG101',
                    name_ar='Debug Course',
                    department=supervisor.supervised_department,
                    academic_year=1,
                    semester=1,
                    credits=3
                )
                print(f"Course created successfully: {course}")
                course.delete()
            else:
                print("No department found (logic branch)")
        except Exception as e:
            print(f"Caught expected exception in logic: {e}")
            
    except Exception as e:
        print("Caught Exception:")
        print(e)
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_create()
