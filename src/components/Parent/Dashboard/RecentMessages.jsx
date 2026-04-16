import React, { useEffect, useRef, useState } from "react";

import moment from "moment/moment";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";
import profile from "../../../assets/profile.png";

import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { RiAttachment2 } from "react-icons/ri";
import { BsFillSendFill } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../../context/UserContext";
import { BACKEND_URL_SOCKET } from "../../../constants/api";
import { getChatsRoomData, getMyChats } from "../../../api/UserApis";
import { getAllTeachers } from "../../../api/Admin/AdminApi";
import { getParentChatrooms, getTeachersForChat } from "../../../api/Parent/ParentApi";

import useClickOutside from "../../../hooks/useClickOutlise";


const RecentMessages = ({ onclose, dashboard }) => {

  const [loading, setLoading] = useState(false);
  const [queryData, setQueryData] = useState(null);
  const [groupActive, setGroupActive] = useState(false);
  const [showFullChat, setShowFullChat] = useState(false);
  const [enableChatQuery, setEnableChatQuery] = useState(true);
  const [individualActive, setIndividualActive] = useState(true);
  const [selectedChatParticipants, setSelectedChatParticipants] = useState([]);

  const [msgArray, setMsgArray] = useState([]);
  const [localSocket, setLocalSocket] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const { userData } = useUser();

  const containerRef = useRef(null);
  const msgEndRef = useRef(null);

  useClickOutside(containerRef, () => {
    onclose()
  });

  const handleSendMessage = (msgstr) => {
    const messageObj = {
      sentBy: userData.id,
      time: new Date(),
      type: "text",
      message: msgstr,
    };

    // Optimistic update
    setMsgArray((prev) => [...prev, { ...messageObj, sentBy: userData }]);
    
    localSocket.emit("message", { members: [userData.id, selectedChat.id], message: messageObj });
  }


  // close full chat modal
  const handleShowFullChat = () => {
    console.log("clicking full chat");
    setShowFullChat(!showFullChat);
  }

  const openFullchat = async (data) => {
    setLoading(true);
    setShowFullChat(true);
    const conn = io(`${BACKEND_URL_SOCKET}/one-to-one`);
    setLocalSocket(conn);
    setSelectedChat(data);
    //console.log("parent data is : ", data);
    conn.emit("join", [userData.id, data.id])
    console.log("join room emit")
    conn.emit("get-chats", [userData.id, data.id]);
    conn.on("chat-history", (chats) => {
      //console.log("parent full chat values is ", chats);
      setSelectedChatParticipants(chats?.participants);
      setMsgArray(chats?.messages);
    })

    setLoading(false);
  }

  const getParticipantData = (pid) => {
    //console.log("id sent is : ", pid);
    let user = {};
    selectedChatParticipants?.forEach((item) => {
      if (item.id === pid) {
        user = item;
        console.log("selected");
      }
    })
    return user;
  }

  useEffect(() => {
    if (localSocket) {
      localSocket?.on("message", (data) => {
        // If the message is from us, we already added it optimistically
        if (data.message.sentBy === userData.id) return;
        
        let user = getParticipantData(data?.message?.sentBy);
        setMsgArray((prev) => [...prev, { ...data?.message, sentBy: user }]);
      });
    }
  }, [localSocket, userData.id])




  const Message = ({ data, onpress }) => {
    return (
      <div className="flex flex-col gap-2 py-3 px-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors" onClick={onpress}>
        <div className="flex gap-3">
          <div className="relative">
            <img src={data?.profilePic || IMAGES.Profile} alt="" className="h-11 w-11 rounded-full object-cover border border-gray-100" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${data?.otherParticipantType === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <p className="text-sm font-bold text-gray-800 truncate">{data?.name}</p>
              <p className="text-[10px] text-gray-400 font-medium">
                {data?.lastMsg?.time ? moment(data.lastMsg.time).format("hh:mm a") : ""}
              </p>
            </div>
            <div className="flex justify-between items-center gap-2">
              <p className="text-xs text-gray-500 truncate flex-1">
                {data?.lastMsg?.message || "No messages yet"}
              </p>
              {data?.otherParticipantType === 'admin' && (
                <span className="text-[8px] font-extrabold uppercase bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 tracking-tighter">Admin</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const GroupMsg = ({ msg }) => {
    return <>
      <div className="px-10 py-5">
        {msg?.sentBy?.id !== userData?.id ?
          <div className="flex items-start gap-4 py-2">
            <div>
              <img src={msg?.sentBy?.profilePic || IMAGES.ProfilePic} alt="alt" className="w-10 h-10 rounded-full object-cover" />
            </div>
            <div className="flex flex-col gap-1 w-72">
              <div className="flex justify-between items-center text-sm">
                <p className="font-medium ">{msg?.sentBy?.name} </p>
                <p className="">{moment(msg?.time).format("dddd hh:mm a")} </p>
              </div>
              <div className="text-sm text-[#101828] flex font-medium  bg-[#F2F4F7] flex-wrap px-2 py-3 rounded-tr-lg rounded-br-lg rounded-bl-lg">
                <p>{msg?.message}</p>
              </div>
            </div>
          </div>
          :
          <div className="py-2">
            <div className="flex items-start gap-4 justify-end">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm">
                  <p className="font-medium ">You</p>
                  <p className="">{moment(msg?.time).format("dddd hh:mm a")} </p>
                </div>
                <div className="text-sm text-white flex font-medium w-60 bg-[#0B1053] flex-wrap px-2 py-3 rounded-br-lg rounded-bl-lg rounded-tl-lg">
                  <p>{msg?.message} </p>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </>
  }

  const FullChat = ({ onclose, data }) => {
    const [msgstr, setmsgStr] = useState("");

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSendMessage(msgstr);
        setmsgStr("");
      }
    }

    return <>
      <div className="w-96 flex flex-col justify-between pb-5 bg-white shadow-xl z-50 pointer-events-auto">

        <div className="h-full">
          <div className="shadow-xl">
            <div className="flex justify-between px-10 py-5 items-center">
              <div className="flex gap-2 items-center">
                <img src={IMAGES.ProfilePic} alt="" className="h-10 w-10 rounded-full object-cover" />
                <p>{data.name} </p>
              </div>
              <IoClose onClick={onclose} className="cursor-pointer" />
            </div>
          </div>

          {loading ? <div><Loader /></div> :
            <div className="h-[70vh] overflow-y-auto register-scrollbar">
              {msgArray?.map((item, index) => {
                return <GroupMsg key={index} msg={item} />
              })}
            </div>
          }


        </div>
        <div ref={msgEndRef} />
        <div className="px-10">
          <div className="flex items-center gap-2">
            <input type="text" value={msgstr} onChange={(e) => { setmsgStr(e.target.value) }} onKeyDown={handleKeyDown} placeholder="Message" className="flex-1 border-black/20 border rounded-lg py-2 px-2 outline-none w-full" />
            <RiAttachment2 className=" text-[#0B1053] cursor-pointer shrink-0" size={24} />
            <BsFillSendFill className="bg-[#0B1053] text-white p-2 rounded-md cursor-pointer shrink-0" size={34} onClick={() => { msgstr == "" ? toast.error("Cannot send an empty message") : handleSendMessage(msgstr); setmsgStr(""); }} />
          </div>
        </div>

      </div>
    </>
  }

  const chatquery = useQuery({ queryKey: ["parent-chatrooms"], queryFn: getParentChatrooms, staleTime: 30000, enabled: enableChatQuery });


  useEffect(() => {
    console.log("now rendering navbar")
    if (!queryData) {
      setEnableChatQuery(true);
    }
    if (!chatquery.isPending) {
      setQueryData(chatquery?.data);
      //console.log("teacher query data is : ", chatquery.data);
      setEnableChatQuery(false);
    }
  }, [chatquery.isPending])

  const toggleIndividualActive = () => {
    setIndividualActive(!individualActive);
    setGroupActive(false);
  };

  return (
    <div ref={containerRef} className="fixed top-0 right-0 z-50 flex flex-row-reverse items-start pointer-events-none h-screen">
      <div
        className={` ${!dashboard ? "mt-10" : "mt-0"
          } flex flex-col px-5 overflow-auto bg-white border-l border-black/20 shadow-xl w-96 pointer-events-auto h-full`}
      >
        <div className={`flex flex-col flex-1 font-poppins`}>
          <div className="flex justify-between py-5 ">
            <p className="text-lg font-semibold">Recent Messages</p>
            <IoClose onClick={onclose} className="cursor-pointer" />
          </div>
          <div className="pb-2 border-b rounded-sm border-black/10">
            <div className="flex justify-between gap-2 p-1 rounded-md bg-[#EAECF0] border-2 border-[#00000010]">
              <div
                onClick={toggleIndividualActive}
                className={`cursor-pointer flex items-center justify-center flex-1 gap-2 ${individualActive ? "bg-white" : "transparent"
                  } rounded-md`}
              >
                <p className="">Recent</p>
              </div>
            </div>
          </div>
          <div className="py-2">
            {individualActive && queryData &&
              queryData?.map((item) => {
                return <Message data={item} onpress={() => { openFullchat(item) }} />
              })}
          </div>
        </div>
      </div>
      {showFullChat && <FullChat onclose={() => setShowFullChat(false)} data={selectedChat} />}
    </div>
  );
};

export default RecentMessages;
