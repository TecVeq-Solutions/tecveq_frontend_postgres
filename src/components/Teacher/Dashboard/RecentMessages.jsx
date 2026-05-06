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
import { getChatsRoomData, getMyChats } from "../../../api/UserApis";
import { getParentsForChat, getStudentsForChat } from "../../../api/Teacher/chat";
import useClickOutside from "../../../hooks/useClickOutlise";
import { useBlur } from "../../../context/BlurContext";

const NAVY = "#0B1053";

/* ─── small helpers ─── */
function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "#0B1053", "#1D9E75", "#D4537E", "#378ADD",
  "#BA7517", "#D85A30", "#534AB7", "#0F6E56",
];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/* ─── tiny styled primitives ─── */
const styles = {
  sidebar: {
    display: "flex", flexDirection: "column",
    width: "100%", height: "100%", background: "#fff",
  },
  sidebarHeader: {
    padding: "24px 16px 0", borderBottom: "1px solid rgba(0,0,0,.07)",
  },
  titleRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14,
  },
  title: { fontSize: 16, fontWeight: 600, color: "#101828" },
  closeBtn: {
    width: 28, height: 28, borderRadius: "50%",
    background: "#F2F4F7", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", color: "#667085",
  },
  searchWrap: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#F9FAFB", border: "1px solid #EAECF0",
    borderRadius: 10, padding: "8px 12px", marginBottom: 14,
  },
  searchInput: {
    border: "none", background: "transparent", fontSize: 13, color: "#344054", outline: "none", width: "100%",
  },
  tabBar: { display: "flex", borderBottom: "1px solid rgba(0,0,0,.07)" },
  tab: (active) => ({
    flex: 1, padding: "10px 0", fontSize: 13, textAlign: "center", cursor: "pointer",
    color: active ? NAVY : "#667085", fontWeight: active ? 600 : 400,
    background: "none", border: "none", borderBottom: active ? `2px solid ${NAVY}` : "2px solid transparent",
    transition: "all .15s",
  }),
  chatList: { flex: 1, overflowY: "auto", padding: "6px 0" },
  chatItem: (active) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer",
    background: active ? "#EEF0FA" : "transparent", transition: "background .12s",
  }),
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: (color, group) => ({
    width: 42, height: 42, borderRadius: group ? 10 : "50%", background: color,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 600, color: "#fff", flexShrink: 0,
  }),
  onlineDot: {
    width: 10, height: 10, background: "#12B76A", border: "2px solid #fff", borderRadius: "50%",
    position: "absolute", bottom: 1, right: 1,
  },
  chatInfo: { flex: 1, minWidth: 0 },
  nameRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  chatName: { fontSize: 13, fontWeight: 500, color: "#101828", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 },
  chatTime: { fontSize: 11, color: "#98A2B3", flexShrink: 0 },
  previewRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 },
  chatPreview: { fontSize: 12, color: "#667085", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 },
  badge: {
    background: NAVY, color: "#fff", fontSize: 10, fontWeight: 600, minWidth: 18, height: 18,
    borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", flexShrink: 0,
  },
  panel: {
    display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#fff", position: "relative",
  },
  panelHeader: {
    padding: "14px 18px", borderBottom: "1px solid rgba(0,0,0,.07)",
    display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
  },
  panelHeaderLeft: { display: "flex", alignItems: "center", gap: 10 },
  panelName: { fontSize: 14, fontWeight: 600, color: "#101828" },
  panelSub: { fontSize: 11, color: "#667085", marginTop: 1 },
  iconBtn: {
    width: 32, height: 32, borderRadius: "50%", background: "#F2F4F7",
    border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#667085",
  },
  messagesArea: { flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 4 },
  dateDivider: { textAlign: "center", fontSize: 11, color: "#98A2B3", margin: "8px 0", display: "flex", alignItems: "center", gap: 8 },
  msgRow: (mine) => ({ display: "flex", alignItems: "flex-end", gap: 8, margin: "2px 0", flexDirection: mine ? "row-reverse" : "row" }),
  msgAvatar: (color) => ({
    width: 28, height: 28, borderRadius: "50%", background: color,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#fff", flexShrink: 0,
  }),
  bubble: (mine) => ({
    maxWidth: 220, padding: "9px 12px", fontSize: 13, lineHeight: 1.5, wordBreak: "break-word",
    background: mine ? NAVY : "#F2F4F7", color: mine ? "#fff" : "#101828",
    borderRadius: mine ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
  }),
  bubbleMeta: (mine) => ({ fontSize: 10, color: "#98A2B3", marginTop: 3, padding: "0 4px", textAlign: mine ? "right" : "left" }),
  inputArea: {
    padding: "12px 16px", background: "#fff", borderTop: "1px solid rgba(0,0,0,.05)",
    display: "flex", alignItems: "center", gap: 10, flexShrink: 0, zIndex: 10,
  },
  msgInput: {
    flex: 1, background: "#F9FAFB", border: "1px solid #EAECF0", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#344054", outline: "none",
  },
  attachBtn: {
    width: 36, height: 36, borderRadius: "50%", background: "#F2F4F7", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", color: NAVY, flexShrink: 0,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: "50%", background: NAVY, border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0,
  },
};

