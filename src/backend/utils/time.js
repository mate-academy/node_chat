'use strict';

/**
 * Formats a date object into a time string (HH:MM format)
 * @param {Date} date - The date to format
 * @returns {string} The formatted time string
 */
function formatMessageTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

function formatMessageDate(date) {
  return new Date(date).toISOString();
}

module.exports = {
  formatMessageDate,
  formatMessageTime,
};
