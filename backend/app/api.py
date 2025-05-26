from fastapi import APIRouter
from app.rag_utils import retrieve_similar_docs, generate_answer, stream_answer
from fastapi import Request
router = APIRouter()


@router.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint to verify the API is running.
    Returns a simple status message.
    """
    return {"status": "ok"}


@router.post("/ask", tags=["query"])
async def ask(request: Request):
    """
    Accepts a POST request with a JSON body containing a 'query' field.
    Retrieves similar documents and generates an answer using the LLM.
    Returns the answer and the sources used.
    """
    data = await request.json()
    query = data.get("query")
    docs = retrieve_similar_docs(query)
    answer = generate_answer(query, docs)
    return {"answer": answer, "sources": [doc["source"] for doc in docs]}



@router.get("/stream", tags=["stream"])
async def stream(request: Request, query: str):
    """
    Streams the answer to a query using Server-Sent Events (SSE).
    Accepts a query string, retrieves similar documents, and streams the answer tokens.
    """
    docs = retrieve_similar_docs(query)
    return await stream_answer(query, docs)