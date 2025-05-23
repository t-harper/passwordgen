# CLAUDE.md - Development Context

This file contains important context and reminders for Claude Code when working on this project.

## Project Overview
This is a React TypeScript password generator application that creates secure passwords entirely client-side. No data is ever transmitted to servers.

## Key Architecture Decisions

### Password Generation Algorithm
- Uses `crypto.getRandomValues()` for cryptographically secure random number generation
- Character pool building: symbols + letters + numbers based on user options
- Sequential pattern detection using predefined arrays of 3-character sequences
- Duplicate character prevention using a `Set<string>` to track used characters
- Similar character exclusion: `'0O1lI|`'` characters are filtered out when enabled

### State Management
- Uses React `useState` for all component state
- Settings persistence via `localStorage` when user opts in
- Cookie consent stored in `localStorage` as 'cookieConsent' key
- No external state management library needed for this simple app

### Testing Strategy
- Jest + React Testing Library for unit tests
- 88% code coverage achieved
- Tests cover all password generation options and UI interactions
- Uses `fireEvent.change()` instead of `userEvent.type()` to avoid input concatenation issues
- Mocks `navigator.clipboard.writeText` for copy functionality tests
- Uses Node's `webcrypto` implementation to provide crypto API in test environment

## Build & Development Commands

### Core Commands
```bash
npm start          # Development server (localhost:3000)
npm test           # Run test suite
npm run build      # Production build
npm test -- --coverage --watchAll=false  # Run tests with coverage report
```

### Git Workflow
- Repository: https://github.com/t-harper/passwordgen.git
- Main branch: `master`
- Use descriptive commit messages with feature summaries
- Always include Claude Code attribution in commits

### Docker Support
```bash
# Build and run production image
docker build -t passwordgen .
docker run -p 8080:80 passwordgen

# Using docker-compose for production
docker-compose up -d

# Using docker-compose for development
docker-compose --profile dev up

# Build with specific tag
docker build -t passwordgen:v1.1.0 .

# Run with custom port
docker run -p 3000:80 passwordgen
```

#### Docker Features
- Multi-stage build for optimized image size (~25MB)
- Non-root nginx user for security
- Health checks included
- Gzip compression enabled
- Security headers configured
- Efficient caching strategy
- Both production and development configurations

## Important File Locations

### Core Components
- `src/PasswordGenerator.tsx` - Main component with all logic
- `src/PasswordGenerator.test.tsx` - Comprehensive test suite
- `src/App.tsx` - Simple wrapper component
- `public/index.html` - HTML template with proper title and meta description

### Configuration
- `package.json` - Dependencies and scripts
- `README.md` - Project documentation
- `LICENSE` - MIT license
- This file (`CLAUDE.md`) - Development context

## UI/UX Design Patterns

### Accessibility Features
- **Skip Link**: "Skip to main content" link for keyboard navigation
- **ARIA Labels**: All interactive elements have descriptive labels
- **ARIA Describedby**: Form controls linked to help text
- **ARIA Live Regions**: Dynamic content announced to screen readers
- **Semantic HTML**: Proper use of header, main, footer, section, and article elements
- **Keyboard Support**: Full keyboard navigation with visible focus indicators
- **Screen Reader Support**: Visually hidden content and atomic updates
- **Role Attributes**: Proper roles for regions, lists, alerts, and content info
- **Focus Management**: Automatic focus to password list after generation

