import { Navigate, Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LogInPage from './pages/LogInPage.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";
import { Toaster } from 'react-hot-toast';

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <>
      <Toaster position="top-right" />


      <div className="min-h-screen bg-[#0b1326] relative flex items-center justify-center p-4 overflow-hidden text-[#dae2fd]">
        

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(70,69,85,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(70,69,85,0.15)_1px,transparent_1px)] bg-[size:14px_24px]" />    
        

        <div className="absolute top-0 -left-4 size-96 bg-[#7c03d3] opacity-[0.18] blur-[120px] pointer-events-none" />    

        <div className="absolute bottom-0 -right-4 size-96 bg-[#4f46e5] opacity-[0.15] blur-[120px] pointer-events-none" />     

        <Routes>    
           <Route path="/" element={authUser ? <ChatPage/> : <Navigate to={"/login"}/>}/>    
           <Route path="/signup" element={!authUser ? <SignUpPage/> : <Navigate to={"/"}/>}/>    
           <Route path="/login" element={!authUser ? <LogInPage/> : <Navigate to={"/"}/>}/>    
        </Routes>  
      </div>    
    </>
  );
}

export default App;
