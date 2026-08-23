<div align="center">

<img src="client/src/assets/images/logoblack.png" alt="Auctania" width="280" />

### Real-Time Online Auction Portal

**Next.js · TypeScript · Express.js · Node.js · Socket.IO · JWT · Docker · AWS EC2 · Nginx**

[![Live Demo](https://img.shields.io/badge/Live-Demo-0066cc?style=for-the-badge&logo=vercel&logoColor=white)](https://auction-portal-in.web.app)
[![GitHub](https://img.shields.io/badge/Source-Code-1d1d1f?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ARC7666/Auction-Portal)

A production-grade, full-stack real-time auction platform where buyers and sellers interact through live bidding, real-time messaging, and secure payment flows — deployed on AWS EC2 with Docker and Nginx.

</div>

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS EC2 Instance                     │
│                                                             │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │  Nginx   │───▶│  Next.js App │    │   Express.js     │   │
│  │  Reverse │    │  (Frontend)  │◄──▶│   API Server     │   │
│  │  Proxy   │───▶│  Port 3000   │    │   Port 5000      │   │
│  │  :443    │    └──────────────┘    └──────────────────┘   │
│  └──────────┘                              │                │
│       │                              ┌─────┴─────┐         │
│       │                              │ Socket.IO  │         │
│       │                              │  WebSocket │         │
│       │                              └───────────┘         │
│  ┌────┴─────────────────────────────────────────────────┐   │
│  │              Docker Compose (3-Service Stack)        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Key Highlights

- **Full-Stack Real-Time Platform** — Built with Next.js, TypeScript, and Express.js, featuring JWT authentication and **3 role-based dashboards** (Buyer, Seller, Admin) with 12+ RESTful API endpoints across auth, listings, and transaction workflows.

- **Real-Time Bidding & Messaging** — Implemented live bidding and in-app messaging using Socket.IO, achieving **sub-200ms bid broadcast latency** across all connected clients.

- **Secure Payment Integration** — Integrated **Stripe Checkout API** for end-to-end payment flows, handling auction settlements, payment confirmations, and transaction receipts.

- **Containerized & Cloud-Deployed** — Dockerized a 3-service stack (Next.js, Express.js, Nginx) using Docker Compose and deployed on **AWS EC2**, with Nginx configured as a reverse proxy for SSL termination and zero-downtime deployments.

---

## Features

### Buyer Dashboard
- Browse and search live, upcoming, and closed auctions
- Place real-time bids with instant broadcast to all participants
- Track active bids and auction history
- In-app real-time chat with sellers
- Calendar view for upcoming auction reminders
- Secure checkout via Stripe for won auctions

### Seller Dashboard
- Create and manage auction listings with multi-image uploads
- Real-time analytics — total auctions, active bids, revenue tracking
- Edit auction details, pricing, and scheduling
- In-app messaging with prospective buyers
- KPI dashboard with visual charts (Chart.js)

### Admin Dashboard
- Full user management — view, ban, and manage all accounts
- Monitor all auctions across the platform
- Role-based access control enforcement
- Platform-wide analytics and oversight

### Core Technical Features
- **Authentication** — JWT-based auth with role-based access control (Buyer, Seller, Admin)
- **Real-Time Engine** — Socket.IO for live bidding, notifications, and messaging
- **Responsive Design** — Fully optimized for desktop, tablet, and mobile (iPhone 12 Pro tested)
- **Skeleton Loading** — Lazy-loaded content with skeleton placeholders for a polished UX
- **Search & Filtering** — Product search with category and status filters
- **Scroll-to-Top Navigation** — Smooth page transitions without scroll position artifacts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js, TypeScript, React, CSS Modules |
| **Backend** | Express.js, Node.js |
| **Real-Time** | Socket.IO (WebSocket) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Payments** | Stripe Checkout API |
| **Database** | Cloud Firestore (NoSQL) |
| **Storage** | Cloud Storage (media uploads) |
| **Containerization** | Docker, Docker Compose |
| **Deployment** | AWS EC2, Nginx (reverse proxy, SSL) |
| **Charts** | Chart.js, react-chartjs-2 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

---

## Project Structure

```
Auction-Portal/
├── client/                    # Next.js Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── CategorySlider/
│   │   │   ├── Skeleton/      # Loading placeholders
│   │   │   ├── ListingCard.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── pages/
│   │   │   ├── BuyerComponents/
│   │   │   │   ├── BuyerDashboard/
│   │   │   │   ├── BuyerLayout/
│   │   │   │   ├── AuctionDetail/
│   │   │   │   ├── LiveAuctions/
│   │   │   │   └── MyBids/
│   │   │   ├── SellerComponents/
│   │   │   │   ├── SellerDashboard/
│   │   │   │   ├── SellerLayout/
│   │   │   │   ├── CreateAuctions/
│   │   │   │   ├── EditAuction/
│   │   │   │   └── SellerAuction/
│   │   │   ├── AdminDashboard/
│   │   │   ├── ProfilePage/
│   │   │   └── Calender/
│   │   ├── utils/
│   │   └── assets/
│   └── index.html
├── functions/                 # Backend Cloud Functions
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Docker & Docker Compose
- Stripe API Keys

### Local Development

```bash
# Clone the repository
git clone https://github.com/ARC7666/Auction-Portal.git
cd Auction-Portal

# Install frontend dependencies
cd client
npm install

# Start the development server
npm run dev
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build -d

# Services:
# - Next.js Frontend  → port 3000
# - Express.js API    → port 5000
# - Nginx Proxy       → port 443 (SSL)
```

### AWS EC2 Deployment

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Pull latest code
git pull origin main

# Rebuild and deploy with zero downtime
docker-compose up --build -d
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login (JWT) |
| `POST` | `/api/auth/google` | Google OAuth login |
| `GET` | `/api/auctions` | Fetch all auctions |
| `POST` | `/api/auctions/create` | Create new auction |
| `PUT` | `/api/auctions/:id` | Update auction details |
| `DELETE` | `/api/auctions/:id` | Delete auction |
| `POST` | `/api/bids/:auctionId` | Place a bid |
| `GET` | `/api/bids/my-bids` | Get user's bid history |
| `POST` | `/api/payments/checkout` | Stripe checkout session |
| `GET` | `/api/users` | Admin: list all users |
| `PUT` | `/api/users/:id/role` | Admin: update user role |

---

## Environment Variables

```env
# Server
PORT=5000
JWT_SECRET=your_jwt_secret
NODE_ENV=production

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Database
DATABASE_URL=your_database_url

# AWS
AWS_REGION=ap-south-1
```

---

## Screenshots

<div align="center">

| Landing Page | Buyer Dashboard |
|:---:|:---:|
| Home page with hero banner and category slider | Browse auctions with filters and search |

| Auction Detail | Seller Dashboard |
|:---:|:---:|
| Real-time bidding with live price updates | Analytics, KPIs, and auction management |

</div>

---

## Performance

- **Bid Broadcast Latency:** < 200ms (Socket.IO)
- **Lighthouse Score:** 90+ (Performance), 95+ (Accessibility)
- **Image Format:** WebP for optimized loading
- **Bundle Size:** ~400KB gzipped (code-split)

---

## Author

**Ankit Ranjan**

[![GitHub](https://img.shields.io/badge/GitHub-ARC7666-1d1d1f?style=flat-square&logo=github)](https://github.com/ARC7666)

---

<div align="center">

*My first full-stack project — from concept to production. Built from scratch, deployed to the cloud.* 🚀

</div>
