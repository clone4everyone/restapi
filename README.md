# 🛠️ REST Client Application (Node Assignment)

## 📌 Overview

This is a lightweight REST client web application inspired by Postman, built using a **React/Next.js frontend** and a **Node.js (Express)** backend. It supports HTTP methods like **GET**, **POST**, **PUT**, and **DELETE**, and displays the corresponding response in real-time — **without reloading the page**.

The backend uses **MikroORM** and **SQLite** to persist request histories. The application supports handling large datasets using **pagination**, **lazy loading**, and **caching** techniques.

---

## 🚀 Features

- Make custom API requests (GET, POST, PUT, DELETE).
- View and format live response data (JSON, status, headers, etc).
- Save and display historical request data using **MikroORM**.
- Efficient performance with support for:
  - Pagination
  - Lazy Loading
  - Caching

---

## 🧱 Tech Stack

### Backend
- **Node.js**
- **Express.js**
- **MikroORM** (SQLite)
- **Helmet**, **CORS**, **Compression**

### Frontend
- **React.js** or **Next.js**
- **Tailwind CSS** (optional)
- **Axios** for sending HTTP requests
