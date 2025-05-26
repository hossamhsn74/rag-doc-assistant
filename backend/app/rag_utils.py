from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from sse_starlette.sse import EventSourceResponse
from app.weaviate_utils import get_client
from typing import List
from app.llm_groq import generate_with_groq
import uuid


embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        

def embed_and_store(docs: List[str], source: str):
    """
    Splits documents into chunks, embeds each chunk, and stores them in the Weaviate vector database.
    Args:
        docs (List[str]): List of document strings to embed and store.
        source (str): The source or filename associated with the documents.
    Returns:
        str: The UUID of the last stored chunk.
    """
    client = get_client()
    try:
        chunks = text_splitter.create_documents(docs)
        collection = client.collections.get("Document")
        for chunk in chunks:
            content = chunk.page_content
            vector = embedding_model.embed_query(content)
            generated_uuid = str(uuid.uuid4())
            collection.data.insert(
                uuid=generated_uuid,
                properties={"content": content, "source": source},
                vector=vector
            )
        
        return generated_uuid
    finally:
        client.close()


def retrieve_similar_docs(query: str, top_k=5):
    """
    Retrieves the top_k most similar documents from the vector database for a given query.
    Args:
        query (str): The query string to search for similar documents.
        top_k (int): Number of top similar documents to retrieve.
    Returns:
        List[dict]: List of documents with 'content' and 'source'.
    """
    client = get_client()
    query_vector = embedding_model.embed_query(query)
    try:
        collection = client.collections.get("Document")
        results = (
            collection.query.near_vector(
                near_vector=query_vector,
                limit=top_k,
                return_properties=["content", "source"]
            )
        )
        documents = [
            {
                "content": obj.properties["content"],
                "source": obj.properties["source"]
            }
            for obj in results.objects
        ]
        return documents
    finally:
        client.close()


def generate_answer(query: str, docs: list[dict]) -> str:
    """
    Generates an answer to the query using the provided documents as context.
    Args:
        query (str): The user's question.
        docs (list[dict]): List of document dicts to use as context.
    Returns:
        str: The generated answer.
    """
    context = "\n\n".join(doc["content"] for doc in docs)
    prompt = f"Use the following documentation to answer the question:\n\n{context}\n\nQuestion: {query}\nAnswer:"
    return generate_with_groq(prompt)


async def stream_answer(query: str, docs: list[dict]):
    """
    Streams the answer to a query token by token using Server-Sent Events (SSE).
    Args:
        query (str): The user's question.
        docs (list[dict]): List of document dicts to use as context.
    Returns:
        EventSourceResponse: An SSE response streaming the answer tokens.
    """
    context = "\n\n".join(doc["content"] for doc in docs)
    prompt = f"Use the following documentation to answer the question:\n\n{context}\n\nQuestion: {query}\nAnswer:"
    
    # Simulate token-by-token streaming
    answer = generate_with_groq(prompt)
    
    async def event_generator():
        for token in answer.split():
            yield {"data": token}
    return EventSourceResponse(event_generator())
