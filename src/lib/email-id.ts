import { nanoid } from "nanoid";

export function createEmailId(): string {
  return `em_${nanoid(16)}`;
}
