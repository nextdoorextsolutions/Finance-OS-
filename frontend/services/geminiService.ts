
import { GoogleGenAI } from "@google/genai";
import { OutputFormat } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TRANSACTION_INGESTOR_CODE = `import pandas as pd
import hashlib
from decimal import Decimal
from django.db import transaction
from .models import Transaction  # Assuming your model is named Transaction

class TransactionIngestor:
    def __init__(self, user_account_id):
        self.user_account_id = user_account_id

    def ingest_csv(self, file_path):
        # 1. Load CSV into Pandas
        df = pd.read_csv(file_path)

        # 2. Clean Data (Standardize dates and ensure amounts are floats)
        df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
        df['amount'] = pd.to_numeric(df['amount'])

        # 3. CRITICAL: Generate the Composite Hash
        # We combine Date + Amount + Account ID into one string and hash it.
        # This creates a unique fingerprint for every transaction.
        def create_hash(row):
            raw_string = f"{row['date']}{row['amount']}{self.user_account_id}"
            return hashlib.sha256(raw_string.encode('utf-8')).hexdigest()

        # Apply the function to every row in the spreadsheet
        df['hash_id'] = df.apply(create_hash, axis=1)

        # 4. Filter Duplicates
        # Get all existing hash_ids from the database to compare against
        existing_hashes = set(
            Transaction.objects.filter(account_id=self.user_account_id)
            .values_list('hash_id', flat=True)
        )

        # Keep only rows where the hash_id is NOT in the database
        new_transactions_df = df[~df['hash_id'].isin(existing_hashes)]

        # 5. Bulk Insert
        if not new_transactions_df.empty:
            transactions_to_create = [
                Transaction(
                    account_id=self.user_account_id,
                    date=row['date'],
                    amount=row['amount'],
                    description=row['description'],
                    hash_id=row['hash_id'],
                    status='REAL'
                )
                for index, row in new_transactions_df.iterrows()
            ]
            
            # Use atomic transaction to ensure all or nothing
            with transaction.atomic():
                Transaction.objects.bulk_create(transactions_to_create)
            
            return f"Successfully imported {len(transactions_to_create)} new transactions."
        
        return "No new transactions found."`;

export const getArchitecturalAdvice = async (schemaDescription: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this personal finance schema for "FinanceOS": ${schemaDescription}. 
               Provide 3 expert tips on implementing "Ghost Transactions" for forecasting and how to handle multi-account snapshots efficiently. 
               Suggest a strategy for a 'fixed_buffer_amount' configuration.`,
    config: {
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  return response.text;
};

export const generateCode = async (schema: any, format: string) => {
  if (format === OutputFormat.IMPORT_LOGIC) {
    return TRANSACTION_INGESTOR_CODE;
  }

  let prompt = "";
  
  if (format === OutputFormat.DASHBOARD_API) {
    prompt = `Write a Django service function 'get_dashboard_metrics(user_id)' that prepares data for a "FinanceOS" dashboard.
              Schema Context: ${JSON.stringify(schema)}
              UI Requirements: The frontend expects a JSON response with keys: 
              [safe_to_spend, total_balance, pending_bills_total, buffer_target, upcoming_bills, burn_down_chart].
              
              Logic:
              1. 'total_balance': Sum of all 'REAL' transactions for the user.
              2. 'upcoming_bills': Fetch RecurringRules and generate 'Ghost Transactions' for the next 30 days.
              3. 'pending_bills_total': Sum of the 'Ghost Transactions' amounts.
              4. 'buffer_target': A fixed amount (e.g., $1000) or user-defined setting.
              5. 'safe_to_spend': total_balance - pending_bills_total - buffer_target.
              6. 'burn_down_chart': List of {'date': date, 'balance': projected_balance} for next 60 days.
              
              Ensure the output is a serializable dictionary matching the FinanceOS UI precisely.`;
  } else {
    prompt = `Generate ${format} for this personal finance schema: ${JSON.stringify(schema)}. 
              Include unique constraints on 'hash_id' and index 'date' and 'merchant'.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.2
    }
  });

  return response.text;
};
