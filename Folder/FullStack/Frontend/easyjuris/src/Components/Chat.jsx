import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { 
  Send, Plus, Users, UserPlus, Trophy, 
  MessageSquare, Hash, Zap, Shield, Crown, 
  Terminal, Activity, Radio, Cpu, Layers
} from "lucide-react";
import LeaderBoard from "./LeaderBoard";

const socket = io("https://jee-saathi-ai-repo-2.onrender.com/", {
  transports: ["polling", "websocket"],
});

function Chat({ userId }) {
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState("personal");
  const [newUserId, setNewUserId] = useState(userId);
  const [friendId, setFriendId] = useState("");
  const [inviteRoomName, setInviteRoomName] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.emit("registerUser", userId);
    socket.on("userRooms", (rooms) => setRooms(rooms));
    socket.on("roomMessages", ({ room, messages }) => {
      if (room === currentRoom) {
        setMessages(messages.map((m) => `${m.sender}: ${m.text}`));
      }
    });
    return () => {
      socket.off("userRooms");
      socket.off("roomMessages");
    };
  }, [userId, currentRoom]);

  const joinRoom = (roomName, type = "group") => {
    setCurrentRoom(roomName);
    setMessages([]);
    socket.emit("joinRoom", { userId, roomName, type });
  };

  const sendMessage = () => {
    if (!input.trim() || !currentRoom) return;
    socket.emit("chatMessage", { room: currentRoom, msg: input });
    setInput("");
  };

  const inviteFriend = async () => {
    if (!friendId || !inviteRoomName) return;
    try {
      const res = await fetch(`http://localhost:5000/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: inviteRoomName, friendId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Invited ${friendId} to ${inviteRoomName}`);
        setFriendId("");
      } else { alert(data.error); }
    } catch (err) { console.error("Error inviting friend:", err); }
  };

  const createRoom = async () => {
    if (!newRoomName || !newRoomType || !newUserId) return;
    try {
      const res = await fetch("http://localhost:5000/CreateRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoomName, type: newRoomType, userId: newUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setRooms((prev) => [...prev, data.room]);
        setCurrentRoom(newRoomName);
        setNewRoomName("");
        setNewRoomType("personal");
      }
    } catch (error) { console.error("Error creating room:", error); }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans p-2 lg:p-6 flex flex-col ">
      
      {/* --- CYBER GLOW ELEMENTS --- */}
      <div className="absolute top-[-5%] left-[10%] w-[45%] h-[45%] bg-cyan-600/10 blur-[140px] rounded-full pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-5%] right-[5%] w-[40%] h-[40%] bg-blue-700/10 blur-[130px] rounded-full pointer-events-none"></div>

      {/* --- GLASS NAVIGATION --- */}
      <nav className="flex items-center justify-between mb-6 px-6 py-4 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-[2rem] relative z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-white/10 shadow-inner">
            <Layers className="text-cyan-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-[0.4em] uppercase italic leading-none">JEE Saathi AI</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">System Link: {userId}</p>
            </div>
          </div>
        </div>

        {/* <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
            showLeaderboard 
            ? "bg-yellow-500 text-slate-950 shadow-[0_0_30px_rgba(234,179,8,0.25)] scale-105" 
            : "bg-white/[0.05] text-slate-400 border border-white/10 hover:bg-white/[0.08] hover:text-white"
          }`}
        >
          <Trophy size={14} />
          {showLeaderboard ? "Deactivate Intel" : "Global Leaderboard"}
        </button> */}
      </nav>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 relative z-10 overflow-hidden h-[82vh]">
        
        {/* --- SIDEBAR PANEL (GLASS) --- */}
        <div className="lg:w-85 flex flex-col gap-5 overflow-y-auto pr-1 custom-scrollbar">
          
          {showLeaderboard && (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-2 backdrop-blur-2xl animate-in zoom-in-95 duration-500 shadow-2xl">
               <LeaderBoard />
            </div>
          )}

          {/* GLASS CARD: INITIALIZE */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2.5rem] p-7 backdrop-blur-xl hover:bg-white/[0.05] transition-all duration-500 shadow-xl group">
            <div className="flex items-center gap-3 mb-5">
               <Terminal size={14} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Room</h3>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Operation Name..."
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-xs text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700"
              />
              <select 
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-xs text-slate-400 outline-none cursor-pointer"
              >
                <option value="personal">Personal Sync</option>
                <option value="group">Strategic Squad</option>
                <option value="global">Global Archive</option>
              </select>
              <button
                onClick={createRoom}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-lg hover:shadow-cyan-500/30 active:scale-95 transition-all"
              >
                Initialize
              </button>
            </div>
          </div>

          {/* GLASS CARD: INVITE */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2.5rem] p-7 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3 mb-5">
               <UserPlus size={14} className="text-emerald-400" />
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Invite Link</h3>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Recipient ID"
                value={friendId}
                onChange={(e) => setFriendId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-xs outline-none text-slate-200"
              />
              <button
                onClick={inviteFriend}
                className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] py-3 rounded-2xl hover:bg-emerald-500/20 transition-all"
              >
                Transmit
              </button>
            </div>
          </div>

          {/* ROOM LIST (TRANSLUCENT) */}
          <div className="flex-1 bg-white/[0.01] border border-white/[0.05] rounded-[2.5rem] p-5 flex flex-col min-h-[300px]">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-5 px-3">Sync Channels</h3>
            <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar pr-2">
              {rooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => joinRoom(room.name, room.type)}
                  className={`w-full group flex items-center justify-between p-5 rounded-3xl transition-all duration-500 border ${
                    currentRoom === room.name
                      ? "bg-white/[0.07] border-cyan-500/40 text-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]"
                      : "bg-transparent border-transparent text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${currentRoom === room.name ? "bg-cyan-400 shadow-[0_0_10px_cyan]" : "bg-slate-800"}`}></div>
                    <span className="text-xs font-bold tracking-tight uppercase">{room.name}</span>
                  </div>
                  <Hash size={12} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              {!currentRoom && (
                <button
                  onClick={() => joinRoom("common for all")}
                  className="w-full p-5 mt-4 rounded-3xl border border-dashed border-white/10 text-slate-700 text-[10px] font-black uppercase tracking-[0.3em] hover:border-cyan-500/40 hover:text-cyan-500 hover:bg-cyan-500/5 transition-all"
                >
                  🚀 Connect Global
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- CHAT MAIN STAGE (DEEP GLASS) --- */}
        <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/[0.08] rounded-[3.5rem] backdrop-blur-2xl relative overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          
          {currentRoom ? (
            <>
              {/* CHAT HEADER */}
              <div className="p-7 border-b border-white/[0.08] bg-white/[0.02] flex justify-between items-center">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                        <Radio size={22} className="animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">{currentRoom}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Shield size={10} className="text-emerald-500" />
                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Protocol: Secure-Link</p>
                        </div>
                    </div>
                </div>
                <Activity size={20} className="text-slate-800" />
              </div>

              {/* MESSAGES LOG (CUSTOM GLASS BUBBLES) */}
              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                {messages.map((msg, i) => {
                  const [sender, ...textParts] = msg.split(':');
                  const isMe = sender.trim() === userId;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
                       <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col group`}>
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 px-3 ${isMe ? 'text-cyan-500' : 'text-slate-500'}`}>
                             {isMe ? <Crown size={10} className="inline mr-1" /> : null} {sender}
                          </span>
                          <div className={`p-5 rounded-[2rem] text-[13px] leading-relaxed transition-all duration-500 shadow-xl ${
                            isMe 
                            ? "bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none border border-white/10" 
                            : "bg-white/[0.04] border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-md"
                          }`}>
                            {textParts.join(':')}
                          </div>
                       </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef}></div>
              </div>

              {/* MISSION INPUT (INSET GLASS) */}
              <div className="p-8 bg-white/[0.01] border-t border-white/[0.08]">
                <div className="max-w-4xl mx-auto flex gap-4 bg-black/40 p-2.5 rounded-[2rem] border border-white/10 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Enter strategic data..."
                    className="flex-1 bg-transparent border-none outline-none px-6 py-3 text-sm text-slate-200 placeholder:text-slate-800 font-medium"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-cyan-500 text-slate-950 px-8 py-3.5 rounded-[1.5rem] hover:bg-cyan-400 active:scale-95 transition-all shadow-xl flex items-center gap-3 group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:inline">Transmit</span>
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-28 h-28 bg-white/[0.02] rounded-[3.5rem] flex items-center justify-center mb-8 border border-white/10 relative shadow-2xl">
                 <div className="absolute inset-0 rounded-[3.5rem] border border-cyan-500/20 animate-ping duration-[3000ms]"></div>
                 <Zap size={48} className="text-slate-800" />
              </div>
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.6em]">System Standby</h3>
              <p className="text-[10px] text-slate-700 max-w-xs font-bold leading-relaxed mt-6 uppercase tracking-[0.2em]">
                Select a mission node to begin neural synchronization.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}

export default Chat;