### Styling Approach
- Inline styles using React style objects (no external CSS framework)
- Consistent color palette: blues (#3b82f6), grays (#f9fafb, #374151)
- Card-based sections with subtle shadows and borders
- Responsive grid layouts using CSS Grid
- Help text in muted gray (#6b7280) below form controls
- Focus indicators with clear outlines for keyboard navigation

### Component Structure
```typescript
interface PasswordOptions {
  length: number;
  includeNumbers: boolean;
  includeLowercase: boolean;
  includeUppercase: boolean;
  beginWithLetter: boolean;
  excludeSimilar: boolean;
  noDuplicates: boolean;
  removeSequential: boolean;
  customSymbols: string;
}

interface ExtendedOptions extends PasswordOptions {
  saveSettings: boolean;
}
```

## Known Limitations & Considerations

### Security
- Uses `crypto.getRandomValues()` for cryptographically secure random number generation
- Provides true cryptographic randomness via the Web Crypto API
- Ensures generated passwords have maximum entropy and unpredictability

### Browser Compatibility
- Requires modern browser with ES6+ support
- Uses localStorage (IE8+ support)
- Clipboard API used for copy functionality (modern browsers only)

### Performance
- No performance optimization needed for this small app
- Password generation is synchronous and fast
- No virtualization needed for 5-password display

## Test Maintenance Notes

### Common Test Issues
1. **Title Changes**: When updating app title, remember to update both:
   - `src/PasswordGenerator.test.tsx` - Component title test
   - `src/App.test.tsx` - App integration test

2. **Input Testing**: Use `fireEvent.change()` for input value changes:
   ```typescript
   fireEvent.change(lengthInput, { target: { value: '30' } });
   ```
   Avoid `userEvent.type()` which can cause concatenation issues.

3. **Checkbox Testing**: Cast to HTMLInputElement when checking state:
   ```typescript
   expect((screen.getByLabelText(/Save Settings/) as HTMLInputElement).checked).toBe(true);
   ```

### Test Coverage Goals
- Maintain >85% statement coverage
- All password generation options must be tested
- UI interactions (clicks, form changes) must be tested
- Settings persistence behavior must be tested

## Deployment Notes

### GitHub Pages / Static Hosting
- Run `npm run build` to create production bundle
- Deploy `build/` folder contents to static host
- No server-side requirements
- All processing happens client-side

### SEO Considerations
- Title: "Secure Password Generator"
- Meta description emphasizes privacy and client-side generation
- Keywords: password, generator, secure, privacy, client-side

## Privacy & Compliance

### Data Handling
- **NO server communication** for password generation
- **Google Analytics** for site usage statistics only
- **NO password storage** (passwords never leave the browser)
- **NO password data tracked** (Google Analytics never sees generated passwords)
- Settings stored in localStorage only when user consents
- Cookie banner explains localStorage and analytics usage transparently

### GDPR Compliance
- Cookie consent banner implemented
- Clear explanation of data usage (localStorage for settings and Google Analytics for usage)
- User can decline data storage
- Google Analytics respects user consent choice

## Completed Enhancements

### Recently Implemented Features
- ✅ **Dark mode theme toggle** - Full dark/light mode support with persistent preference
- ✅ **Multiple password profiles/templates** - Save and load custom password generation templates
- ✅ **Advanced SEO optimizations** - Schema markup, performance hints, and structured data
- ✅ **Accessibility improvements** - ARIA labels, screen reader support, keyboard navigation
- ✅ **Performance optimizations** - Resource hints, preloading, and efficient rendering

## Future Enhancement Ideas

### Potential Features
- **Password strength meter** - Visual indicator showing password strength in real-time
- **Export functionality** - Export passwords to CSV, JSON, or password manager formats (1Password, Bitwarden, etc.)
- **Internationalization (i18n)** - Multi-language support with locale detection
- **Passphrase generator** - Option to generate memorable passphrases using word lists
- **Password breach checking** - Check if generated passwords appear in known breaches (using k-anonymity)
- **QR code generation** - Generate QR codes for easy mobile transfer of passwords
- **Bulk password generation** - Generate multiple passwords with different criteria simultaneously
- **Password expiry reminders** - Optional reminders to regenerate passwords periodically
- **Keyboard shortcuts** - Power user shortcuts for quick generation and copying
- **Password pronunciation guide** - Help users verbally communicate passwords when needed

### Technical Improvements
- **Progressive Web App (PWA)** - Add service worker for offline functionality and installability
- **WebAssembly integration** - Use WASM for even faster password generation
- **Password history with encryption** - Encrypted local storage of recent passwords (with explicit consent)
- **Advanced pattern detection** - Machine learning-based pattern detection for even stronger passwords
- **Biometric authentication** - Protect saved templates with device biometrics
- **Browser extension** - Create companion browser extension for quick access
- **API endpoint** - Provide secure API for developer integration (with rate limiting)
- **Performance monitoring** - Integrate web vitals tracking and performance analytics
- **A/B testing framework** - Test different UI/UX improvements with users
- **Automated accessibility testing** - Integrate axe-core or similar for continuous a11y testing

### UX/UI Enhancements
- **Interactive password complexity visualizer** - Show character distribution and entropy visually
- **Animated password generation** - Subtle animations during password creation
- **Password copy history** - Track which passwords were copied (session only)
- **Customizable UI themes** - Beyond dark/light, offer multiple color schemes
- **Mobile-optimized gestures** - Swipe to generate, shake to randomize
- **Password strength recommendations** - Context-aware suggestions based on use case
- **Tooltip tutorials** - Interactive guides for first-time users
- **Voice input for settings** - Accessibility feature for setting preferences via voice

### Security Enhancements
- **Two-factor template protection** - Require additional authentication for template access
- **Zero-knowledge proof integration** - Prove password strength without revealing the password
- **Secure password sharing** - Time-limited, encrypted links for sharing passwords
- **Hardware security key support** - Integration with FIDO2/WebAuthn for template protection
- **Client-side password audit** - Check for common patterns and dictionary words locally

## Dependencies to Monitor

### Core Dependencies
- React 18+ (UI framework)
- TypeScript 4.9+ (type safety)
- @testing-library/react (testing utilities)
- @testing-library/user-event (user interaction testing)

### Build Tools
- react-scripts 5.0+ (Create React App tooling)
- Jest (test runner, included with CRA)

### Security Updates
- Regularly check for dependency vulnerabilities: `npm audit`
- Update dependencies monthly unless breaking changes
- Monitor React and TypeScript release notes for migration needs

---

**Last Updated**: January 2025 (Updated with dark mode, templates, SEO optimizations, and completed enhancements tracking)
**Claude Version**: Claude 3.7 Sonnet / Opus 4
**Project Version**: 1.1.0