// Đường dẫn: src/outbox-processor/utils.ts

import * as crypto from 'crypto';

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [namePart, domainPart] = email.split('@');
  if (namePart.length <= 2) return `${namePart[0]}*@${domainPart}`;

  const firstChar = namePart[0];
  const lastChar = namePart[namePart.length - 1];
  const maskedName = firstChar + '*'.repeat(namePart.length - 2) + lastChar;
  return `${maskedName}@${domainPart}`;
}

export function hashIdentifier(id: string): string {
  return crypto.createHash('sha256').update(id).digest('hex').substring(0, 12);
}