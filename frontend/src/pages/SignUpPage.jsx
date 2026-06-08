import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <div className="w-full flex justify-center p-4 bg-transparent">
      <div className="relative w-full max-w-6xl md:h-[850px] h-auto">
        <BorderAnimatedContainer>  
          <div className="w-full flex flex-col">  
            

            <div className="w-full pt-8 pb-2 text-center border-b border-[#464555]/15">
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-[#dae2fd] via-[#c3c0ff] to-[#ddb8ff] bg-clip-text text-transparent">
                💬 Chit-Chat
              </h1>
            </div>


            <div className="w-full flex flex-col md:flex-row flex-1">
              

              <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-[#464555]/30">  
                <div className="w-full max-w-md">  
                  <MessageCircleIcon className="w-10 h-10 mx-auto text-[#c3c0ff] mb-3"/>  
                  <h2 className="text-2xl font-bold text-[#dae2fd] mb-1">Create Account</h2>  
                  <p className="text-[#c7c4d8]/70 text-sm">Signup for a new account</p>  
                    
                  {/* Form */}  
                  <form onSubmit={handleSubmit} className="space-y-5 mt-6">  
                    {/* Full Name */}  
                    <div>  
                      <label className="text-sm font-medium text-[#dae2fd] block mb-1">Full Name</label>  
                      <div className="relative">  
                        <UserIcon className="text-[#c7c4d8]/60 absolute left-3 top-1/2 -translate-y-1/2 size-5" />  
                        <input  
                          type="text"  
                          value={formData.fullName}  
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}  
                          className="w-full h-11 pl-10 pr-4 bg-[#131b2e] border border-[#464555] rounded-xl text-[#dae2fd] placeholder:text-[#c7c4d8]/40 focus:outline-none focus:ring-2 focus:ring-[#c3c0ff] focus:border-transparent transition-all"  
                          placeholder="John Doe"  
                        />  
                      </div>  
                    </div>  

                    {/* Email */}  
                    <div>  
                      <label className="text-sm font-medium text-[#dae2fd] block mb-1">Email</label>  
                      <div className="relative">  
                        <MailIcon className="text-[#c7c4d8]/60 absolute left-3 top-1/2 -translate-y-1/2 size-5" />  
                        <input  
                          type="email"  
                          value={formData.email}  
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}  
                          className="w-full h-11 pl-10 pr-4 bg-[#131b2e] border border-[#464555] rounded-xl text-[#dae2fd] placeholder:text-[#c7c4d8]/40 focus:outline-none focus:ring-2 focus:ring-[#c3c0ff] focus:border-transparent transition-all"  
                          placeholder="name123@gmail.com"  
                        />  
                      </div>  
                    </div>  
                      
                    {/* Password Input */}  
                    <div>  
                      <label className="text-sm font-medium text-[#dae2fd] block mb-1">Password</label>  
                      <div className="relative">  
                        <LockIcon className="text-[#c7c4d8]/60 absolute left-3 top-1/2 -translate-y-1/2 size-5" />  
                        <input  
                          type="password"  
                          value={formData.password}  
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}  
                          className="w-full h-11 pl-10 pr-4 bg-[#131b2e] border border-[#464555] rounded-xl text-[#dae2fd] placeholder:text-[#c7c4d8]/40 focus:outline-none focus:ring-2 focus:ring-[#c3c0ff] focus:border-transparent transition-all"  
                          placeholder="Enter your password"  
                        />  
                      </div>  
                    </div>  
                      
                    {/* Submit */}  
                    <button 
                      className="w-full h-11 bg-[#4f46e5] text-white hover:bg-[#3323cc] font-semibold rounded-xl flex items-center justify-center shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
                      type="submit" 
                      disabled={isSigningUp}
                    >  
                      {isSigningUp ? (  
                        <LoaderIcon className="w-5 h-5 animate-spin" />  
                      ) : (  
                        "Create Account"  
                      )}  
                    </button>
                  </form>  

                  <div className="mt-6 text-center">  
                    <Link to="/login" className="text-sm text-[#c3c0ff] hover:underline transition-all">  
                      Already have an account? Login  
                    </Link>  
                  </div>  
                </div>  
              </div>  

              {/* RIGHT SIDE: ILLUSTRATION */}  
              <div className="hidden md:w-1/2 md:flex items-center justify-center p-8 bg-gradient-to-bl from-[#171f33]/40 to-transparent">  
                <div>  
                  <img  
                    src="/signup.png"  
                    alt="People using mobile devices"  
                    className="w-full h-auto max-h-[400px] object-contain mix-blend-lighten opacity-90 mx-auto"  
                  />  
                  <div className="mt-6 text-center">  
                    <h3 className="text-xl font-medium text-[#c3c0ff]">Start Your Journey Today</h3>  

                    <div className="mt-4 flex justify-center gap-4">  
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#1c0051] text-[#ddb8ff] border border-[#7c03d3]/30">Free</span>  
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#1c0051] text-[#ddb8ff] border border-[#7c03d3]/30">Easy Setup</span>  
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#1c0051] text-[#ddb8ff] border border-[#7c03d3]/30">Private</span>  
                    </div>  
                  </div>  
                </div>  
              </div>

            </div>  
          </div>  
        </BorderAnimatedContainer>  
      </div>  
    </div>
  );
}

export default SignUpPage;
