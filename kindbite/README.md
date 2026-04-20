# 🍱 KindBite — Food Wastage Management System

A full-stack MERN application that connects food donors with NGOs/volunteers in real time to eliminate food waste.

---

## 📁 Project Structure

```
kindbite/
├── backend/          # Node.js + Express + MongoDB API
└── frontend/         # React + Tailwind CSS client
```

---

## ⚙️ Setup Instructions

### 1. Clone / Extract the project

```bash
cd kindbite
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev
```

**Backend runs on:** `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

**Frontend runs on:** `http://localhost:3000`

---

## 🔑 Environment Variables (`backend/.env`)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Any long random string |
| `CLOUDINARY_CLOUD_NAME` | From cloudinary.com dashboard |
| `CLOUDINARY_API_KEY` | From cloudinary.com dashboard |
| `CLOUDINARY_API_SECRET` | From cloudinary.com dashboard |
| `CLIENT_URL` | `http://localhost:3000` |

---

## 👤 User Roles

| Role | Default redirect |
|---|---|
| `donor` | `/donor` |
| `ngo` | `/ngo` |
| `admin` | `/admin` |

To create an admin, register normally then update the role in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## 🚀 Features

- ✅ JWT Auth with role-based access (Donor / NGO / Admin)
- ✅ Food post creation with image upload (Cloudinary)
- ✅ Real-time notifications via Socket.io
- ✅ Map view with Leaflet + OpenStreetMap
- ✅ Expiry countdown timer + auto-expire cron job
- ✅ Rating system (NGO rates donor, donor rates NGO)
- ✅ Admin analytics dashboard with Recharts
- ✅ NGO accepts → picks up → delivers flow
- ✅ Full donation history

---

## 📦 Tech Stack

- **Frontend:** React 18, Tailwind CSS, React Router v6, Recharts, Leaflet, Socket.io-client, Axios
- **Backend:** Node.js, Express, Mongoose, Socket.io, JWT, Cloudinary, node-cron
- **Database:** MongoDB (local or Atlas)
