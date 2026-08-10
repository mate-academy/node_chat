const PALETTE = [
  { bg: '#1F4B43', text: '#E8B84B' },
  { bg: '#B23A2F', text: '#FBE6DF' },
  { bg: '#6B4E71', text: '#EAD9EE' },
  { bg: '#8A6D3B', text: '#F5E6C8' },
  { bg: '#3B5B6B', text: '#D9E8EE' },
];

export function getAvatarColor(username) {
  let hash = 0;

  for (let i = 0; i < username.length; i += 1) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % PALETTE.length;

  return PALETTE[index];
}

export function getInitial(username) {
  return username.trim().charAt(0).toUpperCase();
}