# Chat App

This is the backend server for the React-based chat application. It is built using Express and Node.js, providing the necessary APIs and WebSocket functionality to support real-time communication between users.

## Features

- **RESTful APIs**: Provides RESTful endpoints for room and direct chats management as well as other chat-related functionalities.
- **WebSocket Integration**: Implements WebSocket functionality using the `ws` library to enable real-time communication between users.
- **Message Handling**: Manages the sending, receiving, and storage of chat messages, enabling seamless communication between users.
- **Error Handling**: Implements error handling middleware to gracefully handle errors and provide appropriate responses to clients.

## Stack

- **Express.js**
- **Node.js**
- **Sequelize**: ORM used for interacting with PostgreSQL database, simplifying database operations and management.
- **CORS**: used to handle CORS to allow requests from specified origins.
- **WebSocket (ws)**: integrates WebSocket functionality for real-time communication between clients and the server.
- **Yup**: used for request validation to ensure the integrity and security of incoming data.

## Getting Started

To run this application locally, follow these steps:

1. Clone this repository.
2. Install dependencies using `npm install`.
3. Add the .env file according to the provided .env.sample file with personal credentials and client host.
4. Run the setup.js file in order to synchronize the database.
5. Run the index.js file in order to start the server.
6. Once the server is running, you can test the endpoints using tools like Postman or by integrating with a [frontend application](https://github.com/akozlovska/react_chat-app).
