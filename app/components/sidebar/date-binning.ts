import { format, isAfter, isThisWeek, isThisYear, isToday, isYesterday, subDays } from 'date-fns';
import type { ChatHistoryItem } from '~/lib/persistence';

type Bin = { category: string; items: ChatHistoryItem[] };

export function binDates(_list: ChatHistoryItem[]) {
  const list = _list.toSorted((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

  const binLookup: Record<string, Bin> = {};
  const bins: Array<Bin> = [];

  list.forEach((item) => {
    const category = dateCategory(new Date(item.timestamp));

    if (!(category in binLookup)) {
      const bin = {
        category,
        items: [item],
      };

      binLookup[category] = bin;

      bins.push(bin);
    } else {
      binLookup[category].items.push(item);
    }
  });

  return bins;
}

function dateCategory(date: Date) {
  const now = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  if (isToday(localDate)) {
    return 'Today';
  }

  if (isYesterday(localDate)) {
    return 'Yesterday';
  }

  if (isThisWeek(localDate)) {
    // e.g., "Monday"
    return format(localDate, 'eeee');
  }

  const thirtyDaysAgo = subDays(now, 30);

  if (isAfter(localDate, thirtyDaysAgo)) {
    return 'Last 30 Days';
  }

  if (isThisYear(localDate)) {
    // e.g., "July"
    return format(localDate, 'MMMM');
  }

  // e.g., "July 2023"
  return format(localDate, 'MMMM yyyy');
}
