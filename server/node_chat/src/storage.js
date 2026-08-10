'use strict';

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

const DATA_FILE = path.join(__dirname, '..', 'data.json');

const events = new EventEmitter();

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { rooms: [] };
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');

    return JSON.parse(raw);
  } catch (err) {
    events.emit('error', new Error(`Failed to read data.json: ${err.message}`));

    return { rooms: [] };
  }
}

let saveTimeout = null;

function saveData(rooms) {
  clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    const data = { rooms: [...rooms.values()] };

    fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        events.emit(
          'error',
          new Error(`Failed to save data.json: ${err.message}`),
        );
      }
    });
  }, 300);
}

module.exports = { loadData, saveData, events };
