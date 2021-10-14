export const formatDate = (at: Date) => {
  const year = at.getUTCFullYear().toString().padStart(4, '0');
  const month = (at.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = at.getUTCDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const getDateFromWeekday = (day: number) => {
  const date = new Date();
  date.setDate(0);
  while (date.getDay() !== day) {
    date.setDate(date.getDate() + 1);
  }
  return date;
};

export const getDayRange = (now = new Date()) => {
  const from = new Date();
  from.setFullYear(now.getFullYear());
  from.setMonth(now.getMonth());
  from.setDate(now.getDate());
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setFullYear(now.getFullYear());
  to.setMonth(now.getMonth());
  to.setDate(now.getDate());
  to.setHours(23, 59, 59, 0);
  return [from, to] as [from: Date, to: Date];
};
