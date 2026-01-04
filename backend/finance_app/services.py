from datetime import datetime, timedelta
from decimal import Decimal
from django.db.models import Sum
from .models import Transaction, RecurringRule


def get_dashboard_metrics(user_id=None):
    """
    Prepares dashboard metrics for FinanceOS frontend.
    
    Returns a dictionary with keys matching the frontend interface:
    - safe_to_spend: Available spending money after bills and buffer
    - total_balance: Sum of all REAL transactions
    - pending_bills_total: Sum of upcoming ghost transactions
    - buffer_target: Fixed buffer amount (configurable)
    - upcoming_bills: List of upcoming bill objects
    - burn_down_chart: 60-day balance projection
    """
    
    account_id = "default_account"
    buffer_target = Decimal('1000.00')
    
    total_balance = Transaction.objects.filter(
        account_id=account_id,
        status='REAL'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    
    upcoming_bills = generate_ghost_transactions(account_id, days=30)
    
    pending_bills_total = sum(bill['amount'] for bill in upcoming_bills)
    
    safe_to_spend = total_balance - pending_bills_total - buffer_target
    
    burn_down_chart = generate_burn_down_chart(
        total_balance, 
        account_id, 
        days=60
    )
    
    return {
        'safe_to_spend': float(safe_to_spend),
        'total_balance': float(total_balance),
        'pending_bills_total': float(pending_bills_total),
        'buffer_target': float(buffer_target),
        'upcoming_bills': upcoming_bills,
        'burn_down_chart': burn_down_chart,
    }


def generate_ghost_transactions(account_id, days=30):
    """
    Generate ghost transactions (upcoming bills) based on recurring rules.
    
    Returns a list of bill dictionaries with:
    - id: unique identifier
    - name: bill name
    - dueDate: ISO format date string
    - amount: bill amount
    - status: 'pending' or 'paid'
    """
    today = datetime.now().date()
    end_date = today + timedelta(days=days)
    
    recurring_rules = RecurringRule.objects.filter(
        account_id=account_id,
        is_active=True,
        start_date__lte=end_date
    )
    
    ghost_transactions = []
    
    for rule in recurring_rules:
        current_date = max(rule.start_date, today)
        
        while current_date <= end_date:
            if rule.end_date and current_date > rule.end_date:
                break
            
            ghost_transactions.append({
                'id': f"{rule.id}_{current_date.isoformat()}",
                'name': rule.name,
                'dueDate': current_date.isoformat(),
                'amount': float(rule.amount),
                'status': 'pending'
            })
            
            if rule.frequency == 'DAILY':
                current_date += timedelta(days=1)
            elif rule.frequency == 'WEEKLY':
                current_date += timedelta(weeks=1)
            elif rule.frequency == 'MONTHLY':
                month = current_date.month + 1
                year = current_date.year
                if month > 12:
                    month = 1
                    year += 1
                try:
                    current_date = current_date.replace(year=year, month=month)
                except ValueError:
                    current_date = current_date.replace(year=year, month=month, day=1)
            elif rule.frequency == 'YEARLY':
                current_date = current_date.replace(year=current_date.year + 1)
            else:
                break
    
    ghost_transactions.sort(key=lambda x: x['dueDate'])
    
    return ghost_transactions


def generate_burn_down_chart(starting_balance, account_id, days=60):
    """
    Generate a 60-day balance projection showing how balance decreases over time.
    
    Returns a list of dictionaries with:
    - date: ISO format date string
    - balance: projected balance at that date
    """
    today = datetime.now().date()
    
    ghost_transactions = generate_ghost_transactions(account_id, days=days)
    
    chart_data = []
    current_balance = starting_balance
    
    for i in range(days + 1):
        projection_date = today + timedelta(days=i)
        
        bills_on_date = [
            bill for bill in ghost_transactions 
            if bill['dueDate'] == projection_date.isoformat()
        ]
        
        for bill in bills_on_date:
            current_balance -= Decimal(str(bill['amount']))
        
        chart_data.append({
            'date': projection_date.isoformat(),
            'balance': float(current_balance)
        })
    
    return chart_data
