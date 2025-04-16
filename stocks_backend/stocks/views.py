# # stocks/views.py

# from django.shortcuts import render, redirect
# from .models import Stock
# from .utils import fetch_and_store_stock

# def home(request):
#     if request.method == "POST":
#         symbol = request.POST.get("symbol").upper()
#         fetch_and_store_stock(symbol)
#         return redirect("home")

#     stocks = Stock.objects.all()
#     return render(request, "home.html", {"stocks": stocks})


# from django.contrib.auth import authenticate
# from rest_framework.response import Response
# from rest_framework.decorators import api_view
# from rest_framework import status
# from pymongo import MongoClient
# from datetime import datetime
# from django.contrib.auth.models import User

# @api_view(["POST"])
# def login_view(request):
#     # print("asiofjkld")
#     email = request.data.get("email")
#     password = request.data.get("password")

#     users = db["users"]
#     logins = db["logins"]
#     print(email)
#     user = users.find_one({"email": email})

#     login_success = user is not None and user.get("password") == password

#     # Log the login attempt
#     logins.insert_one({
#         "email": email,
#         "timestamp": datetime.utcnow(),
#         "success": login_success
#     })

#     if login_success:
#         return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
#     else:
#         return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# # views.py
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import status
# from .mongodb import db

# @api_view(["POST"])
# def register_view(request):
#     username = request.data.get("username")
#     email = request.data.get("email")
#     password = request.data.get("password")

#     if not email or not password or not username:
#         return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

#     users_collection = db["users"]

#     if users_collection.find_one({"username": username}):
#         return Response({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

#     if users_collection.find_one({"email": email}):
#         return Response({"error": "Email already in use."}, status=status.HTTP_400_BAD_REQUEST)

#     new_user = {
#         "username": username,
#         "email": email,
#         "password": password  # ⚠️ Optional: You should hash this before storing (see below)
#     }

#     users_collection.insert_one(new_user)

#     return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)


# from django.shortcuts import render, redirect
# from .models import Stock
# from .utils import fetch_and_store_stock

# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny
# from rest_framework.response import Response
# from rest_framework import status
# from datetime import datetime
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator
# from pymongo import MongoClient
# from .mongodb import db  # Assuming your pymongo database connection is handled here


# def home(request):
#     if not request.session.get("user_email"):
#         return redirect("login_page")  # Replace with your login URL name

#     if request.method == "POST":
#         symbol = request.POST.get("symbol").upper()
#         fetch_and_store_stock(symbol)
#         return redirect("home")

#     stocks = Stock.objects.all()
#     return render(request, "home.html", {"stocks": stocks})


# @api_view(["GET"])
# @permission_classes([AllowAny])
# def check_auth(request):
#     if request.session.get("user_email"):
#         return Response({"authenticated": True, "email": request.session["user_email"]})
#     else:
#         return Response({"authenticated": False})


# @api_view(["POST"])
# @permission_classes([AllowAny])
# @csrf_exempt
# def login_view(request):
#     email = request.data.get("email")
#     password = request.data.get("password")

#     users = db["users"]
#     user = users.find_one({"email": email})

#     if user and user.get("password") == password:
#         request.session["user_email"] = email  # Session-based login
#         return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
#     else:
#         return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


# @api_view(["POST"])
# @permission_classes([AllowAny])
# @csrf_exempt
# def logout_view(request):
#     request.session.flush()  # Clears all session data
#     return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)


# @api_view(["POST"])
# @permission_classes([AllowAny])
# @csrf_exempt
# def register_view(request):
#     username = request.data.get("username")
#     email = request.data.get("email")
#     password = request.data.get("password")

#     if not email or not password or not username:
#         return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

#     users = db["users"]

#     if users.find_one({"username": username}):
#         return Response({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

#     if users.find_one({"email": email}):
#         return Response({"error": "Email already in use."}, status=status.HTTP_400_BAD_REQUEST)

#     new_user = {
#         "username": username,
#         "email": email,
#         "password": password
#     }

#     users.insert_one(new_user)

#     return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)






