import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { BACKEND_URL } from "../../constants/api";
import axios from "axios";

// Custom hook to update settings (institutionType, enableHeadAttendance)
export const useUpdateSettings = () => {
    const updateSettingsRequest = async (data) => {
        const url = `${BACKEND_URL}/settings/update`;
        const response = await axios.post(url, data);
        return response.data;
    };

    const { mutate, isLoading } = useMutation({
        mutationFn: updateSettingsRequest,
        onSuccess: () => {
            toast.success("Settings updated successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update settings");
        },
    });

    return {
        updateSettings: mutate,
        isLoading
    };
};

export const useGetSettings = () => {
    const getSettingsRequest = async () => {
        const url = `${BACKEND_URL}/settings/`;
        const response = await axios.get(url);
        return response.data;
    };

    const { data, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: getSettingsRequest,
        retry: false
    });

    return {
        settings: data,
        isLoading
    };
};
