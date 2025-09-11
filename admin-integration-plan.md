# Admin Panel Integration Plan

## Overview

This document outlines the phased approach to integrate the Greenleaf Go admin panel with the backend API and implement all administrative features.

## Current State

- Admin panel is built with React + Vite + Tailwind CSS
- API is built with Node.js + Express + MongoDB
- Admin has UI components but uses mock data
- API has comprehensive endpoints for admin operations

## Phase 1: Setup and Authentication

**Goal**: Establish API connectivity and admin authentication

### Tasks:

1. **Install Dependencies**

   - Add axios for HTTP requests
   - Add react-router-dom for navigation (if not present)
   - Add state management (Context API or Redux)

2. **Create API Service Layer**

   - Set up axios instance with base URL (http://localhost:5000)
   - Implement request/response interceptors for auth tokens
   - Create API service functions for all endpoints

3. **Implement Authentication**

   - Create admin login screen
   - Implement JWT token storage and refresh
   - Add authentication context/state management
   - Protect admin routes with auth guards

4. **Environment Configuration**
   - Add environment variables for API URL
   - Configure CORS for admin domain

### Deliverables:

- Admin login functionality
- API service layer
- Authentication middleware for admin routes

## Phase 2: Dashboard Integration

**Goal**: Connect dashboard to real-time analytics data

### Tasks:

1. **Connect Dashboard API**

   - Integrate with `/admin/dashboard` endpoint
   - Display real metrics (users, accommodations, events, etc.)
   - Implement charts for recent activities

2. **Real-time Updates**

   - Add polling or WebSocket for live data
   - Update dashboard metrics in real-time

3. **Error Handling**
   - Add loading states
   - Implement error boundaries
   - Add retry mechanisms

### Deliverables:

- Live dashboard with real data
- Interactive charts and metrics
- Error handling and loading states

## Phase 3: User Management

**Goal**: Full user administration capabilities

### Tasks:

1. **User List Integration**

   - Connect to `/admin/users` endpoint
   - Implement search and filtering
   - Add pagination support

2. **User Details**

   - Integrate `/admin/users/:id` endpoint
   - Display comprehensive user information
   - Show user statistics and activity history

3. **User Actions**

   - Implement suspend/activate functionality
   - Add bulk operations support
   - User status management

4. **Advanced Filtering**
   - Filter by eco level, registration date, activity status
   - Export user data functionality

### Deliverables:

- Complete user management interface
- Search, filter, and pagination
- User suspension/activation
- User activity tracking

## Phase 4: Content Management

**Goal**: CRUD operations for all content types

### Tasks:

1. **Accommodations Management**

   - Connect to `/accommodations` endpoints
   - Implement create, read, update, delete
   - Add image upload functionality

2. **Restaurants Management**

   - Connect to `/restaurants` endpoints
   - Full CRUD operations
   - Restaurant approval workflow

3. **Events Management**

   - Connect to `/events` endpoints
   - Create new events
   - **Note**: May need to add update/delete routes to API
   - Event approval and moderation

4. **Badges Management**
   - Connect to `/badges` admin endpoints
   - Create, update, delete eco badges
   - Badge assignment logic

### Deliverables:

- Full CRUD for accommodations, restaurants, events
- Badge management system
- Content approval workflows

## Phase 5: Review Moderation

**Goal**: Review management and moderation system

### Tasks:

1. **Review List**

   - Connect to `/admin/reviews` endpoint
   - Display all reviews with status

2. **Moderation Actions**

   - Approve/reject reviews
   - Flag inappropriate content
   - Bulk moderation operations

3. **Review Analytics**
   - Review statistics and trends
   - User review patterns

### Deliverables:

- Review moderation interface
- Approval/rejection workflow
- Review analytics dashboard

## Phase 6: Analytics and Reporting

**Goal**: Comprehensive analytics dashboard

### Tasks:

1. **User Analytics**

   - Connect to `/analytics/users` endpoint
   - User engagement metrics
   - Registration trends

2. **Environmental Impact**

   - Connect to `/analytics/environmental-impact`
   - Carbon footprint calculations
   - Sustainability metrics

3. **Event Analytics**

   - Connect to `/analytics/events`
   - Event participation statistics
   - Success metrics

4. **Advanced Reporting**
   - Custom date ranges
   - Export functionality
   - Scheduled reports

### Deliverables:

- Comprehensive analytics dashboard
- Environmental impact tracking
- Exportable reports

## Phase 7: Additional Features

**Goal**: Complete admin functionality

### Tasks:

1. **Itineraries Management**

   - Connect to itineraries endpoints
   - View and moderate user itineraries
   - Itinerary analytics

2. **Notifications System**

   - Admin notification management
   - Broadcast messages to users
   - Notification templates

3. **System Settings**

   - Global configuration management
   - Feature toggles
   - System maintenance tools

4. **Admin Activity Logging**
   - Track all admin actions
   - Audit trail functionality
   - Admin user management

### Deliverables:

- Itineraries moderation
- Notification management
- System configuration
- Admin audit logs

## Phase 8: Testing and Optimization

**Goal**: Ensure production readiness

### Tasks:

1. **Integration Testing**

   - End-to-end API integration tests
   - User workflow testing
   - Error scenario testing

2. **Performance Optimization**

   - API response caching
   - Image optimization
   - Bundle size optimization

3. **Security Hardening**

   - Input validation
   - XSS protection
   - CSRF protection

4. **Documentation**
   - Admin user guide
   - API documentation updates
   - Troubleshooting guides

### Deliverables:

- Comprehensive test suite
- Optimized performance
- Security audit
- Complete documentation

## Technical Considerations

### API Integration Patterns:

- Use axios interceptors for authentication
- Implement proper error handling with user-friendly messages
- Add loading states for all async operations
- Cache frequently accessed data

### State Management:

- Use React Context for global state
- Implement proper state updates for real-time data
- Handle offline scenarios gracefully

### UI/UX:

- Maintain consistent design with existing mockups
- Add proper loading skeletons
- Implement toast notifications for actions
- Ensure responsive design

### Security:

- Store tokens securely (localStorage with httpOnly cookies if possible)
- Implement token refresh logic
- Add rate limiting for admin actions
- Log all admin activities

## Dependencies to Add:

```json
{
  "axios": "^1.6.0",
  "react-router-dom": "^6.0.0",
  "react-query": "^3.39.0", // Optional for data fetching
  "recharts": "^2.0.0" // For charts
}
```

## Timeline Estimate:

- Phase 1: 1-2 weeks
- Phase 2: 1 week
- Phase 3: 2 weeks
- Phase 4: 3 weeks
- Phase 5: 1 week
- Phase 6: 2 weeks
- Phase 7: 2 weeks
- Phase 8: 1 week

**Total: 13-15 weeks**

## Success Criteria:

- All admin screens connected to live API data
- Full CRUD operations working for all entities
- Real-time dashboard updates
- Comprehensive error handling
- Production-ready security
- Complete test coverage
- Performance optimized for large datasets</content>
  <parameter name="filePath">c:\Users\avish\OneDrive\Documents\Projects\greenleaf-go\admin-integration-plan.md
