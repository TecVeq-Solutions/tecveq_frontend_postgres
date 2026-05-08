import React, { useRef, useState, useEffect } from "react";
import moment from "moment/moment";
import Loader from "../../utils/Loader";
import { IoClose, IoSend, IoArrowBack, IoTrash } from "react-icons/io5";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllAdmins } from "../../api/Admin/AdminApi";
import { getChatroomData, deleteChatroom } from "../../api/Admin/ChatroomApi";
import { io } from "socket.io-client";
import { useUser } from "../../context/UserContext";
import { BACKEND_URL_SOCKET } from "../../constants/api";
import { toast } from "react-toastify";

const SuperAdminMessages = ({ onclose }) => {
  const { userData } = useUser();
  const [msgArray, setMsgArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showFullChat, setShowFullChat] = useState(false);
  const [msgstr, setmsgStr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: adminsData, isPending: adminsIsPending } = useQuery({
    queryKey: ["allAdmins"],
    queryFn: getAllAdmins,
  });

  // Filter admins - exclude self
  const adminsList = (adminsData || []).filter(
    (u) => u.id !== userData?.id && u.userType?.toLowerCase() === "admin"
  ).filter((u) => {
    if (!searchTerm) return true;
    return u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  useEffect(() => {
    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgArray]);

  const openFullchat = async (chatData) => {
    if (!userData?.id || !chatData) return;

    const targetId = chatData.id;
    const chatName = chatData.name || chatData.email || "Admin";

    setSelectedChat({ ...chatData, id: targetId, name: chatName, isGroup: false });
    setShowFullChat(true);

    if (socket.current) socket.current.disconnect();

    const conn = io(`${BACKEND_URL_SOCKET}/one-to-one`);
    socket.current = conn;

    setLoading(true);
    setMsgArray([]);

    conn.emit("join", [userData.id, targetId]);
    conn.emit("get-chats", [userData.id, targetId]);
    conn.on("chat-history", (history) => {
      setMsgArray(history?.messages || []);
      setLoading(false);
    });

    conn.on("message", (data) => {
      if (!data?.message) return;
      if (data.message.sentBy === userData.id) return;
      setMsgArray((prev) => [
        ...prev,
        {
          ...data.message,
          sentBy: {
            id: data.message.sentBy,
            name: data.message.senderName,
            userType: data.message.senderRole,
          },
        },
      ]);
    });
  };

  const handleDeleteChat = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    const { id } = deleteConfirm;
    try {
      await deleteChatroom(id);
      toast.success("Conversation deleted successfully");
      queryClient.invalidateQueries(["allAdmins"]);
      if (selectedChat?.id === id) setShowFullChat(false);
    } catch (error) {
      toast.error("Failed to delete chat");
    } finally {
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const handleSendMessage = () => {
    if (!msgstr.trim() || !selectedChat || !socket.current) return;

    const messageObj = {
      sentBy: userData.id,
      senderName: userData.name,
      senderRole: userData.userType,
      time: new Date(),
      type: "text",
      message: msgstr,
    };

    socket.current.emit("message", {
      members: [userData.id, selectedChat.id],
      message: messageObj,
    });

    setMsgArray((prev) => [...prev, { ...messageObj, sentBy: userData }]);
    setmsgStr("");
  };

  const MessageItem = ({ data, onpress, isActive, onDelete }) => {
    const displayName = data?.name || data?.email || "Admin";
    const displayPic = data?.profilePic;

    return (
      <div
        onClick={onpress}
        className={`group relative flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer transition-all duration-300 
        ${isActive ? "bg-blue-50 border-blue-200 border shadow-sm" : "hover:bg-gray-50 border border-transparent"}`}
      >
        <div className="relative flex-shrink-0">
          <div className="h-11 w-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200 overflow-hidden">
            {displayPic ? (
              <img src={displayPic} className="h-full w-full object-cover" alt={displayName} />
            ) : (
              displayName?.charAt(0)?.toUpperCase()
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className={`text-sm font-bold truncate ${isActive ? "text-blue-700" : "text-gray-800"}`}>
                {displayName}
              </p>
              <span className="text-[9px] uppercase text-gray-400 font-semibold">Admin</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 truncate">Start a conversation</p>
        </div>

        {/* Delete Icon */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <IoTrash size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed top-[72px] right-0 bottom-0 z-[250] flex flex-row-reverse items-start pointer-events-none gap-4 px-4 overflow-hidden">

      {/* Chat Detail Panel */}
      {showFullChat && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="flex flex-col bg-white sm:w-96 w-[90vw] shadow-2xl border border-gray-100 pointer-events-auto h-full rounded-t-2xl animate-chat-panel"
        >
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFullChat(false)}
                className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoArrowBack size={20} />
              </button>
              <div>
                <p className="font-bold text-gray-800 leading-tight">{selectedChat?.name}</p>
                <span className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">Admin</span>
              </div>
            </div>
            <button onClick={() => setShowFullChat(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <IoClose size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading ? (
              <div className="flex justify-center mt-10"><Loader /></div>
            ) : (
              msgArray.map((m, i) => {
                const isMe = m?.sentBy?.id === userData?.id;
                const senderRole = m?.sentBy?.userType?.toUpperCase() || "USER";
                const senderName = m?.sentBy?.name || "Unknown";

                return (
                  <div key={i} className={`mb-4 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`flex items-center gap-1.5 mb-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <span className="text-[10px] font-bold text-gray-700">{senderName}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black tracking-tighter 
                        ${senderRole === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-600' :
                          senderRole === 'ADMIN' ? 'bg-red-100 text-red-600' :
                          'bg-emerald-100 text-emerald-600'}`}>
                        {senderRole}
                      </span>
                    </div>
                    <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm transition-all
                      ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"}`}>
                      {m?.message}
                      <p className={`text-[8px] mt-1 text-right ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                        {moment(m.time).format("hh:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
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
                placeholder="Type a message..."
              />
              <button onClick={handleSendMessage} className="text-blue-600">
                <IoSend />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admins List Panel */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={`flex flex-col bg-white border border-gray-100 shadow-xl w-80 md:w-96 pointer-events-auto h-full rounded-t-2xl 
        ${showFullChat ? "hidden sm:flex" : "flex"}`}
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            <button onClick={onclose}><IoClose size={22} className="text-gray-400" /></button>
          </div>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
          {adminsIsPending ? (
            <div className="flex justify-center p-10"><Loader /></div>
          ) : adminsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <p className="text-sm font-medium">No admins found</p>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-[10px] font-black tracking-[0.1em] text-gray-400 uppercase">ADMINS</span>
                <div className="h-[1px] flex-1 bg-gray-100"></div>
                <span className="text-[10px] font-bold text-gray-300">{adminsList.length}</span>
              </div>
              {adminsList.map((admin) => (
                <MessageItem
                  key={admin.id}
                  data={admin}
                  isActive={selectedChat?.id === admin.id}
                  onpress={() => openFullchat(admin)}
                  onDelete={handleDeleteChat}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <IoTrash size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Chat?</h3>
              <p className="text-sm text-gray-500">This will permanently remove all messages from this conversation.</p>
            </div>
            <div className="flex border-t">
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ show: false, id: null }); }}
                className="flex-1 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-r"
              >
                Cancel
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); confirmDelete(); }}
                className="flex-1 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminMessages;
