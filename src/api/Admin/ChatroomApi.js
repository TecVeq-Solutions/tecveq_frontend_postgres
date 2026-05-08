import axios from "axios";
import apiRequest from "../../utils/ApiRequest";
import { BACKEND_URL } from "../../constants/api";

axios.defaults.withCredentials = true;

export const getAllChatrooms = apiRequest(async () => await axios.get(`${BACKEND_URL}/chatroom/admin`))

export const getChatroomData = apiRequest(async (id) => await axios.get(`${BACKEND_URL}/chatroom/admin/${id}`))
 
export const deleteChatroom = apiRequest(async (id) => await axios.delete(`${BACKEND_URL}/chatroom/admin/${id}`))
