## ADDED Requirements

### Requirement: Navbar displays user menu dropdown
The navbar SHALL display a user avatar that opens a dropdown menu when clicked.

#### Scenario: User clicks avatar
- **WHEN** user clicks on user avatar in navbar
- **THEN** dropdown menu appears with profile, settings, and logout options

#### Scenario: User clicks outside dropdown
- **WHEN** dropdown is open and user clicks outside
- **THEN** dropdown closes

#### Scenario: User logs out
- **WHEN** user clicks "Logout" in dropdown
- **THEN** user is redirected to login page
- **AND** session is cleared from localStorage

### Requirement: Navbar shows breadcrumb navigation
The navbar SHALL display breadcrumb navigation showing current location.

#### Scenario: Breadcrumb displays on non-homepage
- **WHEN** user is on /dashboard/profile
- **THEN** breadcrumb shows "Home > Profile"

#### Scenario: Breadcrumb hidden on homepage
- **WHEN** user is on /dashboard
- **THEN** breadcrumb is hidden

### Requirement: Navbar has fullscreen toggle
The navbar SHALL have a button to toggle fullscreen mode.

#### Scenario: User clicks fullscreen button
- **WHEN** user clicks fullscreen icon
- **THEN** browser enters fullscreen mode

#### Scenario: User exits fullscreen
- **WHEN** user presses Escape or clicks fullscreen icon again
- **THEN** browser exits fullscreen mode
