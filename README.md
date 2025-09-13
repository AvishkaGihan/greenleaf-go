# Greenleaf Go

A monorepo project featuring an admin web interface, backend API, and mobile application.

## Project Structure

- **admin/**: Web admin panel built with Vite and React.
- **api/**: Backend API server.
- **mobile/**: Mobile app using Expo and React Native.

## Getting Started

1. **Clone the repository:**

   ```
   git clone <repository-url>
   cd greenleaf-go
   ```

2. **Install dependencies:**

   - For admin: `cd admin && npm install`
   - For api: `cd api && npm install`
   - For mobile: `cd mobile && npm install`

3. **Run the applications:**
   - Admin: `cd admin && npm run dev`
   - API: `cd api && npm start`
   - Mobile: `cd mobile && npm start`

## Form Validation

The mobile app includes comprehensive form validation using Formik and Yup for consistent and user-friendly error handling.

### Features

- Real-time validation on form fields
- Inline error messages with red styling
- Password strength indicator for sign-up
- Consistent validation across sign-in, sign-up, and edit-profile forms

### Validation Rules

- **Sign-in**: Email format and required password
- **Sign-up**: Name validation, email, strong password, phone (optional), date of birth (optional)
- **Edit-profile**: Required first and last name

### Error Display

Errors are displayed inline below input fields with red text and border highlighting for immediate feedback.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
