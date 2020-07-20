import format from "date-fns/format";
import differenceInDays from "date-fns/differenceInDays";
import differenceInMonths from "date-fns/differenceInMonths";
import addMonths from "date-fns/addMonths";
import addDays from "date-fns/addDays";
import setDate from "date-fns/setDate";
import getDay from "date-fns/getDay";
import getMonth from "date-fns/getMonth";
import getYear from "date-fns/getYear";
import startOfDay from "date-fns/startOfDay";

export const differenceInPeriods = (startDate, endDate) => {
  // handle negatives?
  const decimalMonths = differenceInMonths(endDate, startDate);
  const wholeMonths = Math.floor(decimalMonths);
  const lastWholePeriodEnd = addMonths(startDate, wholeMonths);
  const partialDays = differenceInDays(endDate, lastWholePeriodEnd);
  const partialPeriod = partialDays / 30;
  return wholeMonths + partialPeriod;
};

export const periodEndDate = (startDate, months) => {
  const wholeMonths = Math.floor(months);
  const partialPeriod = months - wholeMonths;
  const lastWholePeriodEnd = addMonths(startDate, wholeMonths);
  return addDays(lastWholePeriodEnd, Math.round(partialPeriod * 30));
};

export const dateFormat = (date) =>
  new Date(date).getYear() !== new Date().getYear()
    ? format(new Date(date), "EEE, MMM d, y")
    : format(new Date(date), "EEE, MMM d");

export const dateOnly = (date) => startOfDay(date);
