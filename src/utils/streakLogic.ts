import { format } from "date-fns";

export const getTodayStr = () => format(new Date(), "yyyy-MM-dd");
export const getYesterdayStr = () =>
  format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
