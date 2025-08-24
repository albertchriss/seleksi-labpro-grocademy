import os
import csv
from faker import Faker
import random

# Initialize Faker
fake = Faker()

# --- Configuration ---
NUM_USERS = 20
NUM_COURSES = 20
MODULES_PER_COURSE = 20
TRANSACTIONS_TO_GENERATE = 30

# --- Output Directory ---
output_dir = 'src/database/seed/csv'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# --- Generate Users and Accounts ---
users = []
accounts = []
for i in range(NUM_USERS):
    first_name = fake.first_name()
    last_name = fake.last_name()
    email = fake.unique.email()
    username = f"chris{i}"
    user = {
        'id': fake.uuid4(),
        'email': email,
        'username': username,
        'first_name': first_name,
        'last_name': last_name,
        'balance': random.randint(0, 1000),
        'profile_pic': None
    }
    users.append(user)

    account = {
        'userId': user['id'],
        'email': email,
        'username': username,
        'password': 'password123',
        'role': 'user'
    }
    accounts.append(account)

admin_user = {
    'id': fake.uuid4(),
    'email': 'achrisp05@gmail.com',
    'username': 'chris',
    'first_name': 'Chris',
    'last_name': 'Poandy',
    'balance': 1090,
    'profile_pic': None
}

admin_acc = {
    'userId': admin_user['id'],
    'email': admin_user['email'],
    'username': admin_user['username'],
    'password': 'password',
    'role': 'admin'
}

users.append(admin_user)
accounts.append(admin_acc)

# --- Generate Courses and Modules ---
courses = []
modules = []
for i in range(NUM_COURSES):
    # Create the list of topics first
    topics_list = [fake.word() for _ in range(random.randint(2, 5))]

    course = {
        'id': f'course_{i}',
        'title': fake.catch_phrase(),
        'description': fake.text(),
        'instructor': fake.name(),
        'topics': "{" + ",".join(topics_list) + "}",
        'price': round(random.uniform(10.0, 200.0), 2),
        'thumbnail_image': None,
    }
    courses.append(course)

    for j in range(MODULES_PER_COURSE):
        module = {
            'id': f'module_{i}_{j}',
            'title': f'Module {j + 1}: {fake.sentence(nb_words=4)}',
            'description': fake.text(),
            'order': j + 1,
            'pdf_content': None,
            'video_content': None,
            'courseId': course['id'],
        }
        modules.append(module)

# --- Generate Transactions (Enrollments) ---
transactions = []
user_progress_list = []
existing_enrollments = set() 

if len(users) > 0 and len(courses) > 0:
    while len(transactions) < TRANSACTIONS_TO_GENERATE:
        user = random.choice(users)
        course = random.choice(courses)
        
        if (user['id'], course['id']) in existing_enrollments:
            continue 

        existing_enrollments.add((user['id'], course['id']))

        transaction_id = f'tran_{len(transactions)}'
        transaction = {
            'id': transaction_id,
            'userId': user['id'],
            'courseId': course['id'],
        }
        transactions.append(transaction)

        # --- Generate User Progress ---
        course_modules = [m for m in modules if m['courseId'] == course['id']]
        for module in random.sample(course_modules, k=random.randint(1, len(course_modules))):
            user_progress = {
                'id': f'prog_{transaction_id}_{module["id"]}',
                'transactionId': transaction_id,
                'moduleId': module['id'],
            }
            user_progress_list.append(user_progress)

# --- Write to CSV Files ---
def write_to_csv(filename, data, headers):
    with open(os.path.join(output_dir, filename), 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)

if __name__ == '__main__':
    if users:
        write_to_csv('users.csv', users, ['id', 'email', 'username', 'first_name', 'last_name', 'balance', 'profile_pic'])
    if accounts:
        write_to_csv('accounts.csv', accounts, ['userId', 'email', 'username', 'password', 'role'])
    if courses:
        write_to_csv('courses.csv', courses, ['id', 'title', 'description', 'instructor', 'topics', 'price', 'thumbnail_image'])
    if modules:
        write_to_csv('modules.csv', modules, ['id', 'title', 'description', 'order', 'pdf_content', 'video_content', 'courseId'])
    if transactions:
        write_to_csv('transactions.csv', transactions, ['id', 'userId', 'courseId'])
    if user_progress_list:
        write_to_csv('user_progress.csv', user_progress_list, ['id', 'transactionId', 'moduleId'])

    print("CSV files generated successfully!")

