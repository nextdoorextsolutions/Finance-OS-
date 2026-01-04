
import { Table } from './types';

export const INITIAL_SCHEMA: Table[] = [
  {
    name: 'Transactions',
    description: 'The core ledger tracking all movements of money.',
    fields: [
      { name: 'id', type: 'UUID', constraints: ['Primary Key', 'Default: uuid_generate_v4()'], description: 'Unique identifier' },
      { name: 'date', type: 'Date', constraints: ['Index'], description: 'Transaction timestamp' },
      { name: 'amount', type: 'Decimal(12,2)', constraints: ['Not Null'], description: 'Transaction value (positive for credit, negative for debit)' },
      { name: 'description', type: 'Text', constraints: [], description: 'Raw description from bank/CSV' },
      { name: 'merchant', type: 'String(255)', constraints: ['Index'], description: 'Cleaned merchant name' },
      { name: 'category', type: 'String(100)', constraints: ['Index'], description: 'Spending category' },
      { name: 'hash_id', type: 'String(64)', constraints: ['Unique', 'Index'], description: 'SHA-256 hash to prevent duplicate CSV imports' },
      { name: 'status', type: 'Enum', constraints: ["'REAL'", "'PROJECTED'"], description: 'Distinguishes between actual and future forecast transactions' }
    ]
  },
  {
    name: 'RecurringRules',
    description: 'Pattern matching rules to identify and forecast subscriptions/bills.',
    fields: [
      { name: 'id', type: 'UUID', constraints: ['Primary Key'], description: 'Unique identifier' },
      { name: 'name', type: 'String(255)', constraints: [], description: 'User-friendly rule name' },
      { name: 'pattern', type: 'String(255)', constraints: [], description: 'Regex or keyword pattern for matching descriptions' },
      { name: 'expected_amount', type: 'Decimal(12,2)', constraints: [], description: 'Average or fixed cost' },
      { name: 'frequency', type: 'Enum', constraints: ["'DAILY'", "'WEEKLY'", "'MONTHLY'", "'ANNUAL'"], description: 'How often the bill occurs' },
      { name: 'next_due_date', type: 'Date', constraints: [], description: 'Estimated next occurrence' }
    ]
  },
  {
    name: 'Snapshots',
    description: 'Time-series balance data for historical reporting and charting.',
    fields: [
      { name: 'id', type: 'UUID', constraints: ['Primary Key'], description: 'Unique identifier' },
      { name: 'timestamp', type: 'DateTime', constraints: ['Index'], description: 'When the snapshot was taken' },
      { name: 'balance', type: 'Decimal(15,2)', constraints: ['Not Null'], description: 'The running balance at this point in time' },
      { name: 'account_name', type: 'String(100)', constraints: [], description: 'The associated bank or investment account' }
    ]
  }
];
