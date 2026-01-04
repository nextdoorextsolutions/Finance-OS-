from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .services import get_dashboard_metrics


@csrf_exempt
@require_http_methods(["GET"])
def dashboard_metrics(request):
    """
    API endpoint to get dashboard metrics.
    
    GET /api/dashboard/
    
    Returns JSON with:
    - safe_to_spend: float
    - total_balance: float
    - pending_bills_total: float
    - buffer_target: float
    - upcoming_bills: list of bill objects
    - burn_down_chart: list of date/balance projections
    """
    try:
        user_id = request.GET.get('user_id', None)
        
        metrics = get_dashboard_metrics(user_id)
        
        return JsonResponse(metrics, status=200)
    
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'message': 'Failed to retrieve dashboard metrics'
        }, status=500)
