# Chat (with Node.js)
Implement a chat application (both client and server)

- You type a username and send it to the server
- It is now username (save it in localStorage)
- All the messages should have an author, time, and text
- Implement the ability to create rooms (create / rename / join / delete)
- New user should see all previous messages in the room

## Endpoint Routing Scheme
```
GET    /rooms              # Get all rooms
POST   /rooms              # Create a new room
PATCH  /rooms/:roomId      # Rename a room
DELETE /rooms/:roomId      # Delete a room

GET    /messages/:roomId   # Get all messages in a room
POST   /messages/:roomId    # Send a message in a room
```

## Database Schema

### Users
| Column    | Type                      |
|-----------|---------------------------|
| id        | SERIAL PRIMARY KEY        |
| username  | VARCHAR(255) UNIQUE       |
| createdAt | TIMESTAMP DEFAULT NOW()   |
| updatedAt | TIMESTAMP DEFAULT NOW()   |

### Rooms
| Column    | Type                      |
|-----------|---------------------------|
| id        | SERIAL PRIMARY KEY        |
| name      | VARCHAR(255) UNIQUE       |
| createdAt | TIMESTAMP DEFAULT NOW()   |
| updatedAt | TIMESTAMP DEFAULT NOW()   |

### Messages
| Column    | Type                              |
|-----------|-----------------------------------|
| id        | SERIAL PRIMARY KEY                |
| userId    | INTEGER REFERENCES Users(id)      |
| roomId    | INTEGER REFERENCES Rooms(id)      |
| text      | TEXT                              |
| time      | TIMESTAMP DEFAULT NOW()           |
