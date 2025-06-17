import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler'; 
import { defineSecret } from 'firebase-functions/params';  // required if using secrets
import nodemailer from 'nodemailer';

const gmailPass = defineSecret('GMAIL_PASS');

initializeApp();
const db = getFirestore();

export const sendAuctionWinEmail = onDocumentUpdated(
  {
    document: 'auctions/{auctionId}',
    secrets: [gmailPass],
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    // Trigger only when status changes to "ended"
    if (before.status !== 'ended' && after.status === 'ended') {
      const bids = after.bids || [];
      if (bids.length === 0) return;

      const sorted = bids.sort((a, b) => b.amount - a.amount);
      const winner = sorted[0];

      try {
        const userSnap = await db.collection('users').doc(winner.userId).get();
        if (!userSnap.exists) throw new Error('User not found');

        const user = userSnap.data();

        // ✅ Transporter is created *inside* the function using the secret
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'team.auctania@gmail.com',
            pass: gmailPass.value(), // ✅ Access secret value here
          },
        });

        const mailOptions = {
          from: 'Auctania <team.auctania@gmail.com>',
          to: user.email,
          subject: `🎉 You Won the Auction: ${after.title}`,
          html: `
            <h3>Congratulations, ${user.name || 'Bidder'}!</h3>
            <p>You won the auction for <strong>${after.title}</strong>.</p>
            <p>Winning Bid: <strong>₹${winner.amount}</strong></p>
            <p>Complete your payment <a href="https://auctania.com/payment/${event.params.auctionId}">here</a>.</p>
            <br />
            <p>Thanks for using Auctania!</p>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Mail sent to', user.email);
      } catch (error) {
        console.error('❌ Email sending failed:', error.message);
      }
    }


  return;
});

export const autoUpdateAuctionStatus = onSchedule("every 1 minutes", async () => {
  const now = new Date();
  const snapshot = await db.collection("auctions").get();

  const updates = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const status = data.status;

    if (now >= end && status !== "ended") {
      updates.push(doc.ref.update({ status: "ended" }));
    } else if (now >= start && now < end && status !== "live") {
      updates.push(doc.ref.update({ status: "live" }));
    } else if (now < start && status !== "scheduled") {
      updates.push(doc.ref.update({ status: "scheduled" }));
    }
  });

  await Promise.all(updates);
  console.log("✅ Auction statuses updated:", updates.length);
});

//Firebase Functions v2 + ES Modules.