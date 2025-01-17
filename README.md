# 📨 Realtime Chat App with MERN Stack

Welcome to **Echo**, a fully functional chat application that seamlessly combines **modern technologies** to deliver a fast, secure, and user-friendly experience. 🚀

---

## ✨ **Features**

- **🌟 Tech Stack**: MERN (MongoDB, Express, React, Node.js) + **Socket.io** for real-time messaging.
- **🎃 Authentication & Authorization**: Powered by **JWT** for secure user sessions.
- **👾 Real-time Messaging**: Instant communication with Socket.io.
- **🚀 Online User Status**: See who's online in real time!
- **👌 Global State Management**: Simplified with **Zustand**.
- **🐞 Error Handling**: Robust error management on both server and client sides.
- **⭐ Deployment**: Deployed and accessible via **Render.com**.

---

## 🛠️ **Tech Stack**

### Frontend

- **React.js**
- **TailwindCSS** & **Daisy UI**: Beautiful, customizable UI.

### Backend

- **Node.js** & **Express.js**
- **MongoDB**: For scalable and flexible database management.
- **Socket.io**: Enables real-time, bi-directional communication.

---

## 🔐 **Authentication**

- JWT-based authentication for a secure login experience.
- Role-based authorization to ensure user access control.

---

## 💻 **Setup Instructions**

### Prerequisites

- Node.js installed (v20+ recommended).
- MongoDB connection string.

### Clone the Repository

```bash
git clone https://github.com/Dacosmicgiant/RTCA-Echo.git
cd RTCA-Echo
```

### Install Dependencies

#### Backend

```bash
cd backend
npm i
```

#### Frontend

```bash
cd frontend
npm i
```

### Configure Environment Variables

Create a `.env` file in the `backend` directory with:

```env
PORT = 5001
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

NODE_ENV = development

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```

### Run the App

#### Backend

```bash
cd backend
npm run dev
```

#### Frontend

```bash
cd frontend
npm start
```

---

## 🌟 **Deployment**

The app is deployed on **Render.com** for a live demo! Check it out [here](https://rtca-echo.onrender.com/).

---

## 🤝 **Contributing**

Contributions are welcome! Feel free to fork the repository, create a feature branch, and submit a PR.

---

## 🛡️ **License**

This project is licensed under the [MIT License](LICENSE).

---

## 📞 **Contact**

For any questions or feedback, feel free to reach out at:  
📧 **Your Email**: vedantvanpro@gmail.com

---

Happy Coding! ✨
