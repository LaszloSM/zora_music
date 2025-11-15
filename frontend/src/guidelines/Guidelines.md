# Zora Music Development Guidelines

## Code Style

### TypeScript
- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use type inference when possible
- Avoid `any`, use `unknown` if needed

### React
- Functional components only
- Use hooks appropriately
- Extract custom hooks for reusable logic
- Keep components small and focused

### Naming Conventions
- **Components**: PascalCase (e.g., `MusicPlayer.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useKeyboardShortcuts.ts`)
- **Utilities**: camelCase (e.g., `formatDuration.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `Song`, `Playlist`)

### File Organization
```
component/
  ComponentName.tsx       # Main component
  ComponentName.test.tsx  # Tests (if applicable)
  index.ts               # Barrel export (optional)
```

## Component Structure

```tsx
// 1. Imports
import { useState } from 'react';
import type { Props } from '../types';

// 2. Types
interface ComponentNameProps {
  prop1: string;
  prop2?: number;
}

// 3. Component
export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // 3.1. Hooks
  const [state, setState] = useState<string>('');
  
  // 3.2. Handlers
  const handleClick = () => {
    setState('new value');
  };
  
  // 3.3. Effects
  useEffect(() => {
    // side effects
  }, [dependencies]);
  
  // 3.4. Render helpers
  const renderContent = () => {
    return <div>{content}</div>;
  };
  
  // 3.5. Return JSX
  return (
    <div>
      {renderContent()}
    </div>
  );
}
```

## State Management

### Local State
Use `useState` for component-specific state:
```tsx
const [isOpen, setIsOpen] = useState(false);
```

### Context
Use Context API for features that need to share state:
```tsx
// PlayerContext for music player state
const { currentSong, play, pause } = usePlayerContext();
```

### Global Store
Use Zustand for app-wide state:
```tsx
// Auth store
const { user, login, logout } = useAuthStore();
```

## Styling

### Tailwind CSS
- Use Tailwind utility classes
- Extract repeated patterns into custom classes
- Use theme colors from `tailwind.config.js`

### Custom CSS
Only for complex animations or specific needs:
```css
/* app-animations.css */
@keyframes customAnimation {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Class Names
```tsx
// ✅ Good
<div className="flex items-center gap-4 px-4 py-2 bg-[#141937] rounded-lg">

// ❌ Avoid inline styles
<div style={{ display: 'flex', padding: '8px' }}>
```

## API Integration

### Error Handling
```tsx
try {
  const data = await api.getData();
  setData(data);
} catch (error) {
  console.error('Error loading data:', error);
  toast.error('Failed to load data');
}
```

### Loading States
```tsx
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.getData();
    setData(data);
  } finally {
    setLoading(false);
  }
};
```

## Performance

### Memoization
```tsx
// Expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(prop);
}, [prop]);

// Callbacks passed to children
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);
```

### Code Splitting
```tsx
// Lazy load routes
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
```

## Accessibility

- Use semantic HTML
- Add ARIA labels when needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios

```tsx
<button
  aria-label="Play song"
  onClick={handlePlay}
>
  <PlayIcon />
</button>
```

## Testing

### Unit Tests
- Test business logic
- Test custom hooks
- Test utility functions

### Integration Tests
- Test user flows
- Test API integration
- Test state management

## Git Workflow

### Commits
```bash
# Format: type(scope): message
feat(player): add shuffle mode
fix(api): handle refresh token errors
docs(readme): update installation steps
style(header): adjust spacing
refactor(auth): simplify login flow
```

### Branches
```bash
main           # Production
develop        # Development
feature/name   # New features
fix/name       # Bug fixes
```

## Documentation

### Code Comments
```tsx
// Explain WHY, not WHAT
// ✅ Good: Complex business logic needs explanation
// Calculate remaining time accounting for buffering
const remainingTime = duration - currentTime - bufferTime;

// ❌ Bad: Obvious code doesn't need comments
// Set the state to true
setState(true);
```

### JSDoc for Utilities
```tsx
/**
 * Formats duration in seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted time string (e.g., "3:45")
 */
export function formatDuration(seconds: number): string {
  // implementation
}
```

## Security

- Never commit API keys or secrets
- Use environment variables
- Sanitize user input
- Validate data from API
- Use HTTPS in production

## Best Practices

1. **Keep it simple** - Write clear, readable code
2. **DRY** - Don't repeat yourself
3. **Single responsibility** - One component, one job
4. **Test early** - Write tests as you code
5. **Review code** - Always review before merging
6. **Update dependencies** - Keep packages up to date
7. **Performance matters** - Profile and optimize
8. **Accessibility first** - Design for everyone

## Resources

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Web Accessibility](https://www.w3.org/WAI/)
