import * as dayjs from 'dayjs';

export function toBoolean(value: string): boolean {
  value = value.toLowerCase();

  return value === 'true' || value === '1' ? true : false;
}

export function orderByCreatedAt(events) {
  return events.sort((a, b) =>
    dayjs(a.event_created_at).diff(dayjs(b.event_created_at)),
  );
}
