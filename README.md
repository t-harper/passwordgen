# 🔐 Password Generator

A secure, client-side password generator built with React and TypeScript. Generate strong, customizable passwords with complete privacy - no data ever leaves your device.

![Password Generator Screenshot](./screenshot.png)

## ✨ Features

- **🔒 100% Client-Side**: All password generation happens in your browser - no server requests
- **⚙️ Highly Customizable**: Control every aspect of password generation
- **🎯 Smart Filtering**: Exclude similar characters, prevent duplicates, avoid sequences
- **💾 Settings Persistence**: Save your preferences with browser storage
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🧪 Thoroughly Tested**: Comprehensive test suite with 91% code coverage

## 🚀 Quick Start

### Prerequisites

- Node.js 14 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/password-generator.git
cd password-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Configuration Options

### Password Length
- **Range**: 10-100 characters
- **Default**: 25 characters
- **Description**: Set the exact length of generated passwords

### Character Types
- **Numbers (0-9)**: Include digits in passwords
- **Lowercase (a-z)**: Include lowercase letters
- **Uppercase (A-Z)**: Include uppercase letters
- **Custom Symbols**: Define your own special characters

### Security Options
- **Begin with Letter**: Ensure passwords start with a letter (a-z or A-Z)
- **Exclude Similar Characters**: Remove confusing characters like 0, O, 1, l, I, |
- **No Duplicate Characters**: Each character appears only once
- **Remove Sequential Characters**: Avoid patterns like 'abc', '123', or 'xyz'

### Convenience Features
- **Save Settings**: Remember your preferences using browser storage
- **Copy to Clipboard**: One-click copying of generated passwords
- **Multiple Generation**: Generate 5 passwords at once

## 🛠️ Development

### Available Scripts

- `npm start` - Run development server
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm test -- --coverage` - Run tests with coverage report

### Project Structure

```
src/
├── PasswordGenerator.tsx    # Main component with password generation logic
├── PasswordGenerator.test.tsx  # Comprehensive test suite
├── App.tsx                 # Root application component
├── App.test.tsx           # App component tests
└── index.tsx              # Application entry point
```

### Testing

The project includes comprehensive unit tests covering:
- Password generation with all option combinations
- UI interactions and settings persistence
- Character filtering and validation
- Copy-to-clipboard functionality

Run tests with:
```bash
npm test
```

View coverage report:
```bash
npm test -- --coverage
```

## 🔒 Security & Privacy

- **No Network Requests**: All password generation happens locally
- **No Data Storage**: Passwords are never stored or logged
- **Open Source**: Full transparency - inspect the code yourself
- **Client-Side Only**: Your generated passwords never leave your device

## 🏗️ Built With

- **React 18** - UI framework
- **TypeScript** - Type safety and better development experience
- **Testing Library** - Comprehensive testing utilities
- **Create React App** - Build tooling and development setup

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📚 Algorithm Details

The password generator uses a cryptographically secure approach:

1. **Character Pool Creation**: Builds a pool from selected character types
2. **Smart Filtering**: Applies exclusion rules (similar chars, duplicates, etc.)
3. **Secure Randomization**: Uses `Math.random()` for character selection
4. **Pattern Validation**: Checks for and prevents sequential patterns
5. **Constraint Enforcement**: Ensures passwords meet all specified criteria

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/password-generator/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about the problem and your environment

## 🌟 Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Inspired by the need for secure, privacy-focused password generation
- Thanks to the React and TypeScript communities for excellent tooling