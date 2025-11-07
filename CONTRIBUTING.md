# Contributing to NSE IPO Automation

Thank you for considering contributing to this project! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior vs actual behavior
4. Error messages (if any)
5. Screenshots (if applicable)
6. Your Google Apps Script version and browser

### Suggesting Enhancements

We welcome feature requests! Please open an issue with:
1. A clear description of the feature
2. Why it would be useful
3. How it should work
4. Examples of similar features (if applicable)

### Code Contributions

#### Before You Start

1. Check existing issues and pull requests to avoid duplication
2. For major changes, open an issue first to discuss your approach
3. Fork the repository and create a feature branch

#### Development Process

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/NSE-Scrap.git
   cd NSE-Scrap
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Write clear, commented code
   - Follow the existing code style
   - Test your changes thoroughly

5. **Test your changes**
   - Copy the script to Google Apps Script
   - Test with different scenarios
   - Ensure no errors in the logs
   - Verify data accuracy

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: brief description of changes"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Provide a clear description of changes

#### Commit Message Guidelines

Use clear, descriptive commit messages:

- `Add: new feature or functionality`
- `Fix: bug fix`
- `Update: changes to existing features`
- `Refactor: code restructuring`
- `Docs: documentation updates`
- `Test: adding or updating tests`

Examples:
```
Add: support for filtering by company name
Fix: handle empty response from NSE API
Update: improve error messages for users
Docs: add troubleshooting section to README
```

## Code Style Guidelines

### JavaScript/Google Apps Script

1. **Naming Conventions**
   - Functions: camelCase (`fetchNSEData`, `parseIPOData`)
   - Constants: UPPER_SNAKE_CASE (`NSE_IPO_URL`, `CACHE_DURATION_MINUTES`)
   - Variables: camelCase (`ipoArray`, `responseCode`)

2. **Documentation**
   - Add JSDoc comments for all functions
   - Explain complex logic with inline comments
   - Keep comments up-to-date with code changes

3. **Code Organization**
   - Group related functions together
   - Keep functions focused and single-purpose
   - Use meaningful variable and function names

4. **Error Handling**
   - Use try-catch blocks for API calls
   - Provide user-friendly error messages
   - Log detailed errors for debugging

### Example Function Documentation

```javascript
/**
 * Fetches IPO data from NSE India API
 * Uses proper headers to bypass anti-scraping measures
 *
 * @param {string} category - 'all', 'current', 'past', or 'upcoming'
 * @return {Object} Parsed JSON data from NSE
 * @throws {Error} If NSE API returns non-200 status
 */
function fetchNSEData(category = 'all') {
  // Function implementation
}
```

## Areas for Contribution

Here are some areas where contributions would be especially valuable:

### High Priority

1. **NSE API Monitoring**
   - Monitor for changes to NSE's API structure
   - Update script when API changes
   - Add alerts for API failures

2. **Error Handling**
   - Improve error messages
   - Add retry logic for failed requests
   - Handle edge cases better

3. **Data Validation**
   - Verify data accuracy
   - Add data validation checks
   - Handle malformed responses

### Medium Priority

1. **Features**
   - Add more filtering options
   - Export data to different formats (CSV, PDF)
   - Add charting and visualization
   - Email notifications for new IPOs

2. **Performance**
   - Optimize data fetching
   - Reduce script execution time
   - Improve caching strategy

3. **Documentation**
   - Add video tutorials
   - Create more examples
   - Translate documentation

### Low Priority

1. **UI Improvements**
   - Custom sidebar for controls
   - Better formatting options
   - Interactive dashboard

2. **Testing**
   - Unit tests for functions
   - Integration tests
   - Mock API responses for testing

## Testing Your Changes

Before submitting a pull request:

1. **Manual Testing**
   - Test all menu functions
   - Try with different sheet configurations
   - Test error scenarios
   - Verify data accuracy against NSE website

2. **Edge Cases**
   - Empty responses
   - Network timeouts
   - Invalid data formats
   - Rate limiting

3. **Browser Compatibility**
   - Test in Chrome
   - Test in Firefox
   - Test in Safari
   - Test in Edge

## Questions?

If you have questions about contributing:
1. Check existing issues and discussions
2. Review the [README](README.md) and [SETUP_GUIDE](SETUP_GUIDE.md)
3. Open an issue with your question

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and beginners
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other unprofessional conduct

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers this project.

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- README acknowledgments section
- Release notes (for significant contributions)

Thank you for contributing to make this project better!
