export const truncateString = (text, symbolsNumber) => {
  if (!text) {
    return "";
  }

  if (symbolsNumber >= text.length) {
    return text;
  }

  let newText = "";

  if (symbolsNumber < text.length + 1) {
    newText = `${text.slice(0, symbolsNumber)}...`;
  } else {
    newText = text;
  }

  return newText;
};

export const textService = {
  truncateString,
};
