const transformRoomsArrayToSelectOptions = (rooms) => {
  return rooms?.map((room) => ({
    value: room.id,
    label: room.name,
  }));
};

export const selectDataService = {
  transformRoomsArrayToSelectOptions,
};
