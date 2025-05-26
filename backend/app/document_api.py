from fastapi import APIRouter, UploadFile, File, HTTPException
from app.rag_utils import embed_and_store
from app.weaviate_utils import get_client

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a .txt or .md file, embed its content, and store it in the vector database.
    Returns the status, generated UUID, and filename.
    """
    if not file.filename.endswith((".txt", ".md")):
        raise HTTPException(status_code=400, detail="Only .txt or .md supported")
    content = await file.read()
    text = content.decode("utf-8")
    uuid = embed_and_store([text], source=file.filename)
    return {"status": "stored", "uuid": uuid, "filename": file.filename}


@router.delete("/{uuid}")
async def delete_file_vectors(uuid: str):
    """
    Delete a document from the vector database by its UUID.
    Returns the status and the deleted UUID.
    """
    client = get_client()
    try:
        document_collection = client.collections.get("Document")
        document_collection.data.delete_by_id(uuid=uuid)
        return {"status": "deleted", "uuid": uuid}
    finally:
        client.close()


@router.get("")
async def list_filenames():
    """
    List all files stored in the vector database.
    Returns a list of objects with filename and UUID for each document.
    """
    client = get_client()
    collection = client.collections.get("Document")
    results = collection.query.fetch_objects(return_properties=True)
    files = [
        {"filename": obj.properties["source"], "uuid": obj.uuid}
        for obj in results.objects
    ]
    client.close()
    return {"files": files}
