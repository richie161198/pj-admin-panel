import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputGroup from "@/components/ui/InputGroup";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRegisterMutation } from "@/store/api/admin/adminApi";
import useDarkMode from "@/hooks/useDarkMode";

// Validation schema
const schema = yup.object({
  name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  role: yup.string().required("Role is required"),
  department: yup.string().optional(),
  phone: yup.string().optional(),
});

const RegisterAdmin = () => {
  const [isDark] = useDarkMode();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useAuth();
  const [adminRegister, { isLoading }] = useAdminRegisterMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  // Check if user is super admin
  React.useEffect(() => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to access this page");
      navigate("/login");
      return;
    }
    
    if (user && user.role !== 'super_admin') {
      toast.error("Only super admins can create new admin accounts");
      navigate("/dashboard");
      return;
    }
  }, [isLoggedIn, user, navigate]);

  const onSubmit = async (data) => {
    console.log("Registration data:", data);
    setIsSubmitting(true);

    try {
      // Remove confirmPassword from data
      const { confirmPassword, ...adminData } = data;

      const result = await adminRegister(adminData).unwrap();

      if (result.status) {
        toast.success("Admin registered successfully");
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error?.data?.message || error?.message || "Registration failed";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "moderator", label: "Moderator" },
    { value: "support", label: "Support" },
  ];

  return (
    <div className="h-full grid w-full grow grid-cols-1 place-items-center pt-10 2xl:pt-0">
      <div className="max-w-[500px] mx-auto w-full space-y-6">
        <div className="text-center">
          <div className="h-[72px] w-[72px] mx-auto">
            <Link to="/">
              <img
                src="/logo-c.png"
                alt=""
                className="object-contain object-center h-full"
              />
            </Link>
          </div>
          <div className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-1 mt-5">
            Register New Admin
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Create a new admin account
          </div>
        </div>

        <div className="p-6 auth-box">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <InputGroup
              label="Full Name"
              placeholder="Enter full name"
              icon="ph:user"
              error={errors.name?.message}
              {...register("name")}
            />

            {/* Email */}
            <InputGroup
              label="Email"
              placeholder="Enter email address"
              icon="ph:envelope"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Password */}
            <InputGroup
              label="Password"
              placeholder="Enter password"
              icon="ph:lock"
              type="password"
              error={errors.password?.message}
              {...register("password")}
            />

            {/* Confirm Password */}
            <InputGroup
              label="Confirm Password"
              placeholder="Confirm password"
              icon="ph:lock"
              type="password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                {...register("role")}
              >
                <option value="">Select a role</option>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Department */}
            <InputGroup
              label="Department (Optional)"
              placeholder="Enter department"
              icon="ph:building"
              error={errors.department?.message}
              {...register("department")}
            />

            {/* Phone */}
            <InputGroup
              label="Phone (Optional)"
              placeholder="Enter phone number"
              icon="ph:phone"
              error={errors.phone?.message}
              {...register("phone")}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting || isLoading}
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <Icon icon="ph:spinner" className="animate-spin mr-2" />
                  Creating Admin...
                </>
              ) : (
                <>
                  <Icon icon="ph:user-plus" className="mr-2" />
                  Create Admin
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm mt-5 space-x-1 rtl:space-x-reverse mb-1">
            <span>Already have an account?</span>
            <span>
              <Link to="/login" className="text-indigo-500">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAdmin;
