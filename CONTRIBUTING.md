# 🤝 Contributing to Sports Card Tracker

Thank you for your interest in contributing to Sports Card Tracker! We welcome contributions from the community and are grateful for any help you can provide.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome and support people of all backgrounds
- **Be Collaborative**: Work together to resolve conflicts
- **Be Professional**: Maintain professional conduct in all interactions

## 🚀 Getting Started

1. **Fork the Repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sports-card-tracker.git
   cd sports-card-tracker
   ```

2. **Set Up Remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/sports-card-tracker.git
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🎯 How to Contribute

### 🐛 Reporting Bugs

1. **Check Existing Issues**: Search if the bug has already been reported
2. **Create a New Issue**: Use the bug report template
3. **Include Details**:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/OS information

### 💡 Suggesting Features

1. **Check Roadmap**: Review planned features
2. **Create Feature Request**: Use the feature request template
3. **Provide Context**:
   - Use case description
   - Proposed solution
   - Alternative solutions
   - Mockups if available

### 📝 Improving Documentation

- Fix typos and grammar
- Add missing information
- Improve clarity
- Add examples
- Translate documentation

### 💻 Contributing Code

1. **Find an Issue**: Look for "good first issue" or "help wanted" labels
2. **Comment on Issue**: Let others know you're working on it
3. **Write Code**: Follow our coding standards
4. **Test Thoroughly**: Ensure all tests pass
5. **Submit PR**: Follow the PR template

## 🛠️ Development Setup

### Prerequisites

- Node.js 16+ and npm
- Git
- Code editor (VS Code recommended)

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Servers**
   ```bash
   npm run dev
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Lint Code**
   ```bash
   npm run lint
   ```

### Environment Variables

Create a `.env` file:
```env
PORT=3000
NODE_ENV=development
REACT_APP_API_URL=http://localhost:8000
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update from Upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run All Checks**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

3. **Update Documentation**
   - Add JSDoc comments
   - Update README if needed
   - Add to CHANGELOG

### PR Guidelines

1. **Title Format**: 
   ```
   type(scope): description
   
   Examples:
   feat(cards): add bulk delete functionality
   fix(reports): correct ROI calculation
   docs(api): update endpoint documentation
   ```

2. **Description Template**:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Manual testing completed
   
   ## Screenshots (if applicable)
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

### Review Process

1. Automated checks must pass
2. At least one maintainer review
3. Address review comments
4. Squash commits if requested
5. Maintainer merges PR

## 📏 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good
interface CardData {
  id: string;
  player: string;
  year: number;
  value: number;
}

const calculateROI = (card: CardData): number => {
  return ((card.value - card.purchasePrice) / card.purchasePrice) * 100;
};

// ❌ Bad
const calc = (c: any) => {
  return ((c.val - c.price) / c.price) * 100;
}
```

### React Best Practices

```tsx
// ✅ Good
const CardList: React.FC<Props> = ({ cards, onSelect }) => {
  const sortedCards = useMemo(
    () => cards.sort((a, b) => b.value - a.value),
    [cards]
  );

  return (
    <div className="card-list">
      {sortedCards.map(card => (
        <CardItem key={card.id} card={card} onClick={onSelect} />
      ))}
    </div>
  );
};

// ❌ Bad
function CardList(props) {
  const sorted = props.cards.sort((a, b) => b.value - a.value);
  
  return (
    <div>
      {sorted.map((c, i) => <div key={i}>{c.name}</div>)}
    </div>
  );
}
```

### CSS Standards

```css
/* ✅ Good */
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.card-item {
  background-color: var(--card-bg);
  border-radius: 8px;
  transition: transform 0.2s ease;
}

/* ❌ Bad */
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  padding: 16px;
}
```

### Naming Conventions

- **Files**: `PascalCase` for components, `camelCase` for utilities
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **CSS Classes**: `kebab-case`

## 🧪 Testing Guidelines

### Unit Tests

```typescript
describe('CardService', () => {
  describe('calculateROI', () => {
    it('should calculate positive ROI correctly', () => {
      const card = {
        purchasePrice: 100,
        currentValue: 150
      };
      expect(calculateROI(card)).toBe(50);
    });

    it('should handle zero purchase price', () => {
      const card = {
        purchasePrice: 0,
        currentValue: 100
      };
      expect(calculateROI(card)).toBe(0);
    });
  });
});
```

### Component Tests

```tsx
describe('CardList', () => {
  it('renders cards correctly', () => {
    const cards = [
      { id: '1', player: 'Mike Trout', value: 100 },
      { id: '2', player: 'Ronald Acuna', value: 200 }
    ];

    render(<CardList cards={cards} />);
    
    expect(screen.getByText('Mike Trout')).toBeInTheDocument();
    expect(screen.getByText('Ronald Acuna')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
describe('Add Card Flow', () => {
  it('should add a new card successfully', () => {
    cy.visit('/add-card');
    cy.get('[data-testid="player-input"]').type('Shohei Ohtani');
    cy.get('[data-testid="year-input"]').type('2018');
    cy.get('[data-testid="submit-button"]').click();
    cy.url().should('include', '/inventory');
    cy.contains('Shohei Ohtani').should('be.visible');
  });
});
```

## 📚 Documentation

### Code Comments

```typescript
/**
 * Calculates the return on investment for a card
 * @param card - The card object containing purchase and current values
 * @returns The ROI percentage, or 0 if purchase price is 0
 * @example
 * const roi = calculateROI({ purchasePrice: 100, currentValue: 150 });
 * // Returns: 50
 */
export const calculateROI = (card: CardData): number => {
  if (card.purchasePrice === 0) return 0;
  return ((card.currentValue - card.purchasePrice) / card.purchasePrice) * 100;
};
```

### README Updates

When adding features, update:
- Feature list
- Usage examples
- API documentation
- Configuration options

## 🎉 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 💬 Getting Help

- **Discord**: Join our development channel
- **GitHub Discussions**: Ask questions
- **Email**: dev@sportscardtracker.com

## 📋 Checklist for Contributors

Before submitting your PR, ensure:

- [ ] Code follows project style guide
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] PR description is complete
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Dependencies are necessary
- [ ] Security best practices followed
- [ ] Accessibility considered

---

Thank you for contributing to Sports Card Tracker! 🙏