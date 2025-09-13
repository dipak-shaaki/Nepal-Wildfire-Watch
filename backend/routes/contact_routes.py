from fastapi import APIRouter, HTTPException
from models.user_message import UserMessage
from database.mongo import db
from bson import ObjectId

router = APIRouter(tags=["Contact Form"])
messages_collection = db["user_messages"]

def serialize_message(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.post("/contact")
async def submit_message(data: UserMessage):
    result = await messages_collection.insert_one(data.dict())
    saved = await messages_collection.find_one({"_id": result.inserted_id})
    return serialize_message(saved)

@router.get("/messages")
async def get_messages():
    messages = await messages_collection.find().to_list(100)
    return [serialize_message(msg) for msg in messages]

@router.delete("/messages/{message_id}")
async def delete_message(message_id: str):
    try:
        result = await messages_collection.delete_one({"_id": ObjectId(message_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Message not found")
        return {"message": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete message: {str(e)}")