from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

# Try to connect to MongoDB, fallback to in-memory storage if not available
try:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    print(f"Connecting to MongoDB: {MONGO_URI}")
    
    client = AsyncIOMotorClient(MONGO_URI)
    db = client["wildfire_db"]
    alerts_collection = db["alerts"]
    fire_reports = db["fire_reports"]
    
    print(" MongoDB connected successfully")
    
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    print("Using in-memory storage for testing...")
    
    # Fallback to in-memory storage
    class InMemoryCollection:
        def __init__(self):
            self.data = []
            self.next_id = 1
        
        async def insert_one(self, doc):
            doc["_id"] = self.next_id
            self.data.append(doc)
            self.next_id += 1
            return type('Result', (), {'inserted_id': doc["_id"]})()
        
        async def find(self, query=None):
            if query is None:
                return self.data
            # Simple filtering (for testing)
            return [doc for doc in self.data if all(doc.get(k) == v for k, v in query.items())]
        
        async def find_one(self, query):
            results = await self.find(query)
            return results[0] if results else None
        
        async def update_one(self, query, update):
            for i, doc in enumerate(self.data):
                if all(doc.get(k) == v for k, v in query.items()):
                    self.data[i].update(update.get("$set", {}))
                    return type('Result', (), {'modified_count': 1})()
            return type('Result', (), {'modified_count': 0})()
        
        async def delete_one(self, query):
            for i, doc in enumerate(self.data):
                if all(doc.get(k) == v for k, v in query.items()):
                    del self.data[i]
                    return type('Result', (), {'deleted_count': 1})()
            return type('Result', (), {'deleted_count': 0})()
        
        async def sort(self, field, direction):
            # Simple sorting for testing
            reverse = direction == -1
            self.data.sort(key=lambda x: x.get(field, 0), reverse=reverse)
            return self
        
        async def to_list(self, limit=None):
            return self.data[:limit] if limit else self.data
    
    # Create in-memory collections
    alerts_collection = InMemoryCollection()
    fire_reports = InMemoryCollection()
    db = None  # No database object for in-memory storage
