import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import './ChatBox.css';

const ChatRoom = () => {
  const { auctionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sellerId, setSellerId] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchSeller = async () => {
      const auctionRef = doc(db, 'auctions', auctionId);
      const auctionSnap = await getDoc(auctionRef);
      if (auctionSnap.exists()) {
        setSellerId(auctionSnap.data().sellerId);
      }
    };
    fetchSeller();
  }, [auctionId]);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', auctionId, 'messages'),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
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
    });

    setNewMsg('');
  };

  return (
    <div className="chat-room-wrapper">
      <div className="chat-room">
        <h2 className="chat-heading">Chat for Auction</h2>
        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.userId === auth.currentUser.uid ? 'own' : 'other'}`}>
              <strong>
                {msg.username}
                {msg.userId === sellerId && ' (Seller)'}
              </strong>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="chat-input">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>
        <p className="go-back-chat">
          Want to return?{' '}
          <span className="link" onClick={() => navigate(-1)}>Go Back</span>
        </p>
      </div>
    </div>

  );
};

export default ChatRoom;