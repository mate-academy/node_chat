const debounce = (callback, delay = 1000) => {
  let timerId = 0;

  return (...args) => {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

module.exports = { debounce };
