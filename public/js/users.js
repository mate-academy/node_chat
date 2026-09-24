export async function saveUser(username) {
  try {
    const response = await fetch('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
      })
    });
    if (!response.ok) {
      return false;
    }

    await response.text();

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