from django.shortcuts import render, redirect
from .utils import fetch_and_store_stock
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from pymongo import MongoClient
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from .mongodb import db  # MongoDB connection
from django.http import JsonResponse
import json
# MongoDB: User's Stocks collection
users_stocks = db["user_stocks"]
@csrf_exempt
def get_user_stocks(request, username):
    try:
        user_stocks = users_stocks.find_one({"username": username})
        if user_stocks:
            return JsonResponse({"stocks": user_stocks.get("stocks", [])}, status=200)
        else:
            return JsonResponse({"stocks": []}, status=200)  # return empty list instead of 404
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@api_view(["POST"])
def post_user_stock(request, username):
    try:
        data = json.loads(request.body)
        stock_symbol = data.get("symbol")
        quantity = data.get("quantity", 0)
        buying_price = data.get("buyingPrice", 0)  # Added buying price parameter

        if not stock_symbol:
            return JsonResponse({"error": "Stock symbol is required"}, status=400)

        if not isinstance(quantity, (int, float)) or quantity <= 0:
            return JsonResponse({"error": "Quantity must be a positive number"}, status=400)
            
        if not isinstance(buying_price, (int, float)) or buying_price <= 0:
            return JsonResponse({"error": "Buying price must be a positive number"}, status=400)

        stock_entry = {
            "symbol": stock_symbol.upper(), 
            "quantity": quantity,
            "buyingPrice": buying_price  # Store buying price in database
        }

        user_stocks = users_stocks.find_one({"username": username})

        if user_stocks:
            # Check if stock already exists
            existing_stocks = user_stocks.get("stocks", [])
            for stock in existing_stocks:
                if stock["symbol"] == stock_symbol.upper():
                    return JsonResponse({"message": "Stock already exists"}, status=200)

            # Add new stock
            users_stocks.update_one(
                {"username": username},
                {"$push": {"stocks": stock_entry}}
            )
            return JsonResponse({"message": "Stock added successfully"}, status=200)

        else:
            # New user entry
            users_stocks.insert_one({
                "username": username,
                "stocks": [stock_entry]
            })
            return JsonResponse({"message": "Stock added successfully"}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@api_view(["DELETE"])
def delete_user_stock(request, username, symbol):
    try:
        symbol = symbol.upper()
        result = users_stocks.update_one(
            {"username": username},
            {"$pull": {"stocks": {"symbol": symbol}}}
        )

        if result.modified_count == 0:
            return JsonResponse({"message": "Stock not found or already deleted"}, status=404)

        return JsonResponse({"message": f"Deleted {symbol} from {username}'s watchlist"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# Add this helper function to update buying price for existing stocks
@csrf_exempt
@api_view(["PATCH"])
def update_stock_buying_price(request, username, symbol):
    try:
        data = json.loads(request.body)
        buying_price = data.get("buyingPrice", 0)
        
        if not isinstance(buying_price, (int, float)) or buying_price <= 0:
            return JsonResponse({"error": "Buying price must be a positive number"}, status=400)
            
        symbol = symbol.upper()
        result = users_stocks.update_one(
            {"username": username, "stocks.symbol": symbol},
            {"$set": {"stocks.$.buyingPrice": buying_price}}
        )
        
        if result.modified_count == 0:
            return JsonResponse({"message": "Stock not found or no changes made"}, status=404)
            
        return JsonResponse({"message": f"Updated buying price for {symbol}"}, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(["POST"])
@permission_classes([AllowAny])
@csrf_exempt
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")

    users = db["users"]
    user = users.find_one({"email": email})

    if user and user.get("password") == password:
        request.session["user_email"] = email  # Session-based login
        return Response({"message": "Login successful", "name": user.get("username")}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
@permission_classes([AllowAny])
@csrf_exempt
def register_view(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password or not username:
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    users = db["users"]

    if users.find_one({"username": username}):
        return Response({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

    if users.find_one({"email": email}):
        return Response({"error": "Email already in use."}, status=status.HTTP_400_BAD_REQUEST)

    new_user = {
        "username": username,
        "email": email,
        "password": password
    }

    users.insert_one(new_user)

    # Initialize user's stock data in MongoDB
    users_stocks.insert_one({"email": email, "stocks": []})

    return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)

