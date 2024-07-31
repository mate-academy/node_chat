const { roomService } = require('../services/room.service.js');

class RoomController {
  getRooms = async (req, res) => {
    const rooms = await roomService.getAllRooms();

    res.send(rooms);
  };
  getRoomById = async (req, res) => {
    const { id } = req.params;

    const room = await roomService.getRoomById(id);

    res.send(room);
  };
  create = async (req, res) => {
    const { userId, name } = req.body;

    const newRoom = await roomService.createRoom({ userId, name });

    res.send(newRoom);
  };
  deleteRoom = async (req, res) => {
    const { id } = req.body;

    await roomService.deleteRoom(id);

    res.sendStatus(204);
  };
  edit = async (req, res) => {
    const { id, newName } = req.body;

    const room = await roomService.updateRoom({ id, name: newName });

    res.send(room);
  };
}

const roomController = new RoomController();

module.exports = { roomController };
