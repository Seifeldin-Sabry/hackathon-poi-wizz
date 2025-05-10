from fastapi import FastAPI
from app.api import index, documents, search

app = FastAPI()

app.include_router(index.router)
app.include_router(documents.router, prefix="/documents")
app.include_router(search.router, prefix="/search")
