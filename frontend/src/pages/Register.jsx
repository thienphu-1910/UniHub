import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, IdCard, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthLayout from '../component/layout/AuthLayout';
import Input from '../component/common/Input';
import Button from '../component/common/Button';
import AuthTabs from '../component/common/AuthTabs';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  }

  const onSubmit = (data) => {
    console.log('Register Data:', data);
  };

  return (
    <AuthLayout>
      <div className="flex flex-col h-full items-center px-8 py-10 sm:px-14">
        <AuthTabs />

        <div className="text-center w-full mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create an Account</h2>
          <p className="text-slate-500 text-sm">Sign up to start managing your academic events.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm flex flex-col gap-4">
          <Input 
            id="name" 
            label="Full Name" 
            type="text" 
            icon={User} 
            placeholder="John Doe" 
            {...register("name", { 
              required: "Full name is required", 
              pattern: { value: /^[a-zA-Z\s]+$/, message: "Full Name cannot contain numbers or special characters" }
            })}
            error={errors.name?.message}
          />

          <Input 
            id="studentId" 
            label="Student ID" 
            type="text" 
            icon={IdCard} 
            placeholder="23127000" 
            {...register("studentId", { 
              required: "Student ID is required", 
              pattern: { value: /^\d{8}$/, message: "Student ID must be exactly 8 digits" }
            })}
            error={errors.studentId?.message}
          />

          <Input 
            id="email" 
            label="Email Address" 
            type="email" 
            icon={Mail} 
            placeholder="name@university.edu" 
            {...register("email", { 
              required: "Email is required", 
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email format" }
            })}
            error={errors.email?.message}
          />

          <Input 
            id="password" 
            label="Password" 
            type={showPassword ? 'text' : 'password'} 
            icon={Lock} 
            placeholder="••••••••" 
            className={!showPassword ? "font-mono tracking-widest text-lg py-[0.625rem]" : ""}
            {...register("password", { required: "Password is required" })}
            error={errors.password?.message}
            rightElement={
              <button type="button" onClick={togglePasswordVisibility} className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <Button type="submit" className="mt-4">
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Register;
