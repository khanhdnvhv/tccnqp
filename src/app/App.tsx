import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DndProvider } from 'react-dnd';
import { SafeHTML5Backend } from './utils/safeHtml5Backend';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DndProvider backend={SafeHTML5Backend}>
          <RouterProvider router={router} />
        </DndProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}