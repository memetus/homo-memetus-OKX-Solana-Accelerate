export const formatPrice = (price: string) => {
  const asNumber = parseFloat(price);

  if (asNumber >= 1000) {
    return `${Math.floor(asNumber / 1000)}K`;
  }
  return asNumber;
};

export const formatSignPrice = (price: string) => {
  const asNumber = parseFloat(price);

  if (asNumber >= 1000) {
    return `+$${Math.abs(Math.floor(asNumber / 1000))}K`;
  } else if (asNumber <= -1000) {
    return `-$${Math.abs(Math.floor(asNumber / 1000))}K`;
  } else if (asNumber > 0) {
    return `+$${Math.abs(asNumber)}`;
  } else if (asNumber < 0) {
    return `-$${Math.abs(asNumber)}`;
  } else {
    return `$${asNumber}`;
  }
};

export const formatSign = (price: string) => {
  const asNumber = parseFloat(price);

  if (asNumber >= 1000) {
    return `+${Math.abs(Math.floor(asNumber / 1000))}K`;
  } else if (asNumber <= -1000) {
    return `-${Math.abs(Math.floor(asNumber / 1000))}K`;
  } else if (asNumber > 0) {
    return `+${Math.abs(asNumber)}`;
  } else if (asNumber < 0) {
    return `-${Math.abs(asNumber)}`;
  } else {
    return `${asNumber}`;
  }
};

export const formatSignPercentage = (price: string) => {
  const asNumber = parseFloat(price);

  if (asNumber > 0) {
    return `+${Math.abs(asNumber)}%`;
  } else if (asNumber < 0) {
    return `-${Math.abs(asNumber)}%`;
  } else {
    return `${asNumber}%`;
  }
};
