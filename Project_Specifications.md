# Introduction
The goal of this project is to improve the security of an existing web application by applying best practices such as authentication, authorization, input validation, and error handling and logging.

It is highly suggested that the existing project is an output from a previous course such as CCAPDEV to lessen the time for development and the focus can be shifted to applying the prescribed security controls. Alternatively, students may also decide to make a new web application from scratch, but must comply with all requirements in this specifications documents upon demonstration.

# User Roles and Permissions
The application must support at least three primary roles, each with different levels of access
control:

• **Administrator**
    o Has the highest level of privilege
    o Can create/delete/assign Role A and administrator accounts
    o The only role that has read-only access to the application logs
• **Role A (Example: Manager)**
    o Has elevated permissions but not full system control
    o Can manage Role B users within their assigned scope such as assigning tasks to them or managing orders
• **Role B (Example: Customer/ Regular Employee)**
    o The most common user role
    o Can view/update/delete their own content/data
    o Limited access to system-wide information, mostly only their own

# Components
• **Frontend** – User Interface
• **Backend** – APIs, business logic implementation, user authentication and authorization, database

# Suggested CRUD Operations

• **Administrator**
    o Add new Administrator and Role A accounts
    o Assign/Change user roles for Administrator and Role A
    o Read-Access and filter comprehensive audit trails of all system activities from the frontend
    o Change password
• **Role A**
    o Add/View/Modify/Remove objects/transactions*
    o Change password
• **Role B**
    o Create account via the registration page
    o Add/View/Modify/Remove own objects/transactions*
    o Change password

Note: Depending on the nature of the application, define your own CRUD operations for these roles. While some permissions may be shared across some or all roles, there must still be permissions unique for each role, particularly in the case of Roles A and B.

# Security Control Requirements

## Authentication
1. Require authentication for all pages and resources, except those specifically intended to be public
2. All authentication controls should fail securely
3. Only cryptographically strong one-way salted hashes of passwords are stored
4. Authentication failure responses should not indicate which part of the authentication data was incorrect. For example, instead of "Invalid username" or "Invalid password", just use "Invalid username and/or password" for both
5. Enforce password complexity requirements established by policy or regulation
6. Enforce password length requirements established by policy or regulation
7. Password entry should be obscured on the user's screen (use of dots or asterisks on the display)
8. Enforce account disabling after an established number of invalid login attempts (e.g., five attempts is common). The account be disabled for a period of time sufficient to discourage brute force guessing of credentials, but not so long as to allow for a denial-ofservice attack to be performed
9. Password reset questions should support sufficiently random answers. (e.g., "favorite book" is a bad question because “The Bible” is a very common answer)
10.  Prevent password re-use
11.  Passwords should be at least one day old before they can be changed, to prevent
attacks on password re-use
12.  The last use (successful or unsuccessful) of a user account should be reported to the user at their next successful login
13.  Re-authenticate users prior to performing critical operations such as password change

## Authorization/Access Control
1. Use a single site-wide component to check access authorization
2. Access controls should fail securely
3. Enforce application logic flows to comply with business rules

## Data Validation
1. All validation failures should result in input rejection. Sanitizing should not be used.
2. Validate data range
3. Validate data length

## Error Handling and Logging
1. Use error handlers that do not display debugging or stack trace information
2. Implement generic error messages and use custom error pages
3. Logging controls should support both success and failure of specified security events
4. Restrict access to logs to only website administrators
5. Log all input validation failures
6. Log all authentication attempts, especially failures
7. Log all access control failures