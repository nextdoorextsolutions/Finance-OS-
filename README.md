# FinanceOS

A full-stack personal finance management application with Django backend and Next.js frontend.

## Project Structure

```
Finance-OS--main/
├── backend/          # Django REST API
│   ├── finance_project/    # Django project settings
│   ├── finance_app/        # Main Django app
│   │   ├── models.py       # Transaction and RecurringRule models
│   │   ├── services.py     # Business logic (get_dashboard_metrics)
│   │   ├── views.py        # API endpoints
│   │   └── urls.py         # URL routing
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/         # Next.js React application
    ├── src/
    │   ├── app/            # Next.js App Router
    │   │   ├── page.tsx    # Dashboard component
    │   │   ├── layout.tsx  # Root layout
    │   │   └── globals.css # Global styles
    │   └── components/     # React components
    ├── package.json
    └── tsconfig.json
```

## Features

- **Real-time Dashboard**: View safe-to-spend, total balance, pending bills, and buffer target
- **60-Day Projection**: Burn-down chart showing balance projections
- **Recurring Bills**: Automatic ghost transaction generation for upcoming bills
- **CORS-Enabled API**: Django backend configured for frontend communication

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

6. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

   The backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## API Endpoints

### GET /api/dashboard/

Returns dashboard metrics including:
- `safe_to_spend`: Available spending money
- `total_balance`: Sum of all real transactions
- `pending_bills_total`: Sum of upcoming bills
- `buffer_target`: Fixed buffer amount
- `upcoming_bills`: Array of bill objects
- `burn_down_chart`: 60-day balance projection

**Example Response:**
```json
{
  "safe_to_spend": 680.00,
  "total_balance": 3920.00,
  "pending_bills_total": 2360.00,
  "buffer_target": 1000.00,
  "upcoming_bills": [
    {
      "id": "1_2024-01-10",
      "name": "Rent",
      "dueDate": "2024-01-10",
      "amount": 800.00,
      "status": "pending"
    }
  ],
  "burn_down_chart": [
    {"date": "2024-01-04", "balance": 3920.00},
    {"date": "2024-01-05", "balance": 3920.00}
  ]
}
```

## Technology Stack

**Backend:**
- Django 4.2+
- django-cors-headers
- SQLite (default, can be changed to PostgreSQL/MySQL)

**Frontend:**
- Next.js 16
- React 19
- TypeScript
- TailwindCSS
- shadcn/ui components
- Recharts for data visualization
- Lucide React for icons

## Development Notes

- The backend runs on port 8000
- The frontend runs on port 3000
- CORS is configured to allow requests from localhost:3000
- Type safety is maintained between frontend TypeScript interfaces and backend JSON responses

## License

MIT
