import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  Check,
} from "lucide-react";
import { api } from "../utils/api";
import { useToast } from "./ToastContext"; 
import axios from "axios";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { showError, showSuccess } = useToast(); 

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    pass: "",
    phone: "",
    course: "",
    year: "",
    interests: "",
    confpass: "",
  });

  const [showPassword, setShowPassword] = useState({
    pass: false,
    confpass: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    specialChar: false,
    isValid: false,
  });

  const originalBodyOverflow = useRef<string>("");
  const originalHtmlOverflow = useRef<string>("");

  useEffect(() => {
    // 1. Lock the current HTML elements into safe local variables
    const modal = modalRef.current;
    const content = contentRef.current;

    // 2. If they don't exist yet, stop completely so GSAP doesn't crash
    if (!modal || !content) return;

    if (isOpen) {
      originalBodyOverflow.current = document.body.style.overflow || "";
      originalHtmlOverflow.current = document.documentElement.style.overflow || "";

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      // 3. Use the locked variables (modal and content) instead of refs
      gsap.set(modal, { display: "flex" });
      gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        content,
        { scale: 0.9, y: 40, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
          delay: 0.1,
        },
      );
    } else {
      // Exit animations using locked variables
      gsap.to(content, {
        scale: 0.9,
        y: 40,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
      });
      gsap.to(modal, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          // 4. Double check the ref still exists before hiding it
          if (modalRef.current) {
            gsap.set(modalRef.current, { display: "none" });
          }
          document.body.style.overflow = originalBodyOverflow.current || "unset";
          document.documentElement.style.overflow = originalHtmlOverflow.current || "unset";
        },
      });
    }

    return () => {
      if (!isOpen) {
        document.body.style.overflow = originalBodyOverflow.current || "unset";
        document.documentElement.style.overflow = originalHtmlOverflow.current || "unset";
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    document.body.style.overflow = originalBodyOverflow.current || "unset";
    document.documentElement.style.overflow = originalHtmlOverflow.current || "unset";
    onClose();
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length === 10;
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 6;
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const validation = {
      length: minLength,
      specialChar: hasSpecialChar,
      isValid: minLength && hasSpecialChar,
    };

    setPasswordValidation(validation);
    return validation;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const cleanValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleanValue }));

      if (cleanValue.length === 0) {
        setPhoneError("");
      } else if (cleanValue.length !== 10) {
        setPhoneError("Phone number must be exactly 10 digits");
      } else {
        setPhoneError("");
      }
    } else if (name === "email") {
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (value.length === 0) {
        setEmailError("");
      } else if (!validateEmail(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    } else if (name === "pass") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      validatePassword(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const togglePasswordVisibility = (field: "pass" | "confpass") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      handleClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateEmail(formData.email)) {
      showError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (!passwordValidation.isValid) {
      showError("Password must be at least 6 characters and contain at least one special character.");
      setIsSubmitting(false);
      return;
    }

    if (formData.pass !== formData.confpass) {
      showError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (!validatePhone(formData.phone)) {
      showError("Please enter a valid 10-digit phone number.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post("/api/signup", formData);
      const data = response.data;

      if (!data.success) {
        throw new Error("Signup failed: " + (data.error || "Unknown error"));
      }

      if (contentRef.current) {
        gsap.to(contentRef.current, {
          scale: 1.05,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        });
      }

      setFormData({
        fullName: "",
        email: "",
        pass: "",
        phone: "",
        course: "",
        year: "",
        interests: "",
        confpass: "",
      });

      setPhoneError("");
      setEmailError("");
      setPasswordValidation({ length: false, specialChar: false, isValid: false });

      showSuccess("🎉 Registration successful!, Please login .");

      setTimeout(() => {
        handleClose();
      }, 800);
    } catch (error: unknown) {
      let errorMsg = "Something went wrong. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        errorMsg =
          error.response.data?.error ||
          error.response.data?.message ||
          `${errorMsg}\nRequest failed with status code ${error.response.status}`;
      } else if (error instanceof Error) {
        errorMsg += "\n" + error.message;
      } else {
        errorMsg += "\n" + String(error);
      }
      showError(errorMsg);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // 2. REMOVED: The `if (!isOpen) return null;` line used to be right here!

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      style={{ display: "none" }}
    >
      <div
        ref={contentRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-glass-bg backdrop-blur-md border border-white/20 rounded-3xl shadow-md"
      >
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-r from-white/5 to-white/10 border-b border-white/10">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 bg-glass-bg backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:border-white/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">Join Our Club</h2>
            <p className="text-sm text-gray-300">
              Start your journey to civil service excellence
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="relative">
              <div className="absolute top-4 left-4 text-white">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-4 bg-glass-bg border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition"
                placeholder="Full Name"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <div className="absolute top-4 left-4 text-white">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full pl-12 pr-4 py-4 bg-glass-bg border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/10 transition ${
                  emailError
                    ? "border-red-400 focus:border-red-400"
                    : formData.email && !emailError
                      ? "border-green-400 focus:border-green-400"
                      : "border-white/20 focus:border-white/40"
                }`}
                placeholder="Email Address"
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-400">{emailError}</p>
              )}
              {formData.email && !emailError && (
                <p className="mt-2 text-sm text-green-400">✓ Valid email address</p>
              )}
            </div>

            {/* Password with Validation */}
            <div className="relative md:col-span-2">
              <div className="absolute top-4 left-4 text-white">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword.pass ? "text" : "password"}
                name="pass"
                value={formData.pass}
                onChange={handleInputChange}
                required
                className={`w-full pl-12 pr-12 py-4 bg-glass-bg border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/10 transition ${
                  formData.pass && !passwordValidation.isValid
                    ? "border-red-400 focus:border-red-400"
                    : formData.pass && passwordValidation.isValid
                      ? "border-green-400 focus:border-green-400"
                      : "border-white/20 focus:border-white/40"
                }`}
                placeholder="Create Password"
              />
              <div
                className="absolute top-4 right-4 text-white cursor-pointer"
                onClick={() => togglePasswordVisibility("pass")}
              >
                {showPassword.pass ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>

              {/* Password Requirements */}
              {formData.pass && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordValidation.length ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {passwordValidation.length && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        passwordValidation.length ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      At least 6 characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordValidation.specialChar ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {passwordValidation.specialChar && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        passwordValidation.specialChar
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      At least one special character (!@#$%^&*()_+-=[]{};':"\|,.&lt;&gt;/?)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative md:col-span-2">
              <div className="absolute top-4 left-4 text-white">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword.confpass ? "text" : "password"}
                name="confpass"
                value={formData.confpass}
                onChange={handleInputChange}
                required
                className={`w-full pl-12 pr-12 py-4 bg-glass-bg border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/10 transition ${
                  formData.confpass && formData.pass !== formData.confpass
                    ? "border-red-400 focus:border-red-400"
                    : formData.confpass && formData.pass === formData.confpass
                      ? "border-green-400 focus:border-green-400"
                      : "border-white/20 focus:border-white/40"
                }`}
                placeholder="Confirm Password"
              />
              <div
                className="absolute top-4 right-4 text-white cursor-pointer"
                onClick={() => togglePasswordVisibility("confpass")}
              >
                {showPassword.confpass ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </div>
              {formData.confpass && formData.pass !== formData.confpass && (
                <p className="mt-2 text-sm text-red-400">Passwords do not match</p>
              )}
              {formData.confpass && formData.pass === formData.confpass && (
                <p className="mt-2 text-sm text-green-400">✓ Passwords match</p>
              )}
            </div>

            {/* Phone Number Field with Validation */}
            <div className="relative md:col-span-2">
              <div className="absolute top-4 left-4 text-white">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                maxLength={10}
                className={`w-full pl-12 pr-4 py-4 bg-glass-bg border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/10 transition ${
                  phoneError
                    ? "border-red-400 focus:border-red-400"
                    : "border-white/20 focus:border-white/40"
                }`}
                placeholder="Phone Number"
              />
              {phoneError && (
                <p className="mt-2 text-sm text-red-400">{phoneError}</p>
              )}
              {formData.phone && !phoneError && (
                <p className="mt-2 text-sm text-green-400">✓ Valid phone number</p>
              )}
            </div>

            {/* Course Select */}
            <div className="relative">
              <div className="absolute top-4 left-4 text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <select
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-4 bg-glass-bg border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition appearance-none"
              >
                <option value="" className="text-black">
                  Select Course
                </option>
                {[
                  "Computer Science",
                  "Mechanical Engineering",
                  "Electrical Engineering",
                  "Civil Engineering",
                  "Electronics Engineering",
                  "Other",
                ].map((course) => (
                  <option key={course} value={course} className="text-black">
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Select */}
            <div className="relative">
              <div className="absolute top-4 left-4 text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-4 bg-glass-bg border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition appearance-none"
              >
                <option value="" className="text-black">
                  Select Year
                </option>
                {[
                  "1st Year",
                  "2nd Year",
                  "3rd Year",
                  "4th Year",
                  "5th Year(Arch)",
                ].map((year) => (
                  <option key={year} value={year} className="text-black">
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Interests */}
            <div className="md:col-span-2">
              <textarea
                name="interests"
                value={formData.interests}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-4 bg-glass-bg border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition resize-none"
                placeholder="Tell us about your interests"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !!phoneError ||
              !!emailError ||
              !passwordValidation.isValid
            }
            className="w-full px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl shadow hover:shadow-md hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Registering...</span>
              </div>
            ) : (
              "Join the Club"
            )}
          </button>

          {/* Terms */}
          <p className="text-center text-sm text-gray-400 mt-6">
            By joining, you agree to our{" "}
            <a href="#" className="text-white hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-white hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;