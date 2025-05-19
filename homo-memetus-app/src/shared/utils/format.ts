export const getShortenAddr = (address: string, slice?: number) => {
  if (slice) {
    return `${address.slice(0, slice)}...${address.slice(-slice)}`;
  }
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const thousandFormat = (num: string | number): string => {
  // Check if the input is null, undefined, or not a number.
  if (num === null || num === undefined || isNaN(Number(num))) {
    return '0';
  }

  // Convert the input to a string if it's not already.
  const base = num.toString();

  // Format the string with thousand separators.
  return base.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
};
