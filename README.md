# Article Management System

This is a **Django-based Article Management System** with a **frontend**. The project provides features for managing articles, user authentication, and roles (Journalist, Editor, and Admin). It includes both public and private interfaces for users.

---

## Features

### Backend Features (Django):
1. **Custom User Model**:
   - Unique username and email.
   - Default role assigned upon registration (e.g., Journalist).
   - Auto-created profile with additional fields (bio, profile picture, contact info).

2. **Authentication**:
   - Token-based authentication using Django Rest Framework (DRF).
   - Login via username or email.
   - Logout functionality.
   - Password reset via email and change password using the old password.

3. **Roles and Permissions**:
   - **Journalist**:
     - Add and view their own articles.
     - Update their user data.
   - **Editor**:
     - Approve, reject, or publish articles.
     - View all submitted articles.
   - **Admin**:
     - Full control over users, articles, and roles.

4. **Article Management**:
   - CRUD operations for articles.
   - Article statuses: draft, review, approved, rejected, published.
   - Pagination for viewing articles.

5. **API Design**:
   - Separate User and Article APIs.
   - Endpoint structure adhering to REST principles.

---

### Frontend Features (React):
1. **Public Interface**:
   - View published articles.
   - Article details page.

2. **Authentication**:
   - Login and registration pages.
   - Protected dashboard for logged-in users.

3. **User Dashboard**:
   - Role-based functionality (Journalist, Editor, Admin).
   - List of user-specific articles.

4. **Dynamic Components**:
   - Loading spinners for API calls.
   - Pagination for lists.

5. **Responsive Design**:
   - Works seamlessly on desktop and mobile devices.

---

## File Structure

### Backend:
```
project_root/
|
├── api/                # Main app for APIs
│   ├── views.py        # Views for User and Article APIs
│   ├── serializers.py  # DRF serializers
│   ├── urls.py         # API endpoint URLs
│   └── models.py       # Custom User and Article models
│
├── settings.py         # Django project settings
├── urls.py             # Main project URL configurations
└── manage.py           # Django management script
```

### Frontend:
```
frontend/
|
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components (Login, Dashboard, etc.)
│   ├── api/             # API service files
│   ├── App.js           # Main application file
│   └── index.js         # React entry point
|
├── public/              # Static files (HTML, images)
└── package.json         # Node.js dependencies
```

---

## Installation and Setup

### Backend:
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd project_root
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Apply migrations and run the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```


---

## API Endpoints

### User API:
| Method | Endpoint                   | Description                           |
|--------|----------------------------|---------------------------------------|
| POST   | `/api/register/`           | Register a new user                  |
| POST   | `/api/login/`              | Login (via username or email)        |
| POST   | `/api/logout/`             | Logout                               |
| POST   | `/api/password-reset/`     | Request password reset               |
| POST   | `/api/password-change/`    | Change password                      |
| GET    | `/api/users/`              | List all users (Admin only)          |
| GET    | `/api/users/<id>/`         | Get details of a specific user       |
| PUT    | `/api/users/<id>/`         | Update a user's data (Admin only)    |
| DELETE | `/api/users/<id>/`         | Delete a user (Admin only)           |

### Article API:
| Method | Endpoint                      | Description                           |
|--------|-------------------------------|---------------------------------------|
| GET    | `/api/published-articles/`    | List all published articles          |
| GET    | `/api/published-articles/<id>/`| Get details of a published article   |
| POST   | `/api/articles/`              | Create a new article                 |
| PUT    | `/api/articles/<id>/`         | Update an article                    |
| DELETE | `/api/articles/<id>/`         | Delete an article                    |

---

## Technologies Used

### Backend:
- Django
- Django Rest Framework (DRF)


### Frontend:
- Bootstrap

### Other Tools:
- Postman (API testing)
- Thunder Client (API testing)
- Git (version control)

---

## Future Improvements
- Add comments and likes functionality for articles.
- Enhance UI with advanced animations.
- Implement a notification system for role-specific actions.

---
