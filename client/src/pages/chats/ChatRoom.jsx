import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/firebaseConfig';
import { Send } from "lucide-react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import './ChatBox.css';

const ChatRoom = () => {
  const { auctionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sellerId, setSellerId] = useState(null);
  const messageRefs = useRef({});
  const messagesEndRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const [productTitle, setProductTitle] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, msg: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeller = async () => {
      const auctionRef = doc(db, 'auctions', auctionId);
      const auctionSnap = await getDoc(auctionRef);
      if (auctionSnap.exists()) {
        const data = auctionSnap.data();
        setSellerId(auctionSnap.data().sellerId);
        setProductTitle(data.title);
      }
    };
    fetchSeller();
  }, [auctionId]);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', auctionId, 'messages'),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => { // real-time listener for chats/auctionId/messages collection
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [auctionId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !newMsg.trim()) return;

    await addDoc(collection(db, 'chats', auctionId, 'messages'), {
      userId: user.uid,
      username: user.displayName || 'Anonymous',
      text: newMsg,
      timestamp: serverTimestamp(),
      replyTo: replyTo ? {
        username: replyTo.username,
        text: replyTo.text,
        msgId: replyTo.id
      } : null
    });

    setNewMsg('');
    setReplyTo(null);
  };

  useEffect(() => {
    const container = document.querySelector('.messages');
    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages]); <div id="bottom-anchor" />

  const deleteMessage = async (msg) => {
    if (!msg?.id) return;
    const msgRef = doc(db, 'chats', auctionId, 'messages', msg.id);
    await deleteDoc(msgRef);
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      msg,
    });
  };

  const handleReply = () => {
    setReplyTo(contextMenu.msg);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleDelete = () => {
    deleteMessage(contextMenu.msg);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleClickOutside = () => {
    if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  return (
    <div className="chat-room-wrapper">
      <div className="chat-room">
        <h2 className="chat-heading">
          AuctaChat for {productTitle ? productTitle : '...'}
        </h2>
        <div className="messages">
          {messages.map((msg) => (
            <div
              ref={(el) => (messageRefs.current[msg.id] = el)}
              key={msg.id}
              className={`msg ${msg.userId === auth.currentUser.uid ? 'own' : 'other'}`}
              onContextMenu={(e) => handleContextMenu(e, msg)}
              onDoubleClick={(e) => handleContextMenu(e, msg)}
            >
              <div className="msg-top">
                <strong>
                  {msg.username}
                  {msg.userId === sellerId && ' (Seller)'}
                </strong>
              </div>

              {msg.replyTo && (
                <div
                  className="reply-preview"
                  onClick={() => {
                    const target = messageRefs.current[msg.replyTo?.msgId];
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      target.classList.add('highlighted');
                      setTimeout(() => target.classList.remove('highlighted'), 1500);
                    }
                  }}
                >
                  <strong>{msg.replyTo.username}:</strong> {msg.replyTo.text}
                </div>
              )}
              <p>{msg.text}</p>
            </div>
          ))}
          <div id="bottom-anchor" />
        </div>

        {replyTo && (
          <div className="reply-preview-box">
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#443d8a' ,  marginLeft: 20 }}>{replyTo.username}:</div>
            <div style={{ fontSize: '0.9rem',marginLeft: 20 }}>{replyTo.text}</div>
            <button onClick={() => setReplyTo(null)} style={{ fontSize: '0.7rem', background: 'transparent', border: 'none', color: '#988',marginLeft: 20 }}>Cancel</button>
          </div>
        )}

        <form onSubmit={sendMessage} className="chat-input">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">
            <Send size={18} />
          </button>
        </form>

        <p className="go-back-chat">
          Want to return?{' '}
          <span className="link" onClick={() => navigate(-1)}>Go Back</span>
        </p>

        {contextMenu.visible && (
          <div
            className="context-menu"
            style={{
              position: 'absolute',
              top: contextMenu.y,
              left: contextMenu.x,
              background: '#fff',
              border: '1px solid #ccc',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              zIndex: 999,
              padding: '5px 0',
              borderRadius: '4px',
              width: '120px'
            }}
          >
            <div className="context-option" onClick={handleReply} style={{ padding: '6px 12px', cursor: 'pointer' }}>
              Reply
            </div>
            {contextMenu.msg.userId === auth.currentUser.uid && (
              <div className="context-option" onClick={handleDelete} style={{ padding: '6px 12px', cursor: 'pointer', color: 'red' }}>
                Delete
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;