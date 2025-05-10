from fastapi import FastAPI
from api import amenities, chat

app = FastAPI()

app.include_router(amenities.router, prefix="/amenities", tags=["Amenities"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
