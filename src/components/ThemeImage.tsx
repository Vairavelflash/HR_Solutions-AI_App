import { useTheme } from '../hooks/useTheme';

export default function ThemeImage() {
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 z-40 pointer-events-none">
      <img
        src={theme === 'dark' ? '/white_circle_360x360.png' : '/black_circle_360x360.png'}
        alt="Theme indicator"
        className="w-20 h-20 opacity-70 hover:opacity-90 transition-opacity duration-300"
        style={{ filter: 'brightness(1.1)' }}
      />
    </div>
  );
}