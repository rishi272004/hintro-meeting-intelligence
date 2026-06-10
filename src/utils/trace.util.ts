import { v4 as uuidv4 } from 'uuid';

export function generateTraceId(): string {
  return uuidv4();
}
