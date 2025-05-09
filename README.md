# @zamansheikh/percentage-bar

A customizable, interactive percentage bar React component built with TypeScript and Tailwind CSS.

## Installation

```bash
npm install @zamansheikh/percentage-bar lucide-react tailwind-merge clsx react react-dom
```

## Usage

```jsx
import { PercentageBar } from '@zamansheikh/percentage-bar';

function App() {
  return (
    <div>
      <PercentageBar />
    </div>
  );
}
```

## Features

- Drag to adjust percentages interactively.
- Add, delete, and rename items.
- Change item colors from a predefined palette.
- Ensures total percentage remains 100%.
- Minimum 2% per section.
- Responsive design with Tailwind CSS.

## Requirements

- React 17 or 18
- Tailwind CSS configured in your project
- `lucide-react` for icons
- `tailwind-merge` and `clsx` for class name utilities

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/zamansheikh/percentage-bar.git
   cd percentage-bar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the package:
   ```bash
   npm run build
   ```

## License

MIT License

Developed by Zaman Sheikh