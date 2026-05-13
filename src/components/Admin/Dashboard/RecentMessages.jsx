import React, { useRef, useState, useEffect } from "react";
import moment from "moment/moment";
import Loader from "../../../utils/Loader";
import { IoClose, IoSend, IoArrowBack, IoTrash } from "react-icons/io5";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllChatrooms, getChatroomData, deleteChatroom } from "../../../api/Admin/ChatroomApi";
import { getChatsRoomData, getMyChats } from "../../../api/UserApis";
import { getAllUsers } from "../../../api/Admin/AdminApi";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, isGroup: false });
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Dynamic Data Fetching using React Query
  const { data: groupChats, isPending: groupIsPending } = useQuery({
    queryKey: ["chatrooms"],
    queryFn: getAllChatrooms
  });
  const { data: allUsersResponse, isPending: usersIsPending } = useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsers
  });

  // Filter and Sort Users
  const filteredUsers = allUsersResponse?.filter(u => {
    if (u.id === userData.id) return false;
    if (u.userType?.toLowerCase() === 'admin') return false;
    if (u.userType?.toLowerCase() === 'super_admin') return false;
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return u.name.toLowerCase().includes(search) ||
      u.userType.toLowerCase().includes(search) ||
      (u.classroomStudents?.[0]?.name || "").toLowerCase().includes(search);
  }) || [];

  // Group users by role
  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const role = user.userType === 'super_admin' ? 'ADMIN' : user.userType.toUpperCase();
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {});

  // Sort groups and users within groups
  const roleOrder = ["TEACHER", "STUDENT", "PARENT", "ADMIN"];
  const sortedRoles = Object.keys(groupedUsers).sort((a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b));
  sortedRoles.forEach(role => {
    if (groupedUsers[role]) {
      groupedUsers[role].sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
    }
  });

  // Group Group Chats by Classroom
  const groupedGroups = groupChats?.reduce((acc, chat) => {
    const className = chat.classroom?.name || "General Groups";
    if (!acc[className]) acc[className] = [];
    acc[className].push(chat);
    return acc;
  }, {}) || {};

  const sortedGroupClasses = Object.keys(groupedGroups).sort();

  useEffect(() => {
    // Cleanup socket on unmount
    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, []);

  // Removed old socket room join logic as it's now handled in openFullchat

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgArray]);

  const openFullchat = async (chatData, isGroup = false) => {
    if (!userData?.id || !chatData) return;

    // If it's a 1:1 chat with a user object, normalize the target ID
    const targetId = isGroup ? chatData.id : (chatData.participants ? chatData.participants.find(p => p.id !== userData.id)?.id : chatData.id);
    const chatName = chatData.name || (chatData.participants ? chatData.participants.find(p => p.id !== userData.id)?.name : chatData.name) || "Chat";

    setSelectedChat({ ...chatData, id: targetId, name: chatName, isGroup });
    setShowFullChat(true);

    if (socket.current) {
      socket.current.disconnect();
    }

    const namespace = isGroup ? "/chatroom" : "/one-to-one";
    const conn = io(`${BACKEND_URL_SOCKET}${namespace}`);
    socket.current = conn;

    setLoading(true);
    setMsgArray([]);

    if (isGroup) {
      conn.emit("join", { room: targetId });
      try {
        const result = await getChatroomData(targetId);
        // Handle both single object and array responses
        const messages = Array.isArray(result) ? result[0]?.messages : result?.messages;
        setMsgArray(messages || []);
      } catch (error) {
        toast.error("Failed to load group messages");
      } finally {
        setLoading(false);
      }
    } else {
      conn.emit("join", [userData.id, targetId]);
      conn.emit("get-chats", [userData.id, targetId]);
      conn.on("chat-history", (history) => {
        setMsgArray(history?.messages || []);
        setLoading(false);
      });
    }

    conn.on("message", (data) => {
      if (!data?.message) return;
      if (data.message.sentBy === userData.id) return;
      // Ensure sentBy is an object to match m.sentBy?.id checks in the UI
      setMsgArray((prev) => [...prev, {
        ...data.message,
        sentBy: {
          id: data.message.sentBy,
          name: data.message.senderName,
          userType: data.message.senderRole
        }
      }]);
    });
  };

  const handleDeleteChat = (id, isGroup = false) => {
    setDeleteConfirm({ show: true, id, isGroup });
  };

  const confirmDelete = async () => {
    const { id, isGroup } = deleteConfirm;
    try {
      let chatId = id;
      if (!isGroup) {
        const chatroom = groupChats?.find(c => !c.classroomID && c.participants.some(p => p.id === id));
        if (chatroom) chatId = chatroom.id;
        else {
          setDeleteConfirm({ show: false, id: null, isGroup: false });
          return toast.info("No chat history to delete");
        }
      }

      await deleteChatroom(chatId);
      toast.success("Conversation deleted successfully");
      queryClient.invalidateQueries(["chatrooms"]);
      if (selectedChat?.id === id) setShowFullChat(false);
    } catch (error) {
      toast.error("Failed to delete chat");
    } finally {
      setDeleteConfirm({ show: false, id: null, isGroup: false });
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

    if (selectedChat.isGroup) {
      socket.current.emit("message", { room: selectedChat.id, message: messageObj });
    } else {
      socket.current.emit("message", { members: [userData.id, selectedChat.id], message: messageObj });
    }

    setMsgArray((prev) => [...prev, { ...messageObj, sentBy: userData }]);
    setmsgStr("");
  };

  // --- Sub-Components ---
  const MessageItem = ({ data, onpress, isActive, isGroup = false, onDelete }) => {
    const displayName = isGroup ? data?.name : (data?.name || data?.participants?.find(p => p.id !== userData.id)?.name || "Unknown");
    const displayPic = isGroup ? null : (data?.profilePic || data?.participants?.find(p => p.id !== userData.id)?.profilePic);
    const lastMsg = data?.lastMsg?.message || data?.lastMsgText || "Start a conversation";
    const lastTime = data?.lastMsg?.time || data?.lastMsgTime;
    const userRole = !isGroup ? (data?.userType || data?.participants?.find(p => p.id !== userData.id)?.userType) : null;

    // Dynamically get classroom name
    const className = !isGroup ? (
      data?.classroomStudents?.[0]?.name ||
      data?.classroomTeachers?.[0]?.classroom?.name ||
      data?.students?.[0]?.classroomStudents?.[0]?.name ||
      data?.level?.name ||
      ""
    ) : null;

    return (
      <div
        onClick={onpress}
        className={`group relative flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer transition-all duration-300 
        ${isActive ? "bg-blue-50 border-blue-200 border shadow-sm" : "hover:bg-gray-50 border border-transparent"}`}
      >
        <div className="relative flex-shrink-0">
          <div className={`h-11 w-11 rounded-full ${isGroup ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600"} flex items-center justify-center font-bold border border-blue-200 overflow-hidden`}>
            {displayPic ? <img src={displayPic} className="h-full w-full object-cover" /> : displayName?.charAt(0)}
          </div>
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className={`text-sm font-bold truncate ${isActive ? "text-blue-700" : "text-gray-800"}`}>{displayName}</p>
              <div className="flex items-center gap-1">
                {userRole && <span className="text-[9px] uppercase text-gray-400 font-semibold">{userRole}</span>}
                {className && <span className="text-[9px] text-blue-500 font-medium">• {className}</span>}
              </div>
            </div>
            <span className="text-[10px] text-gray-400">{lastTime ? moment(lastTime).format("hh:mm a") : ""}</span>
          </div>
          <p className="text-xs text-gray-500 truncate">{lastMsg}</p>
        </div>

        {/* Delete Icon */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(data.id, isGroup); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <IoTrash size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed top-20 right-0 bottom-0 z-[250] flex flex-row-reverse items-start pointer-events-none gap-4 px-4 overflow-hidden">

      {/* 1. CHAT DETAIL PANEL (Right Side) */}
      {showFullChat && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="flex flex-col bg-white sm:w-96 w-[90vw] shadow-2xl border border-gray-100 pointer-events-auto h-full rounded-t-2xl animate-chat-panel"
        >
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowFullChat(false)} className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><IoArrowBack size={20} /></button>
              <div>
                <p className="font-bold text-gray-800 leading-tight">{selectedChat?.name}</p>
                {selectedChat?.isGroup && (
                  <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">
                    Group • {selectedChat?.participants?.length || 0} Members
                  </p>
                )}
              </div>
            </div>
            <button onClick={() => setShowFullChat(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><IoClose size={20} className="text-gray-400" /></button>
          </div>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading ? <div className="flex justify-center mt-10"><Loader /></div> :
              msgArray.map((m, i) => {
                const isMe = m?.sentBy?.id === userData?.id;
                const senderRole = m?.sentBy?.userType?.toUpperCase() || "USER";
                const senderName = m?.sentBy?.name || "Unknown";

                return (
                  <div key={i} className={`mb-4 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`flex items-center gap-1.5 mb-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <span className="text-[10px] font-bold text-gray-700">{senderName}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black tracking-tighter 
                        ${senderRole === 'ADMIN' ? 'bg-red-100 text-red-600' :
                          senderRole === 'TEACHER' ? 'bg-amber-100 text-amber-600' :
                            'bg-emerald-100 text-emerald-600'}`}>
                        {senderRole}
                      </span>
                    </div>
                    <div className={`p-2 rounded-2xl max-w-[85%] text-sm shadow-sm transition-all
                      ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"}`}>
                      {m?.message}
                      <p className={`text-[8px] mt-1 text-right ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                        {moment(m.time).format("hh:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })
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
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={`flex flex-col bg-white border border-gray-100 shadow-xl w-80 md:w-96 pointer-events-auto h-full rounded-t-2xl 
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
          {individualActive && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search by name or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
          {usersIsPending || groupIsPending ? <div className="flex justify-center p-10"><Loader /></div> : (
            <>
              {individualActive && sortedRoles.map(role => (
                <div key={role} className="mb-6">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="text-[10px] font-black tracking-[0.1em] text-gray-400 uppercase">{role}S</span>
                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                    <span className="text-[10px] font-bold text-gray-300">{groupedUsers[role].length}</span>
                  </div>
                  {groupedUsers[role].map(user => (
                    <MessageItem key={user.id} data={user} isActive={selectedChat?.id === user.id} onpress={() => openFullchat(user, false)} onDelete={handleDeleteChat} />
                  ))}
                </div>
              ))}
              {groupActive && (
                <div className="space-y-6">
                  {sortedGroupClasses.map(className => (
                    <div key={className}>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <span className="text-[10px] font-black tracking-[0.1em] text-blue-400 uppercase">{className}</span>
                        <div className="h-[1px] flex-1 bg-blue-50"></div>
                      </div>
                      {groupedGroups[className].map(group => (
                        <MessageItem key={group.id} data={group} isGroup={true} isActive={selectedChat?.id === group.id} onpress={() => openFullchat(group, true)} onDelete={handleDeleteChat} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 4. CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteConfirm.show && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-zoom-in"
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
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ show: false, id: null, isGroup: false }); }}
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

export default RecentMessages;