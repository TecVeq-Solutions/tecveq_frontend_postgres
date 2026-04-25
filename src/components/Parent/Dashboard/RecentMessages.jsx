import React, { useEffect, useRef, useState } from "react";
import moment from "moment/moment";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { IoClose, IoArrowBack } from "react-icons/io5";
import { RiAttachment2 } from "react-icons/ri";
import { BsFillSendFill } from "react-icons/bs";
import { HiOutlineSearch } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../../context/UserContext";
import { BACKEND_URL_SOCKET } from "../../../constants/api";
import { getChatsRoomData } from "../../../api/UserApis";
import { getParentChatrooms, getTeachersForChat } from "../../../api/Parent/ParentApi";
import useClickOutside from "../../../hooks/useClickOutlise";
import { useBlur } from "../../../context/BlurContext";

const NAVY = "#0B1053";

/* ─── small helpers ─── */
function getInitials(name = "") {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["#0B1053", "#1D9E75", "#D4537E", "#378ADD", "#BA7517", "#D85A30", "#534AB7", "#0F6E56"];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/* ─── tiny styled primitives ─── */
const styles = {
  sidebar: { display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#fff" },
  sidebarHeader: { padding: "18px 16px 0", borderBottom: "1px solid rgba(0,0,0,.07)" },
  titleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title: { fontSize: 16, fontWeight: 600, color: "#101828" },
  closeBtn: { width: 28, height: 28, borderRadius: "50%", background: "#F2F4F7", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#667085" },
  searchWrap: { display: "flex", alignItems: "center", gap: 8, background: "#F9FAFB", border: "1px solid #EAECF0", borderRadius: 10, padding: "8px 12px", marginBottom: 14 },
  searchInput: { border: "none", background: "transparent", fontSize: 13, color: "#344054", outline: "none", width: "100%" },
  tabBar: { display: "flex", borderBottom: "1px solid rgba(0,0,0,.07)" },
  tab: (active) => ({ flex: 1, padding: "10px 0", fontSize: 13, textAlign: "center", cursor: "pointer", color: active ? NAVY : "#667085", fontWeight: active ? 600 : 400, borderBottom: active ? `2px solid ${NAVY}` : "2px solid transparent", background: "none", border: "none", transition: "all .15s" }),
  chatList: { flex: 1, overflowY: "auto", padding: "6px 0" },
  chatItem: (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", background: active ? "#EEF0FA" : "transparent", transition: "background .12s" }),
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: (color) => ({ width: 42, height: 42, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#fff", flexShrink: 0 }),
  chatInfo: { flex: 1, minWidth: 0 },
  nameRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  chatName: { fontSize: 13, fontWeight: 500, color: "#101828", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 },
  chatTime: { fontSize: 11, color: "#98A2B3", flexShrink: 0 },
  previewRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 },
  chatPreview: { fontSize: 12, color: "#667085", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 },
  badge: { background: NAVY, color: "#fff", fontSize: 10, fontWeight: 600, minWidth: 18, height: 18, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", flexShrink: 0 },
  panel: { display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#fff", position: "relative" },
  panelHeader: { padding: "14px 18px", borderBottom: "1px solid rgba(0,0,0,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  panelHeaderLeft: { display: "flex", alignItems: "center", gap: 10 },
  panelName: { fontSize: 14, fontWeight: 600, color: "#101828" },
  panelSub: { fontSize: 11, color: "#667085", marginTop: 1 },
  iconBtn: { width: 32, height: 32, borderRadius: "50%", background: "#F2F4F7", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#667085" },
  messagesArea: { flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 4 },
  msgRow: (mine) => ({ display: "flex", alignItems: "flex-end", gap: 8, margin: "2px 0", flexDirection: mine ? "row-reverse" : "row" }),
  bubble: (mine) => ({ maxWidth: 220, padding: "9px 12px", fontSize: 13, lineHeight: 1.5, wordBreak: "break-word", background: mine ? NAVY : "#F2F4F7", color: mine ? "#fff" : "#101828", borderRadius: mine ? "12px 4px 12px 12px" : "4px 12px 12px 12px" }),
  bubbleMeta: (mine) => ({ fontSize: 10, color: "#98A2B3", marginTop: 3, padding: "0 4px", textAlign: mine ? "right" : "left" }),
  inputArea: { padding: "12px 16px", background: "#fff", borderTop: "1px solid rgba(0,0,0,.05)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, zIndex: 10 },
  msgInput: { flex: 1, background: "#F9FAFB", border: "1px solid #EAECF0", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#344054", outline: "none" },
  sendBtn: { width: 36, height: 36, borderRadius: "50%", background: NAVY, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 },
};

const RecentMessages = ({ onclose, dashboard }) => {
  const containerRef = useRef(null);
  const { toggleBlur } = useBlur();
  useClickOutside(containerRef, () => onclose());

  const [loading, setLoading] = useState(false);
  const [subTab, setSubTab] = useState("recent");
  const [searchText, setSearchText] = useState("");
  const [msgArray, setMsgArray] = useState([]);
  const [localSocket, setLocalSocket] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showFullChat, setShowFullChat] = useState(false);
  const [selectedChatParticipants, setSelectedChatParticipants] = useState([]);

  const { userData } = useUser();

  const handleSendMessage = (msgstr) => {
    if (msgstr === "") return toast.error("Cannot send empty message");
    const messageObj = { sentBy: userData.id, time: new Date(), type: "text", message: msgstr };
    setMsgArray((prev) => [...prev, { ...messageObj, sentBy: userData }]);
    localSocket.emit("message", { members: [userData.id, selectedChat.id], message: messageObj });
  };

  const openFullchat = async (data) => {
    setLoading(true);
    setShowFullChat(true);
    const conn = io(`${BACKEND_URL_SOCKET}/one-to-one`);
    setLocalSocket(conn);
    setSelectedChat(data);
    conn.emit("join", [userData.id, data.id]);
    conn.emit("get-chats", [userData.id, data.id]);
    conn.on("chat-history", (chats) => {
      setSelectedChatParticipants(chats?.participants);
      setMsgArray(chats?.messages);
    });
    setLoading(false);
  };

  useEffect(() => {
    if (localSocket) {
      localSocket.on("message", (data) => {
        if (data.message.sentBy === userData.id) return;
        const sender = selectedChatParticipants?.find(p => p.id === data.message.sentBy) || { name: "Other" };
        setMsgArray((prev) => [...prev, { ...data.message, sentBy: sender }]);
      });
    }
  }, [localSocket, userData.id, selectedChatParticipants]);

  const chatquery = useQuery({ queryKey: ["parent-chatrooms"], queryFn: getParentChatrooms, staleTime: 30000 });
  const teacherquery = useQuery({ queryKey: ["teachers-for-parent-chat"], queryFn: getTeachersForChat, staleTime: 30000 });

  const getArrayData = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (Array.isArray(val.data)) return val.data;
    if (Array.isArray(val.chatrooms)) return val.chatrooms;
    if (Array.isArray(val.teachers)) return val.teachers;
    return [];
  };

  const filterBySearch = (arr) => {
    const list = getArrayData(arr);
    return list.filter((d) => d?.name?.toLowerCase().includes(searchText.toLowerCase()));
  };

  const ChatListItem = ({ data, onpress, isActive, isTeacher }) => (
    <div style={styles.chatItem(isActive)} onClick={onpress}>
      <div style={styles.avatarWrap}>
        <div style={styles.avatar(avatarColor(data?.name))}>{getInitials(data?.name)}</div>
      </div>
      <div style={styles.chatInfo}>
        <div style={styles.nameRow}>
          <span style={styles.chatName}>{data?.name}</span>
          <span style={styles.chatTime}>{data?.lastMsg?.time ? moment(data.lastMsg.time).format("hh:mm a") : ""}</span>
        </div>
        <div style={styles.previewRow}>
          <span style={styles.chatPreview}>
            {isTeacher ? "Tap to start conversation" : (data?.lastMsg?.message || "")}
          </span>
        </div>
      </div>
    </div>
  );

  const MessageBubble = ({ msg }) => {
    const mine = msg?.sentBy?.id === userData.id;
    const name = msg?.sentBy?.name || "Other";
    return (
      <div>
        <div style={styles.msgRow(mine)}>
          <div style={styles.bubble(mine)}>{msg.message}</div>
        </div>
        <div style={styles.bubbleMeta(mine)}>{mine ? "You" : name} · {moment(msg.time).format("hh:mm a")}</div>
      </div>
    );
  };

  const FullChat = ({ onclose, data }) => {
    const [msgstr, setmsgStr] = useState("");
    const endRef = useRef(null);
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgArray]);
    const handleKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); handleSendMessage(msgstr); setmsgStr(""); } };

    return (
      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <div style={styles.panelHeaderLeft}>
            <button style={styles.iconBtn} onClick={onclose} className="sm:hidden"><IoArrowBack size={16} /></button>
            <div style={styles.avatar(avatarColor(data?.name))}>{getInitials(data?.name)}</div>
            <div style={styles.panelName}>{data?.name}</div>
          </div>
          <button style={styles.iconBtn} onClick={onclose}><IoClose size={16} /></button>
        </div>
        {loading ? <div className="flex-1 flex items-center justify-center"><Loader /></div> :
          <div style={styles.messagesArea}>
            {msgArray?.map((item, index) => <MessageBubble key={index} msg={item} />)}
            <div ref={endRef} />
          </div>}
        <div style={styles.inputArea}>
          <input style={styles.msgInput} type="text" value={msgstr} onChange={(e) => setmsgStr(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." />
          <button style={styles.sendBtn} onClick={() => { handleSendMessage(msgstr); setmsgStr(""); }}><BsFillSendFill size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="fixed right-0 inset-y-0 z-[250] flex flex-row-reverse items-start pointer-events-none h-full w-full sm:w-auto overflow-hidden">
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0.5; } to { transform: translateX(0); opacity: 1; } }
        .animate-chat-slide { animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      <div className={`
        ${showFullChat ? "hidden sm:flex" : "flex"}
        flex-col overflow-hidden bg-white border-l border-black/10 shadow-2xl sm:w-96 w-full pointer-events-auto h-full animate-chat-slide
      `} style={{ boxShadow: "-4px 0 24px rgba(11,16,83,.10)" }}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.titleRow}><span style={styles.title}>Messages</span><button style={styles.closeBtn} onClick={onclose}><IoClose size={14} /></button></div>
            <div style={styles.searchWrap}><HiOutlineSearch size={15} color="#98A2B3" /><input style={styles.searchInput} type="text" placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} /></div>
            <div style={styles.tabBar}>
              <button style={styles.tab(subTab === "recent")} onClick={() => setSubTab("recent")}>Recent</button>
              <button style={styles.tab(subTab === "teachers")} onClick={() => setSubTab("teachers")}>Teachers</button>
            </div>
          </div>
          <div style={styles.chatList}>
            {chatquery.isPending && subTab === "recent" && <div className="flex justify-center py-4"><Loader /></div>}
            {teacherquery.isPending && subTab === "teachers" && <div className="flex justify-center py-4"><Loader /></div>}
            
            {subTab === "recent" && !chatquery.isPending && filterBySearch(chatquery.data).map((item) => <ChatListItem key={item.id} data={item} isActive={selectedChat?.id === item.id} onpress={() => openFullchat(item)} />)}
            {subTab === "teachers" && !teacherquery.isPending && filterBySearch(teacherquery.data).map((item) => <ChatListItem key={item.id} data={item} isTeacher isActive={selectedChat?.id === item.id} onpress={() => openFullchat(item)} />)}
            
            {!chatquery.isPending && subTab === "recent" && filterBySearch(chatquery.data).length === 0 && <div className="text-center py-10 text-gray-400 text-sm italic">No recent chats found</div>}
            {!teacherquery.isPending && subTab === "teachers" && filterBySearch(teacherquery.data).length === 0 && <div className="text-center py-10 text-gray-400 text-sm italic">No teachers found</div>}
          </div>
        </div>
      </div>
      {showFullChat && <div className="w-full sm:w-96 pointer-events-auto h-full overflow-hidden animate-chat-slide" style={{ boxShadow: "-4px 0 24px rgba(11,16,83,.10)" }}><FullChat onclose={() => setShowFullChat(false)} data={selectedChat} /></div>}
    </div>
  );
};

export default RecentMessages;