const RecentMessages = ({ onclose, dashboard }) => {
  const containerRef = useRef(null);
  const { toggleBlur } = useBlur();
  useClickOutside(containerRef, () => onclose());

  const [loading, setLoading] = useState(false);
  const [groupActive, setGroupActive] = useState(false);
  const [individualActive, setIndividualActive] = useState(true);
  const [subTab, setSubTab] = useState("parents");
  const [selectedChatParticipants, setSelectedChatParticipants] = useState([]);
  const [msgArray, setMsgArray] = useState([]);
  const [msgArrayParent, setMsgArrayParent] = useState([]);
  const [localSocket, setLocalSocket] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showFullChat, setShowFullChat] = useState(false);
  const [showParentChat, setShowParentChat] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { socketContext, setSocketContext, userData } = useUser();

  const handleSendMessage = (msgstr) => {
    if (msgstr === "") return toast.error("Cannot send empty message");
    const messageObj = { sentBy: userData.id, time: new Date(), type: "text", message: msgstr };
    if (showFullChat) setMsgArray((prev) => [...prev, { ...messageObj, sentBy: userData }]);
    localSocket.emit("message", { room: selectedChat?.id, message: messageObj });
  };

  const handleSendMessageParent = (msgstr) => {
    if (msgstr === "") return toast.error("Cannot send empty message");
    const messageObj = { sentBy: userData.id, time: new Date(), type: "text", message: msgstr };
    setMsgArrayParent((prev) => [...prev, { ...messageObj, sentBy: userData }]);
    localSocket.emit("message", { message: messageObj, members: [userData?.id, selectedChat?.id] });
  };

  const openFullchat = async (data) => {
    setLoading(true);
    setShowParentChat(false);
    setShowFullChat(true);
    let conn = io(`${BACKEND_URL_SOCKET}/chatroom`);
    setSocketContext(conn);
    setLocalSocket(conn);
    setSelectedChat(data);
    setSelectedChatParticipants(data.participants);
    conn.emit("join", { room: data.id });
    const result = await getChatsRoomData(data.id);
    setMsgArray(result.messages);
    setLoading(false);
  };

  const openParentChat = async (data) => {
    setLoading(true);
    setShowFullChat(false);
    setShowParentChat(true);
    const conn = io(`${BACKEND_URL_SOCKET}/one-to-one`);
    setLocalSocket(conn);
    setSelectedChat(data);
    conn.emit("join", [userData.id, data.id]);
    conn.emit("get-chats", [userData.id, data.id]);
    conn.on("chat-history", (chats) => {
      setSelectedChatParticipants(chats.participants);
      setMsgArrayParent(chats.messages);
    });
    setLoading(false);
  };

  const getParticipantData = (pid) => {
    if (pid === userData.id) return userData;
    let user = {};
    selectedChatParticipants.forEach((item) => { if (item.id === pid) user = item; });
    return user;
  };

  useEffect(() => {
    if (localSocket) {
      localSocket.on("message", (data) => {
        if (data.message.sentBy === userData.id) return;
        let user = getParticipantData(data.message.sentBy);
        if (showFullChat) {
          setMsgArray((prev) => [...prev, { ...data.message, sentBy: user }]);
        } else if (showParentChat) {
          setMsgArrayParent((prev) => [...prev, { ...data.message, sentBy: user }]);
        }
      });
    }
  }, [localSocket, showFullChat, showParentChat, userData.id]);

  const chatquery = useQuery({ queryKey: ["chat"], queryFn: getMyChats, staleTime: 30000 });
  const parentchatquery = useQuery({ queryKey: ["parent-chat"], queryFn: getParentsForChat, staleTime: 30000, enabled: individualActive });
  const studentchatquery = useQuery({ queryKey: ["student-chat"], queryFn: getStudentsForChat, staleTime: 30000, enabled: individualActive });

  const filterBySearch = (arr) => arr?.filter((d) => d?.name?.toLowerCase().includes(searchText.toLowerCase())) ?? [];

  const ChatListItem = ({ data, onpress, isGroup, isActive }) => (
    <div
      style={styles.chatItem(isActive)} onClick={onpress}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#F9FAFB"; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={styles.avatarWrap}>
        <div style={styles.avatar(avatarColor(data?.name), isGroup)}>{getInitials(data?.name)}</div>
        {data?.online && <div style={styles.onlineDot} />}
      </div>
      <div style={styles.chatInfo}>
        <div style={styles.nameRow}>
          <span style={styles.chatName}>{data?.name}</span>
          <span style={styles.chatTime}>{moment(data?.lastMsg?.time).format("hh:mm a")}</span>
        </div>
        <div style={styles.previewRow}>
          <span style={styles.chatPreview}>{data?.lastMsg?.message}</span>
          {data?.unread > 0 && <span style={styles.badge}>{data.unread}</span>}
        </div>
      </div>
    </div>
  );

  const GroupMsg = ({ msg }) => {
    const mine = msg?.sentBy?.id === userData.id;
    const name = msg?.sentBy?.name || "You";
    return (
      <div>
        <div style={styles.msgRow(mine)}>
          {!mine && <div style={styles.msgAvatar(avatarColor(name))}>{getInitials(name)}</div>}
          <div style={styles.bubble(mine)}>{msg.message}</div>
        </div>
        <div style={styles.bubbleMeta(mine)}>{mine ? "You" : name} · {moment(msg.time).format("hh:mm a")}</div>
      </div>
    );
  };

  const FullChat = ({ onclose, data, type }) => {
    const [msgstr, setmsgStr] = useState("");
    const messagesEndRef = useRef(null);
    const handleKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); (type === "group" ? handleSendMessage(msgstr) : handleSendMessageParent(msgstr)); setmsgStr(""); } };
    const currentMsgArray = type === "group" ? msgArray : msgArrayParent;
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [currentMsgArray]);

    return (
      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <div style={styles.panelHeaderLeft}>
            <button style={styles.iconBtn} onClick={onclose} className="sm:hidden"><IoArrowBack size={16} /></button>
            <div style={styles.avatar(avatarColor(data?.name), type === "group")}>{getInitials(data?.name)}</div>
            <div>
              <div style={styles.panelName}>{data?.name}</div>
              <div style={styles.panelSub}>{type === "group" ? `${data?.participants?.length ?? ""} members` : "Online"}</div>
            </div>
          </div>
          <button style={styles.iconBtn} onClick={onclose}><IoClose size={16} /></button>
        </div>
        {loading ? <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Loader /></div> :
          <div style={styles.messagesArea}>
            <div style={styles.dateDivider}><span style={{ flex: 1, height: 1, background: "rgba(0,0,0,.07)" }} /><span>Today</span><span style={{ flex: 1, height: 1, background: "rgba(0,0,0,.07)" }} /></div>
            {currentMsgArray.map((item, index) => <GroupMsg key={index} msg={item} />)}
            <div ref={messagesEndRef} />
          </div>}
        <div style={styles.inputArea}>
          <input type="text" value={msgstr} onChange={(e) => setmsgStr(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." style={styles.msgInput} />
          <button style={styles.attachBtn}><RiAttachment2 size={18} /></button>
          <button style={styles.sendBtn} onClick={() => { (type === "group" ? handleSendMessage(msgstr) : handleSendMessageParent(msgstr)); setmsgStr(""); }}><BsFillSendFill size={14} /></button>
        </div>
      </div>
    );
  };

  const SidebarPanel = () => (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <div style={styles.titleRow}><span style={styles.title}>Messages</span><button style={styles.closeBtn} onClick={onclose}><IoClose size={14} /></button></div>
        <div style={styles.searchWrap}><HiOutlineSearch size={15} color="#98A2B3" /><input style={styles.searchInput} type="text" placeholder="Search conversations..." value={searchText} onChange={(e) => setSearchText(e.target.value)} /></div>
        <div style={styles.tabBar}>
          <button style={styles.tab(individualActive)} onClick={() => { setIndividualActive(true); setGroupActive(false); }}>Recent</button>
          <button style={styles.tab(groupActive)} onClick={() => { setGroupActive(true); setIndividualActive(false); }}>Group</button>
        </div>
        {individualActive && (
          <div className="flex gap-4 py-1 justify-around">
            <p className={`text-xs cursor-pointer ${subTab === "parents" ? "text-navy font-bold border-b-2 border-navy" : "text-gray-400"}`} onClick={() => setSubTab("parents")}>Parents</p>
            <p className={`text-xs cursor-pointer ${subTab === "students" ? "text-navy font-bold border-b-2 border-navy" : "text-gray-400"}`} onClick={() => setSubTab("students")}>Students</p>
          </div>
        )}
      </div>
      <div style={styles.chatList}>
        {groupActive && !chatquery.isPending && filterBySearch(chatquery.data).map((item) => <ChatListItem key={item.id} data={item} isGroup isActive={selectedChat?.id === item.id && showFullChat} onpress={() => openFullchat(item)} />)}
        {individualActive && subTab === "parents" && !parentchatquery.isPending && filterBySearch(parentchatquery.data).map((item) => <ChatListItem key={item.id} data={item} isActive={selectedChat?.id === item.id && showParentChat} onpress={() => openParentChat(item)} />)}
        {individualActive && subTab === "students" && !studentchatquery.isPending && filterBySearch(studentchatquery.data).map((item) => <ChatListItem key={item.id} data={item} isActive={selectedChat?.id === item.id && showParentChat} onpress={() => openParentChat(item)} />)}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="fixed right-0 top-16 sm:top-20 bottom-0 z-[250] flex flex-row-reverse items-start pointer-events-none w-full sm:w-auto overflow-hidden">
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0.5; } to { transform: translateX(0); opacity: 1; } }
        .animate-chat-slide { animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      <div className={`
        ${(showFullChat || showParentChat) ? "hidden sm:flex" : "flex"}
        flex-col overflow-hidden bg-white border-l border-black/10 shadow-2xl sm:w-96 w-full pointer-events-auto h-full animate-chat-slide
      `} style={{ boxShadow: "-4px 0 24px rgba(11,16,83,.10)" }}>
        <SidebarPanel />
      </div>
      {showFullChat && <div className="w-full sm:w-96 pointer-events-auto h-full overflow-hidden animate-chat-slide" style={{ boxShadow: "-4px 0 24px rgba(11,16,83,.10)" }}><FullChat onclose={() => setShowFullChat(false)} data={selectedChat} type="group" /></div>}
      {showParentChat && <div className="w-full sm:w-96 pointer-events-auto h-full overflow-hidden animate-chat-slide" style={{ boxShadow: "-4px 0 24px rgba(11,16,83,.10)" }}><FullChat onclose={() => setShowParentChat(false)} data={selectedChat} type="direct" /></div>}
    </div>
  );
};

export default RecentMessages;
