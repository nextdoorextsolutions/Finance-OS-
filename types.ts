
export interface Field {
  name: string;
  type: string;
  constraints: string[];
  description: string;
}

export interface Table {
  name: string;
  description: string;
  fields: Field[];
}

export enum OutputFormat {
  DJANGO_MODELS = 'Django Models (Core)',
  SQL_POSTGRES = 'PostgreSQL SQL',
  IMPORT_LOGIC = 'Transaction Ingestor (Task 1)',
  DASHBOARD_API = 'Dashboard Metrics (Task 2)'
}
