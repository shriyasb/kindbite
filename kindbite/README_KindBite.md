# 🍱 KindBite

> A real-time platform connecting food donors with nearby NGOs and volunteers to reduce food waste and fight hunger.

![KindBite Banner](https://placehold.co/900x300/16a34a/ffffff?text=KindBite+%F0%9F%8D%B1)

---

## 🚀 Live Demo

<!-- Add your deployed link here -->
🔗 [kindbite.vercel.app](#) *(coming soon)*

---

## 📸 Screenshots

> **Replace the placeholders below with actual screenshots from your app.**

| Home / Map View | Donor Dashboard | Volunteer Alerts |
|----------------|-----------------|-----------------|
| ![Map](https://placehold.co/400x250/f0fdf4/16a34a?text=Map+View) | ![Donor](https://placehold.co/400x250/f0fdf4/16a34a?text=Donor+Dashboard) | ![Alerts](https://placehold.co/400x250/f0fdf4/16a34a?text=Volunteer+Alerts) |

*To add real screenshots: take a screenshot of each page → upload to your repo under `/screenshots/` → update the image paths above.*

---

## 💡 The Problem

Large quantities of edible food are wasted every day by restaurants, events, hostels, and households — simply because there is no quick and reliable way to redistribute it. At the same time, many people struggle with hunger because NGOs and volunteers don't know where or when surplus food is available nearby.

**KindBite bridges that gap.**

---

## ✨ Features

- 📍 **Location-Based Matching** — Connects donors with the nearest NGOs and volunteers in real time
- 🔔 **Instant Alerts** — Volunteers are notified immediately when food is posted nearby
- 📦 **Easy Donation Posting** — Donors post available food with pickup details in seconds
- ⭐ **Trust & Ratings** — Builds accountability through a mutual ratings system
- 📊 **Impact Dashboard** — Visualises how many meals are saved daily
- 🗺️ **Interactive Map** — See all active food donation points on a live map

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Real-time** | Socket.io |
| **Maps** | Google Maps API / Leaflet |
| **Styling** | CSS / Tailwind CSS |
| **Version Control** | Git, GitHub |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/shriyasb/kindbite.git
cd kindbite

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in MongoDB URI, Google Maps API key, etc.

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
kindbite/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
├── server/          # Express backend
│   ├── routes/
│   ├── models/
│   └── index.js
└── README.md
```

---

## 🌍 Impact

> Every meal saved is a step toward zero hunger.

KindBite tracks collective impact across all users — meals saved, donations made, and volunteers active — to show the real-world difference the platform is making.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 👩‍💻 Author

**Shriya S Bharadwaj**
- GitHub: [@shriyasb](https://github.com/shriyasb)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
