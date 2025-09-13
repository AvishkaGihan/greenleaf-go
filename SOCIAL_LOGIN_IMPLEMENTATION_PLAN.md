# Social Login Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for adding Google and Apple social login/registration to the GreenLeaf mobile app. The plan focuses on simplicity, security, and maintainability.

## Current State Analysis

- ✅ Backend API has basic social login structure (`socialLogin` endpoint)
- ✅ User model supports `googleId` and `appleId` fields
- ✅ Mobile app has UI placeholders for social login buttons
- ❌ No actual OAuth integration implemented
- ❌ Missing proper token verification on backend
- ❌ Missing Expo/React Native social login packages

## Implementation Plan

### Phase 1: Backend API Enhancements

#### Step 1.1: Install Required Dependencies

```bash
# In api/ directory
npm install google-auth-library apple-signin-auth jsonwebtoken
```

#### Step 1.2: Update Environment Variables

Add to `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID_IOS=your_ios_client_id
GOOGLE_CLIENT_ID_ANDROID=your_android_client_id
GOOGLE_CLIENT_ID_WEB=your_web_client_id

# Apple Sign In
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY_PATH=path_to_private_key
```

#### Step 1.3: Create Social Auth Service

Create `api/services/socialAuthService.js`:

- Google token verification function
- Apple token verification function
- User data extraction utilities
- Error handling for invalid tokens

#### Step 1.4: Update Auth Controller

Enhance `authController.js`:

- Replace placeholder `socialLogin` with proper implementation
- Add token verification using social auth service
- Handle user creation/login flow
- Map social provider data to User model
- Generate JWT tokens consistently

#### Step 1.5: Add Validation Middleware

Create `api/middleware/validation/socialAuthValidation.js`:

- Validate social login request structure
- Ensure required fields are present
- Sanitize input data

### Phase 2: Mobile App Implementation

#### Step 2.1: Install Expo Social Login Packages

```bash
# In mobile/ directory
npm install expo-auth-session expo-crypto @react-native-google-signin/google-signin expo-apple-authentication
```

#### Step 2.2: Configure App Configuration

Update `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "your.bundle.identifier"
        }
      ],
      "expo-apple-authentication"
    ],
    "ios": {
      "usesAppleSignIn": true
    }
  }
}
```

#### Step 2.3: Create Social Auth Service

Create `mobile/services/socialAuth.js`:

- Google Sign-In implementation
- Apple Sign-In implementation
- Token handling and API communication
- Error handling and user feedback

#### Step 2.4: Update Auth Context

Enhance `AuthContext.tsx`:

- Add `socialLogin` function
- Handle social login state management
- Integrate with existing authentication flow
- Add proper error handling

#### Step 2.5: Update API Service

Enhance `api.js`:

- Add `socialLogin` API call
- Handle social login response
- Maintain consistency with existing auth flow

#### Step 2.6: Update UI Components

Enhance sign-in and sign-up screens:

- Make Google/Apple buttons functional
- Add loading states
- Handle success/error feedback
- Maintain existing UI design

### Phase 3: Platform-Specific Setup

#### Step 3.1: Google Cloud Console Setup

1. Create/configure Google Cloud project
2. Enable Google Sign-In API
3. Create OAuth 2.0 credentials:
   - iOS app credentials
   - Android app credentials
   - Web app credentials (for token verification)
4. Configure authorized redirect URIs
5. Download configuration files

#### Step 3.2: Apple Developer Setup

1. Configure Sign in with Apple capability
2. Create App ID with Sign in with Apple enabled
3. Generate private key for Apple Sign-In
4. Configure service identifier
5. Set up domain verification

#### Step 3.3: Expo Development Build

Update development workflow:

1. Create development build with new plugins
2. Test on physical devices (required for social login)
3. Configure EAS Build for production

### Phase 4: Testing & Security

#### Step 4.1: Security Implementation

- Implement proper token verification
- Add rate limiting for auth endpoints
- Validate social provider tokens server-side
- Ensure secure storage of credentials
- Add CSRF protection

#### Step 4.2: Error Handling

- Handle network failures gracefully
- Provide user-friendly error messages
- Log errors for debugging
- Implement retry mechanisms

#### Step 4.3: Testing Strategy

- Unit tests for social auth service
- Integration tests for auth flow
- Manual testing on iOS/Android devices
- Test edge cases (cancelled login, invalid tokens)

### Phase 5: User Experience Enhancements

#### Step 5.1: Profile Completion Flow

For new social users:

- Detect incomplete profiles
- Prompt for missing information
- Guide through profile setup
- Maintain eco-friendly onboarding

#### Step 5.2: Account Linking

- Allow linking social accounts to existing accounts
- Handle duplicate email scenarios
- Provide account merge functionality

#### Step 5.3: Settings Integration

- Add social account management in settings
- Allow unlinking social accounts
- Show connected providers

## Implementation Order

### Week 1: Backend Foundation

- [ ] Step 1.1: Install backend dependencies
- [ ] Step 1.2: Configure environment variables
- [ ] Step 1.3: Create social auth service
- [ ] Step 1.4: Update auth controller

### Week 2: Mobile App Integration

- [ ] Step 2.1: Install mobile dependencies
- [ ] Step 2.2: Configure app.json
- [ ] Step 2.3: Create mobile social auth service
- [ ] Step 2.4: Update auth context

### Week 3: Platform Setup & Testing

- [ ] Step 3.1: Google Cloud setup
- [ ] Step 3.2: Apple Developer setup
- [ ] Step 3.3: Development build
- [ ] Step 4.1-4.3: Security & testing

### Week 4: Polish & Enhancement

- [ ] Step 2.5-2.6: Complete mobile UI integration
- [ ] Step 5.1-5.3: UX enhancements
- [ ] Final testing and bug fixes

## Key Considerations

### Security

- Never trust client-side tokens
- Always verify tokens server-side
- Use secure communication (HTTPS)
- Implement proper session management

### User Experience

- Maintain consistent branding
- Provide clear feedback
- Handle errors gracefully
- Keep the flow simple

### Platform Requirements

- iOS requires physical device for Apple Sign-In testing
- Android requires proper SHA-1 fingerprints
- Both platforms need app store configurations

### Privacy Compliance

- Handle user data according to privacy policies
- Implement data deletion capabilities
- Respect user consent preferences
- Follow platform-specific guidelines

## Success Metrics

- Social login success rate > 95%
- User registration conversion improvement
- Reduced authentication-related support tickets
- Positive user feedback on ease of use

## Risk Mitigation

- Maintain traditional email/password as fallback
- Implement comprehensive error handling
- Test thoroughly across devices and OS versions
- Have rollback plan ready

## Resources Needed

- Google Cloud Console access
- Apple Developer Program membership
- Development devices (iOS/Android)
- Testing accounts for each platform

---

_This plan provides a comprehensive roadmap for implementing social login while maintaining the app's eco-friendly focus and user experience standards._
