from fastapi import FastAPI
from app.api import router as api_router
from app.document_api import router as doc_router
from app.weaviate_utils import init_schema
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_schema()
    yield

app = FastAPI(
    title="RAG-powered Document Assistant",
    description="Backend API for document embedding, querying, and chat streaming",
    version="1.0.0",
    docs_url="/docs",      # Swagger UI
    redoc_url="/redoc",    # ReDoc UI
    openapi_url="/openapi.json",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(doc_router)
