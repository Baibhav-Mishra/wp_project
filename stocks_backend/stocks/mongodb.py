from pymongo import MongoClient

client = MongoClient("mongodb+srv://admin:admin@cluster0.h9irjaz.mongodb.net/?retryWrites=true&w=majority")
db = client["stock_dashbord"]