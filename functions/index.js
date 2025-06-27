import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentUpdated , onDocumentCreated} from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler'; 
import { defineSecret } from 'firebase-functions/params';  
import nodemailer from 'nodemailer';
import { defineSecret } from 'firebase-functions/params';
import Stripe from 'stripe';

const gmailPass = defineSecret('GMAIL_PASS');
const myPaymentApiKey = defineSecret('MY_PAYMENT_API_KEY');

initializeApp();
const db = getFirestore();

// 🔒 Test secret use
export const yourFunction = onRequest(
  { secrets: [myPaymentApiKey] },
  async (req, res) => {
    const apiKey = myPaymentApiKey.value();
    res.send(`✅ Secret accessed: ${apiKey.slice(0, 4)}...`);
  }
);

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

export const sendUserVerifiedEmail = onDocumentUpdated(
  {
    document: 'users/{userId}',
    secrets: [gmailPass],
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    
    if (!before.isVerified && after.isVerified) {
      const user = after;

      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'team.auctania@gmail.com',
            pass: gmailPass.value(),
          },
        });

        const mailOptions = {
          from: 'Auctania <team.auctania@gmail.com>',
          to: user.email,
          subject: `✅ You're Now a Verified Seller!`,
          html: `
            <h3>Hello, ${user.name || 'Seller'}!</h3>
            <p>Congratulations! Your account has been <strong>successfully verified</strong> on Auctania.</p>
            <p>You can now post auctions and gain access to premium seller tools.</p>
            <br />
            <p>Login to your dashboard here: <a href="https://auction-portal-in.web.app/login">Auctania Seller Dashboard</a></p>
            <br />
            <p>Thank you for being part of our platform!</p>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent to', user.email);
      } catch (err) {
        console.error('❌ Failed to send verification email:', err.message);
      }
    }

    return;
  }
);

export const notifyAdminsOnVerifyRequest = onDocumentCreated(
  {
    document: "adminLogs/{logId}",
    secrets: [gmailPass],
  },
  async (event) => {
    const log = event.data?.data();
    if (!log || log.type !== "verify-request") return;

    const userSnap = await db.collection("users").doc(log.userId).get();
    if (!userSnap.exists) return;

    const seller = userSnap.data();

    const adminQuerySnap = await db.collection("users").where("role", "==", "admin").get();
    const adminEmails = adminQuerySnap.docs
      .map((doc) => doc.data().email)
      .filter(Boolean);

    if (adminEmails.length === 0) {
      console.warn("❗ No admins found to notify.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "team.auctania@gmail.com",
        pass: gmailPass.value(),
      },
    });

    const mailOptions = {
      from: "Auctania <team.auctania@gmail.com>",
      to: adminEmails.join(","),
      subject: "⚠️ New Seller Verification Request",
      html: `
        <h3>New Seller Verification Request</h3>
        <p><strong>Name:</strong> ${seller.name}</p>
        <p><strong>Email:</strong> ${seller.email}</p>
        <p><strong>UID:</strong> ${log.userId}</p>
        <p><strong>Timestamp:</strong> ${new Date(log.timestamp.toDate()).toLocaleString()}</p>
        <br />
        <p>Open <a href="https://auction-portal-in.web.app/admin/users">Admin Dashboard</a> to verify the seller.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to admins: ", adminEmails);
  }
);

//Firebase Functions v2 + ES Modules.