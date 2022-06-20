const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const clipStr = (str, maxLength = 300) => {
  if (str.length <= maxLength || maxLength <= 0) {
    return str;
  }
  return str.substring(0, maxLength - 3) + "...";
};

const clipLines = (lines, maxLength = 10, ellipsis = "...") => {
  if (lines.length <= maxLength || maxLength <= 0) {
    return lines;
  }
  return lines.slice(0, maxLength - 1).concat([ellipsis]);
};

export { randInt, clipStr, clipLines };
