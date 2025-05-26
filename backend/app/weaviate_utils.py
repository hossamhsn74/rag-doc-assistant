import weaviate
from weaviate.classes.config import Property, DataType


def get_client():
    """
    Connects to a local Weaviate instance and returns the client.
    Raises an exception if Weaviate is not ready.
    Returns:
        weaviate.WeaviateClient: The connected Weaviate client.
    """
    client = weaviate.connect_to_local(host="localhost", port=8080)
    if not client.is_ready():
        raise Exception("Weaviate is not ready")
    return client


def init_schema():
    """
    Initializes the Weaviate schema by creating the 'Document' collection if it does not exist.
    The collection contains 'content' and 'source' properties, both of type TEXT.
    """
    client = get_client()
    try:
        if not client.collections.exists("Document"):
            # Collection with properties
            client.collections.create(
                name="Document",
                description="Chunks of documentation",
                properties=[
                    Property(name="content", data_type=DataType.TEXT),
                    Property(name="source", data_type=DataType.TEXT),
                ]
            )
    finally:
        client.close()
