import axios from "axios";
import apiRequest from "../../utils/ApiRequest";
import { BACKEND_URL } from "../../constants/api";
import { useQuery } from "@tanstack/react-query";

axios.defaults.withCredentials = true;

export const getAllClassroom = apiRequest(async () => await axios.get(`${BACKEND_URL}/classroom/`))

export const getMyAllClassroom = apiRequest(async () => await axios.get(`${BACKEND_URL}/classroom/all-classrooms`))


export const createClassroom = apiRequest(async (data) => await axios.post(`${BACKEND_URL}/classroom/`, data))

export const updateClassroom = apiRequest(async ({ data, id }) =>
    await axios.put(`${BACKEND_URL}/classroom/${id}`, data)
);

export const deleteClassroom = apiRequest(async (id) => await axios.delete(`${BACKEND_URL}/classroom/${id}`))



export const fetchStudentAttendanceReport = async (params) => {
    try {
        const { classroomId, subjectId, studentId, startDate, endDate } = params;

        // Build query parameters
        const queryParams = new URLSearchParams({
            classroomId,
            ...(subjectId && { subjectId }),
            ...(studentId && { studentId }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate })
        });

        const response = await axios.get(`${BACKEND_URL}/classroom/students-attendence-report/?${queryParams}`);
        return response.data;
    } catch (error) {
        // Handle different error types
        if (error.response) {
            // Server responded with error status
            throw new Error(error.response.data.message || 'Failed to fetch attendance data');
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('No response from server. Please check your connection.');
        } else {
            throw new Error('An unexpected error occurred');
        }
    }
}

export const useGetClassroomsByLevel = (levelId) => {
    const fetchClassrooms = async () => {
        const response = await axios.get(`${BACKEND_URL}/classroom`);
        if (response.status !== 200) throw new Error('Failed to fetch classrooms');
        // Filter out locally since API may not have dedicated level endpoint
        return response.data?.filter(c => c.levelID === levelId) || [];
    };

    const { data: classrooms = [], isLoading: classroomsLoading } = useQuery({
        queryKey: ['fetchClassroomsByLevel', levelId],
        queryFn: fetchClassrooms,
        enabled: !!levelId,
    });

    return { classrooms, classroomsLoading };
};
