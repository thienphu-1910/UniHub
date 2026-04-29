import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthLayout from '../component/layout/AuthLayout';
import Input from '../component/common/Input';
import Button from '../component/common/Button';
import Checkbox from '../component/common/Checkbox';
import AuthTabs from '../component/common/AuthTabs';

import { authenticationService } from '../services/authenticationService';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  }

  const onSubmit = async () => {
    if (!email || !password) return; // Validation cơ bản

    const data = await authenticationService.signIn(email, password);
    console.log(data);
  };

  return (
    <AuthLayout>
      <div className="flex flex-col h-full items-center px-8 py-10 sm:px-14">
        <AuthTabs />

        <div className="text-center w-full mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-sm">Please enter your details to access your account.</p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }} className="w-full max-w-sm flex flex-col gap-5">
          <Input 
            id="email" 
            label="Email Address" 
            type="email" 
            icon={Mail} 
            placeholder="name@university.edu" 
            required 
            onChange = {(e) => setEmail(e.target.value)}
          />

          <Input 
            id="password" 
            label="Password" 
            type={showPassword ? 'text' : 'password'} 
            icon={Lock} 
            placeholder="••••••••" 
            required 
            className={showPassword === false ? "font-mono tracking-widest text-lg py-2.5" : ""}
            rightElement={
              <button type="button" onClick={togglePasswordVisibility} className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            onChange = {(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between mt-1">
            <Checkbox id="remember-me" name="remember-me" label="Remember me" />
            <div className="text-sm">
              <a href="#" className="font-semibold text-[#0088cc] hover:text-[#005580] transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          <Button type="submit" className="mt-4">
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
