
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { Toaster } from "sonner";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(
    <>
      <App />
      <Toaster 
        position="top-center" 
        richColors 
        theme="dark"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            color: '#fff'
          }
        }}
      />
    </>
  );
  