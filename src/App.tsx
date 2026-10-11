import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          duration: 4000,
          style: {
            padding: '16px',
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
