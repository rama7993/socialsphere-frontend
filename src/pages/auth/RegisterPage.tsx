import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  AtSign,
} from "lucide-react";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data: any) => {
    try {
      setError("");
      await api.post("/auth/register", data);

      const loginResponse = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const { access_token } = loginResponse.data;

      // Get Profile
      api.defaults.headers.Authorization = `Bearer ${access_token}`;
      const userResponse = await api.get("/users/profile").catch(() => null);

      const user = userResponse?.data || { ...data, id: "new-user" };

      login(user, access_token);
      navigate("/");
    } catch (err: any) {
      console.error("Registration failed", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  const inputFields = [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      icon: UserIcon,
      placeholder: "John",
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      icon: UserIcon,
      placeholder: "Doe",
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      icon: AtSign,
      placeholder: "johndoe",
    },
    {
      name: "email",
      label: "Email address",
      type: "email",
      icon: Mail,
      placeholder: "you@example.com",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      icon: Lock,
      placeholder: "••••••••",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {inputFields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <field.icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id={field.name}
                    type={field.type}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border ${
                      errors[field.name] ? "border-red-300" : ""
                    }`}
                    placeholder={field.placeholder}
                    {...register(field.name, {
                      required: `${field.label} is required`,
                      minLength:
                        field.name === "password"
                          ? {
                              value: 6,
                              message: "Password must be at least 6 characters",
                            }
                          : undefined,
                    })}
                  />
                </div>
                {errors[field.name] && (
                  <p className="mt-2 text-sm text-red-600">
                    {String(errors[field.name]?.message)}
                  </p>
                )}
              </div>
            ))}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? "Creating account..." : "Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
