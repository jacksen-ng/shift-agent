from google.cloud import secretmanager
import firebase_admin
from firebase_admin import credentials
import json

_secret_cache = {}
_secret_client = None

def _get_secret_client():
    global _secret_client
    if _secret_client is None:
        _secret_client = secretmanager.SecretManagerServiceClient()
    return _secret_client

def _get_secret_from_cache(project_id, secret_id, version_id="latest"):
    cache_key = f"{project_id}:{secret_id}:{version_id}"
    if cache_key not in _secret_cache:
        client = _get_secret_client()
        name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
        response = client.access_secret_version(name=name)
        _secret_cache[cache_key] = response.payload.data.decode("UTF-8")
    return _secret_cache[cache_key]

def initialize_firebase(project_id, secret_id, version_id="latest"):
    if firebase_admin._apps:
        return firebase_admin.get_app()

    firebase_credentials_json = json.loads(_get_secret_from_cache(project_id, secret_id, version_id))
    cred = credentials.Certificate(firebase_credentials_json)

    app = firebase_admin.initialize_app(cred)
    return app
    
def get_cloudsql_secret(project_id, secret_id, version_id="latest"):
    return _get_secret_from_cache(project_id, secret_id, version_id)

def get_firebase_secret(project_id, secret_id, version_id="latest"):
    return _get_secret_from_cache(project_id, secret_id, version_id)

def get_gemini_secret(project_id, secret_id, version_id="latest"):
    secret_value = _get_secret_from_cache(project_id, secret_id, version_id)
    if "=" in secret_value:
        return secret_value.split("=", 1)[1]
    return secret_value