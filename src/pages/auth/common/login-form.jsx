import React, { useState } from "react";
import InputGroup from "@/components/ui/InputGroup";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import Checkbox from "@/components/ui/Checkbox";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setUser } from "@/store/api/auth/authSlice";
import { useAuth } from "@/contexts/AuthContext";
const schema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email is Required"),
    password: yup.string().required("Password is Required"),
  })
  .required();
const LoginForm = () => {
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });
  const navigate = useNavigate();
  const location = useLocation();
  
  const onSubmit = async (data) => {
    console.log("Login data:", data, "Remember me:", checked);
    setIsLoading(true);
    
    try {
      const result = await authLogin(data, checked);
      
      if (result.success) {
        // Update Redux state
        dispatch(setUser(result.data.admin));
        
        toast.success("Login Successful");
        
        // Get the intended URL from location state
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error?.data?.message || error?.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const [checked, setChecked] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
      <InputGroup
        name="email"
        type="email"
        label="email"
        placeholder="email"
        prepend="@"
        defaultValue="Chandran@preciousjewels.com"
        register={register}
        error={errors.email}
        merged
        disabled={isLoading}
      />
      <InputGroup
        name="password"
        label="password"
        type="password"
        placeholder="password"
        prepend={<Icon icon="ph:lock-simple" />}
        defaultValue="Test@1234"
        register={register}
        error={errors.password}
        merged
        disabled={isLoading}
      />

      <div className="flex justify-between">
        <Checkbox
          value={checked}
          onChange={() => setChecked(!checked)}
          label="Remember me"
        />
        {/* <Link
          to="/forgot-password"
          className="text-sm text-gray-400 dark:text-gray-400 hover:text-indigo-500 hover:underline  "
        >
          Forgot Password?
        </Link> */}
      </div>

      <Button
        type="submit"
        text="Sign in"
        className="btn btn-primary block w-full text-center "
        isLoading={isLoading}
      />
    </form>
  );
};

export default LoginForm;
