# Chat - real-time application

## Description:
This project is an online chat, implemented using Node.js and WebSockets. All data about users, existing chats, and messages are stored in the PostgreSQL database.

The user registers and is authorized only with the help of a name that is stored in the local storage.

The user can create chats by inventing a name and adding participants. The owner of the chat can also edit the name or members and delete the chat in the chat settings. All this happens with the help of WebSockets, so all chat participants and their owners see changes in real-time.

Chat participants can create and send messages also in real-time. Next to each message is its author and time of sending.

## Extra technologies:
1) Express.js
2) Sequelize
3) ws
4) cors
5) eslint
6) dotenv
7) nodemon

## Frontend:
### DEMO:
https://soi4an.github.io/node-chat--frontend/

### Repo:
https://github.com/Soi4An/node-chat--frontend/tree/develop
