import React, { useEffect, useState, useRef } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useParams } from "react-router-dom";

const ChatPage = ({ user }) => {
  const { auctionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!auctionId) return;

    const q = query(
      collection(db, "auctions", auctionId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [auctionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await addDoc(collection(db, "auctions", auctionId, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || "Anonymous",
        message: input.trim(),
        timestamp: serverTimestamp(),
      });
      setInput("");
    } catch (err) {
      console.error("Error sending message: ", err);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Chat for Auction: {auctionId}</h2>
      <div style={{ border: "1px solid #ddd", height: 400, overflowY: "auto", padding: 10 }}>
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.senderId === user.uid ? "right" : "left",
              margin: "8px 0"
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 15,
                backgroundColor: msg.senderId === user.uid ? "#6C63FF" : "#eee",
                color: msg.senderId === user.uid ? "#fff" : "#000",
                maxWidth: "70%",
                wordBreak: "break-word"
              }}
            >
              <small><b>{msg.senderName}</b></small>
              <p>{msg.message}</p>
              <small style={{ opacity: 0.6, fontSize: 10 }}>
                {msg.timestamp?.toDate?.().toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", marginTop: 10 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 8, borderRadius: 20, border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          style={{
            marginLeft: 10,
            padding: "8px 16px",
            borderRadius: 20,
            backgroundColor: "#6C63FF",
            color: "#fff",
            border: "none",
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;