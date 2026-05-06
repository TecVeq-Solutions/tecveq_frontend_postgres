import React, { useRef, useState, useEffect } from "react";
import moment from "moment/moment";
import Loader from "../../../utils/Loader";
import { IoClose, IoSend, IoArrowBack } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { getAllChatrooms, getChatroomData } from "../../../api/Admin/ChatroomApi";
import { getChatsRoomData, getMyChats } from "../../../api/UserApis";
import { io } from "socket.io-client";
import { useUser } from "../../../context/UserContext";
import { BACKEND_URL_SOCKET } from "../../../constants/api";
import { toast } from "react-toastify";

const RecentMessages = ({ onclose }) => {
  const { userData } = useUser();
  const [msgArray, setMsgArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupActive, setGroupActive] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showFullChat, setShowFullChat] = useState(false);
  const [individualActive, setIndividualActive] = useState(true);
  const [msgstr, setmsgStr] = useState("");
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  // Dynamic Data Fetching using React Query
  const { data: groupChats, isPending: groupIsPending } = useQuery({
    queryKey: ["chatrooms"],
    queryFn: getAllChatrooms
  });
  const { data: individualChats, isPending: individualIsPending } = useQuery({
    queryKey: ["individualChats"],
    queryFn: getMyChats
  });

  useEffect(() => {
    socket.current = io(BACKEND_URL_SOCKET);
    return () => { socket.current.disconnect(); };
  }, []);

  useEffect(() => {
    if (selectedChat && socket.current) {
      socket.current.emit("join_room", selectedChat.id);

      const handleNewMessage = (newMessage) => {
        if (newMessage.chatroomID === selectedChat.id || newMessage.roomID === selectedChat.id) {
          setMsgArray((prev) => [...prev, newMessage]);
        }
      };

      socket.current.on("receive_message", handleNewMessage);
      return () => { socket.current.off("receive_message", handleNewMessage); };
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgArray]);

  const openFullchat = async (chatData, isGroup = false) => {
    // Agar mobile nahi hai to sidebar remove nahi hoga
    setSelectedChat({ ...chatData, isGroup });
    setShowFullChat(true);

    if (selectedChat?.id === chatData.id) return;

    setLoading(true);
    setMsgArray([]);
    try {
      let result;
      if (isGroup) {
        result = await getChatroomData(chatData?.id);
        setMsgArray(result[0]?.messages || []);
      } else {
        result = await getChatsRoomData(chatData?.id);
        setMsgArray(result?.messages || []);
      }
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!msgstr.trim() || !selectedChat) return;

    const messageData = {
      roomID: selectedChat.id,
      chatroomID: selectedChat.isGroup ? selectedChat.id : undefined,
      message: msgstr,
      sentBy: { id: userData.id, name: userData.name, profilePic: userData.profilePic },
      time: new Date()
    };

    socket.current.emit("send_message", messageData);
    setMsgArray((prev) => [...prev, messageData]);
    setmsgStr("");
  };

  // --- Sub-Components ---
  const MessageItem = ({ data, onpress, isActive }) => (
    <div
      onClick={onpress}
      className={`group flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer transition-all duration-300 
      ${isActive ? "bg-blue-50 border-blue-200 border shadow-sm" : "hover:bg-gray-50 border border-transparent"}`}
    >
      <div className="relative flex-shrink-0">
        <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 overflow-hidden">
          {data?.profilePic ? <img src={data.profilePic} className="h-full w-full object-cover" /> : data?.name?.charAt(0)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className={`text-sm font-bold truncate ${isActive ? "text-blue-700" : "text-gray-800"}`}>{data?.name}</p>
          <span className="text-[10px] text-gray-400">{data?.lastMsg?.time ? moment(data.lastMsg.time).format("hh:mm a") : ""}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{data?.lastMsg?.message || "Start a conversation"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed top-20 right-0 bottom-0 z-[250] flex flex-row-reverse items-start pointer-events-none gap-4 px-4 overflow-hidden">

      {/* 1. CHAT DETAIL PANEL (Right Side) */}
      {showFullChat && (
        <div className="flex flex-col bg-white sm:w-96 w-[90vw] shadow-2xl border border-gray-100 pointer-events-auto h-full rounded-t-2xl animate-chat-panel">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowFullChat(false)} className="md:hidden p-1"><IoArrowBack size={20} /></button>
              <p className="font-bold text-gray-800">{selectedChat?.name}</p>
            </div>
            <button onClick={() => setShowFullChat(false)}><IoClose size={20} className="text-gray-400" /></button>
          </div>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading ? <div className="flex justify-center mt-10"><Loader /></div> :
              msgArray.map((m, i) => (
                <div key={i} className={`mb-4 flex ${m.sentBy?.id === userData.id ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${m.sentBy?.id === userData.id ? "bg-blue-600 text-white" : "bg-white border shadow-sm"}`}>
                    {m.message}
                  </div>
                </div>
              ))
            }
            <div ref={messagesEndRef} />
          </div>
          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
              <input
                className="bg-transparent w-full outline-none text-sm"
                value={msgstr}
                onChange={(e) => setmsgStr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type..."
              />
              <button onClick={handleSendMessage} className="text-blue-600"><IoSend /></button>
            </div>
          </div>
        </div>
      )}

      {/* 2. RECENT MESSAGES SIDEBAR (Main List) */}
      {/* "hidden md:flex" condition ko hata diya taake click par sidebar na chhupay */}
      <div className={`flex flex-col bg-white border border-gray-100 shadow-xl w-80 md:w-96 pointer-events-auto h-full rounded-t-2xl 
        ${showFullChat ? "hidden sm:flex" : "flex"}`}>

        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            <button onClick={onclose}><IoClose size={22} className="text-gray-400" /></button>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => { setIndividualActive(true); setGroupActive(false) }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg ${individualActive ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>DIRECT</button>
            <button onClick={() => { setGroupActive(true); setIndividualActive(false) }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg ${groupActive ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>GROUPS</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {individualIsPending || groupIsPending ? <Loader /> : (
            <>
              {individualActive && individualChats?.map(chat => (
                <MessageItem key={chat.id} data={chat} isActive={selectedChat?.id === chat.id} onpress={() => openFullchat(chat, false)} />
              ))}
              {groupActive && groupChats?.map(group => (
                <MessageItem key={group.id} data={group} isActive={selectedChat?.id === group.id} onpress={() => openFullchat(group, true)} />
              ))}
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default RecentMessages;