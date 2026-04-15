import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { BACKEND_URL } from "../../constants/api";
import axios from "axios";
import apiRequest from "../../utils/ApiRequest";


export const useGetAllTeacherSubjects = (teacherId) => {


    const getMyAllTeacherSubjectsRequest = async () => {
        const url = `${BACKEND_URL}/subject/teacher-subject/${teacherId}`;
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            // If the error is a 404 with the specific message, return an empty array
            if (error.response && error.response.status === 404) {
                const message = error.response.data?.message || error.response.data;
                if (message === "Teacher not found in any classroom." || message === "No subjects found for the given teacher.") {
                    return [];
                }
            }
            throw error;
        }
    };

    // Updated useQuery call with object form
    const { data: teacherSubjects, isLoading, error } = useQuery({
        queryKey: ['fetchAllTeacherSubject', teacherId],
        queryFn: getMyAllTeacherSubjectsRequest,
        enabled: !!teacherId, // Only run the query if levelId is truthy

    });

    if (error) {
        toast.error(error.toString());
    }

    return {
        isLoading,
        teacherSubjects,
    };
};


export const getTeacherSubjectsOfClassroom = apiRequest(async ({ classroomIDs }) => {
    const url = `${BACKEND_URL}/subject/teacher-subjects-of-classrooms`;
    const response = await axios.post(url, { classroomIDs });
    return response;
});
