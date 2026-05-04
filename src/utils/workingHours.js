export const weekdayOrder = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const defaultWorkingHours = weekdayOrder.reduce((accumulator, weekday) => {
  accumulator[weekday] = {
    enabled: weekday !== 'sunday',
    startTime: '09:00',
    endTime: '23:00',
  };
  return accumulator;
}, {});

export const getWorkingHoursSummary = (workingHours = {}, t) =>
  weekdayOrder
    .map((weekday) => ({
      key: weekday,
      label: t(`weekdays.${weekday}`),
      value: workingHours[weekday],
    }))
    .filter((item) => item.value?.enabled);
