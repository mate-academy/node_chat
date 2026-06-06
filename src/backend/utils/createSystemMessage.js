export function createSystemMessage(text) {
  return {
    id: Date.now(),
    text,
    createdAt: new Date(),
    type: 'system',
  };
}
