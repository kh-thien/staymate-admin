# Auth Feature - Clean Architecture

This authentication feature has been refactored to follow clean architecture principles with proper separation of concerns.

## Architecture Overview

```
src/features/auth/
├── domain/              # Business Logic Layer (Pure)
│   ├── types.js         # Domain types and entities
│   ├── validators.js    # Pure validation functions
│   ├── errorHandler.js  # Error mapping and handling
│   └── index.js         # Domain exports
├── services/            # Data Access Layer
│   └── authServices.jsx # Supabase integration
├── hooks/               # Application Logic Layer
│   ├── useAuthForms.js  # Form business logic hooks
│   ├── usePasswordStrength.js # Password strength hook
│   └── index.js         # Hooks exports
├── components/          # Presentation Layer
│   ├── containers/      # Container components (logic + UI)
│   │   ├── SignInFormContainer.jsx
│   │   ├── SignUpFormContainer.jsx
│   │   └── ForgotPasswordFormContainer.jsx
│   ├── ui/              # Pure UI components (presentational)
│   │   ├── SignInFormUI.jsx
│   │   ├── SignUpFormUI.jsx
│   │   └── ForgotPasswordFormUI.jsx
│   ├── signInForm.jsx   # Main component exports
│   ├── signUpForm.jsx   # (Delegates to containers)
│   ├── forgotPasswordForm.jsx
│   ├── googleButton.jsx # Pure presentational component
│   └── index.js         # Component exports
├── context/             # State Management Layer
│   ├── auth/
│   │   ├── authContext.jsx
│   │   └── authProvider.jsx
│   ├── useAuth.jsx
│   └── index.js
├── pages/               # Route Components
│   ├── signin.jsx
│   ├── signup.jsx
│   ├── forgot.jsx
│   ├── resetPassword.jsx
│   └── confirmedEmail.jsx
└── index.js             # Feature exports
```

## Key Principles Applied

### 1. Separation of Concerns
- **Domain Layer**: Pure business logic without external dependencies
- **Services Layer**: Handles external API calls and data access
- **Hooks Layer**: Manages application state and form logic  
- **UI Layer**: Pure presentation components

### 2. Container/Presentational Pattern
- **Container Components**: Handle business logic and state
- **UI Components**: Pure presentational components that receive props
- **Main Components**: Simple wrappers that delegate to containers

### 3. Domain-Driven Design
- Pure validation functions in domain layer
- Domain types and entities
- Centralized error handling and mapping

### 4. Custom Hooks Pattern
- `useSignInForm`: Manages sign-in form state and logic
- `useSignUpForm`: Manages sign-up form state and logic  
- `useForgotPasswordForm`: Manages password reset flow
- `usePasswordStrength`: Calculates password strength

## Benefits

### ✅ Maintainability
- Clear separation of concerns
- Easy to test individual layers
- Business logic isolated from UI

### ✅ Reusability
- Domain logic can be reused across components
- UI components are pure and reusable
- Custom hooks encapsulate reusable logic

### ✅ Testability
- Pure functions are easy to unit test
- UI components can be tested in isolation
- Business logic is decoupled from framework

### ✅ Scalability
- Easy to add new authentication methods
- Simple to extend validation rules
- Clear structure for adding features

## Usage Examples

### Using Domain Validation
```javascript
import { validateSignUpForm, validateEmail } from '@/features/auth/domain';

const validation = validateSignUpForm(formData, acceptTerms);
if (!validation.isValid) {
  setErrors(validation.errors);
}
```

### Using Custom Hooks
```javascript
import { useSignUpForm } from '@/features/auth/hooks';

const MyCustomSignUpForm = () => {
  const {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  } = useSignUpForm();
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Custom UI implementation */}
    </form>
  );
};
```

### Using UI Components Directly
```javascript
import { SignUpFormUI } from '@/features/auth/components';

const MySignUpContainer = () => {
  // Custom logic here
  
  return (
    <SignUpFormUI
      formData={formData}
      errors={errors}
      isLoading={isLoading}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
};
```

## Migration Notes

The existing components (`SignInForm`, `SignUpForm`, `ForgotPasswordForm`) still work exactly the same from the outside, but now use clean architecture internally. This ensures backward compatibility while providing better maintainability.

All business logic has been extracted from UI components into:
- Domain validators for pure validation logic
- Custom hooks for form state management  
- Error handlers for consistent error handling
- Presentational UI components for pure rendering

The authentication flow and user experience remain identical, but the code is now much more organized and maintainable.