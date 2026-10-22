'use strict';

const fs = require('fs');
const path = require('path');

class ChatRepository {
  constructor(dataFile) {
    this.dataFile = dataFile;
  }

  load() {
    if (!fs.existsSync(this.dataFile)) {
      return { rooms: [], messages: {} };
    }

    const state = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));

    if (
      !state ||
      !Array.isArray(state.rooms) ||
      !state.messages ||
      typeof state.messages !== 'object' ||
      Array.isArray(state.messages)
    ) {
      throw new Error(`Invalid chat data in ${this.dataFile}`);
    }

    return state;
  }

  save(state) {
    fs.mkdirSync(path.dirname(this.dataFile), { recursive: true });

    const temporaryFile = `${this.dataFile}.${process.pid}.tmp`;

    fs.writeFileSync(temporaryFile, JSON.stringify(state, null, 2));
    fs.renameSync(temporaryFile, this.dataFile);
  }
}

module.exports = { ChatRepository };
