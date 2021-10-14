export const colorChannelMixer = (
  colorChannelA: number,
  colorChannelB: number,
  amountToMix: number
) => {
  const channelA = colorChannelA * amountToMix;
  const channelB = colorChannelB * (1 - amountToMix);
  return Math.round(channelA + channelB);
};

export const colorMixer = (
  rgbA: [number, number, number],
  rgbB: [number, number, number],
  amountToMix: number
) => {
  var r = colorChannelMixer(rgbA[0], rgbB[0], amountToMix);
  var g = colorChannelMixer(rgbA[1], rgbB[1], amountToMix);
  var b = colorChannelMixer(rgbA[2], rgbB[2], amountToMix);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
};
