
from django.urls import path
from . import views
from .api import stock_data

urlpatterns = [
    # path('', views.home, name='home'),  # Optional GUI version
    path('api/stocks/<str:symbol>/', stock_data),  # React frontend API
    path('api/login/', views.login_view, name='login'),
    path('api/register/', views.register_view, name='register'),
    # path('api/user/stocks/', views.get_user_stocks, name='get_user_stocks'),
    path('api/user/stocks/<str:username>/', views.get_user_stocks, name='get_user_stocks'),
    path('api/user/stocks/post/<str:username>/', views.post_user_stock, name='post_user_stock'),
    path("api/user/stocks/delete/<str:username>/<str:symbol>/", views.delete_user_stock),
    path('api/user/stocks/update/<str:username>/<str:symbol>/', views.update_stock_buying_price, name='update_stock_buying_price'),



]
