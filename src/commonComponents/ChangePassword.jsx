import React, { useState } from "react";
import { FaLock, FaUnlock } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { updatePassword } from "../api/Admin/UsersApi";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { logout } from "../api/User/UserApi";
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const { userData } = useUser(); // Assuming setUserData is part of the hook
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();



    const handleUpdatePassword = async (e) => {
        e.preventDefault();


        if (!password || !confirmPassword) {
            toast.error("Please fill out both fields.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        const userPass = { password };

        // Call the mutation
        mutation.mutate(userPass);
    };

    const mutation = useMutation({
        mutationFn: async (updatePasswordData) => {
            let result = await updatePassword(updatePasswordData);
            console.log("user updated ", result);
            toast.success(`Password updated successfully!`);
            setSuccess(true);
            onLogoutClick()
            return result;
        },
        onError: (error) => {
            // toast.error handled globally by axios interceptor
        },
    });

    const onLogoutClick = async () => {
        try {
            // Clear local storage
            localStorage.clear();

            // Call logout API (if necessary)
            const response = await logout(); // Ensure logout is a valid API function

            if (response !== "error") {
                console.log("Logout successful");
            } else {
                console.log("Error logging out");
            }

            // Navigate to the login or landing page
            navigate("/routes");
        } catch (error) {
            console.error("Error during logout:", error);
            toast.error("An error occurred while logging out.");
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold text-gray-700 flex items-center mb-6">
                    <FaLock className="mr-2 text-orange-500" />
                    Please Change Your Password
                </h2>
                {error && (
                    <p className="text-sm text-red-600 flex items-center mb-4">
                        ⚠️ {error}
                    </p>
                )}
                {success ? (
                    <p className="text-sm text-green-600 flex items-center">
                        🎉 Password updated successfully! You can now continue.
                    </p>
                ) : (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-600"
                            >
                                New Password <FaUnlock className="inline ml-1 text-gray-500" />
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                className="mt-1 w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-600"
                            >
                                Confirm Password <FaUnlock className="inline ml-1 text-gray-500" />
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} // Corrected onChange handler
                                placeholder="Confirm your password"
                                required
                                className="mt-1 w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#6A00FF] text-white font-semibold py-2 rounded-md hover:[#007EEA] focus:ring-2 focus:ring-orange-500/75"
                        >
                            Update Password
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ChangePassword;
