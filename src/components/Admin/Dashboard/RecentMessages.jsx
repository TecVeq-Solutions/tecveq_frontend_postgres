import React, { useRef, useState } from "react";
import moment from "moment/moment";
import Loader from "../../../utils/Loader";
import { IoClose, IoSend } from "react-icons/io5"; // Added IoSend for look
import { useQuery } from "@tanstack/react-query";
import { getAllChatrooms, getChatroomData } from "../../../api/Admin/ChatroomApi";
import { getChatsRoomData, getMyChats } from "../../../api/UserApis";
import IMAGES from "../../../assets/images";
import { useBlur } from "../../../context/BlurContext";

const RecentMessages = ({ onclose, dashboard }) => {
  const [msgArray, setMsgArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupActive, setGroupActive] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showFullChat, setShowFullChat] = useState(false);
  const [individualActive, setIndividualActive] = useState(true);

  const { data: groupChats, isPending: groupIsPending } = useQuery({ queryKey: ["chatrooms"], queryFn: getAllChatrooms });
  const { data: individualChats, isPending: individualIsPending } = useQuery({ queryKey: ["individualChats"], queryFn: getMyChats });

  const toggleGroupActive = () => {
    setGroupActive(true);
    setIndividualActive(false);
  };

  const toggleIndividualActive = () => {
    setIndividualActive(true);
    setGroupActive(false);
  };

  const openFullchat = async (chatData, isGroup = false) => {
    setLoading(true);
    setShowFullChat(true);
    setSelectedChat(chatData);
    let result;
    if (isGroup) {
      result = await getChatroomData(chatData?.id);
      setMsgArray(result[0]?.messages || []);
    } else {
      result = await getChatsRoomData(chatData?.id);
      setMsgArray(result?.messages || []);
    }
    setLoading(false);
  };

  const handleShowFullChat = () => setShowFullChat(!showFullChat);

  const ref = useRef(null);

  // Sub-Component: Message Item
  const MessageItem = ({ data, onpress }) => (
    <div
      onClick={onpress}
      className="group flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-blue-50 hover:shadow-sm active:scale-95"
    >
      <div className="relative">
        <img src={IMAGES?.Profile} alt="" className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm" />
        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center">
          <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{data?.name}</p>
          <p className="text-[10px] font-medium text-gray-400">{moment(data?.lastMsg?.time).format("hh:mm a")}</p>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{data?.lastMsg?.message || "No recent messages"}</p>
      </div>
    </div>
  );

  // Sub-Component: Chat Bubble
  const ChatBubble = ({ msg }) => (
    <div className="flex items-start gap-3 mb-6 px-4">
      <img src={msg?.sentBy?.profilePic || IMAGES?.Profile} alt="" className="h-8 w-8 rounded-full shadow-sm mt-1" />
      <div className="flex flex-col max-w-[80%]">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[11px] font-bold text-gray-700">{msg?.sentBy?.name}</span>
          <span className="text-[9px] text-gray-400">{moment(msg?.time).format("ddd, hh:mm a")}</span>
        </div>
        <div className="bg-white text-gray-800 text-sm p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
          {msg?.message}
        </div>
      </div>
    </div>
  );

  // Sub-Component: Full Chat Modal
  const FullChat = ({ onclose, data }) => (
    <div className="fixed sm:w-96 w-full top-20 right-0 bg-[#F8FAFC] z-[210] h-[calc(100vh-80px)] shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src={IMAGES.Profile} alt="" className="h-10 w-10 rounded-full border border-blue-100" />
          <div>
            <p className="font-bold text-gray-800 text-sm">{data?.name}</p>
            <p className="text-[10px] text-green-500 font-medium">Online</p>
          </div>
        </div>
        <button onClick={onclose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <IoClose size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 register-scrollbar bg-[#F8FAFC]">
        {loading ? (
          <div className="h-full flex items-center justify-center"><Loader /></div>
        ) : msgArray.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <p className="text-sm italic">Start a conversation...</p>
          </div>
        ) : (
          msgArray.map((item, index) => <ChatBubble key={index} msg={item} />)
        )}
      </div>

      {/* Visual Input Placeholder to make it look like a real chat */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
          <input disabled placeholder="Type a message..." className="bg-transparent text-sm w-full outline-none" />
          <IoSend className="text-blue-500 opacity-50" />
        </div>
      </div>
    </div>
  );

  const SidebarPanel = () => (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Messages</h2>
          <button onClick={onclose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <IoClose size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-2xl mb-2">
          <button
            onClick={toggleIndividualActive}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${individualActive ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            DIRECT
          </button>
          <button
            onClick={toggleGroupActive}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${groupActive ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            GROUPS
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 register-scrollbar">
        {(individualIsPending || groupIsPending) ? (
          <div className="flex justify-center py-10"><Loader /></div>
        ) : (
          <>
            {individualActive && individualChats?.map((item) => (
              <MessageItem key={item.id} data={item} onpress={() => openFullchat(item, false)} />
            ))}
            {groupActive && groupChats?.map((item) => (
              <MessageItem key={item.id} data={item} onpress={() => openFullchat(item, true)} />
            ))}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-[250] flex flex-row-reverse items-start pointer-events-none h-full w-full sm:w-auto overflow-hidden`}
    >
      <style>{`
        @keyframes chatSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-chat-panel { animation: chatSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Main List Panel */}
      <div 
        ref={ref}
        className={`
          ${showFullChat ? "hidden sm:flex" : "flex"}
          flex-col bg-white border-l border-gray-200 shadow-2xl sm:w-96 w-full pointer-events-auto h-full animate-chat-panel ${!dashboard ? "pt-20" : "pt-0"}
        `}
      >
        <SidebarPanel />
      </div>

      {/* Chat Detail Panel */}
      {showFullChat && (
        <div className={`flex flex-col bg-[#F8FAFC] sm:w-96 w-full h-full shadow-2xl border-l border-gray-200 pointer-events-auto animate-chat-panel ${!dashboard ? "pt-20" : "pt-0"}`}>
          <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={handleShowFullChat} className="p-2 hover:bg-gray-100 rounded-full sm:hidden">
                <IoClose size={20} className="text-gray-500" />
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                {selectedChat?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm truncate max-w-[150px]">{selectedChat?.name}</p>
                <p className="text-[10px] text-green-500 font-medium">Online</p>
              </div>
            </div>
            <button onClick={handleShowFullChat} className="p-2 hover:bg-gray-100 rounded-full hidden sm:block">
              <IoClose size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 register-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader /></div>
            ) : msgArray.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <p className="text-sm italic">No messages yet</p>
              </div>
            ) : (
              msgArray.map((item, index) => <ChatBubble key={index} msg={item} />)
            )}
          </div>

          <div className="p-4 bg-white border-t">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-full">
              <input placeholder="Type a message..." className="bg-transparent text-sm w-full outline-none text-gray-700" />
              <button className="text-blue-500 hover:text-blue-600 transition-colors">
                <IoSend size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentMessages;