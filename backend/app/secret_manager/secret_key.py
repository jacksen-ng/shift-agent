from google.cloud import secretmanager
import firebase_admin
from firebase_admin import credentials
import json

def initialize_firebase(project_id, secret_id, version_id="latest"):
    if firebase_admin._apps:
        return firebase_admin.get_app()

    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response = client.access_secret_version(name=name)
    firebase_credentials_json = json.loads(response.payload.data.decode("UTF-8"))
    cred = credentials.Certificate(firebase_credentials_json)

    app = firebase_admin.initialize_app(cred)
    return app
    
def get_cloudsql_secret(project_id, secret_id, version_id="latest"):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response = client.access_secret_version(name=name)
    return response.payload.data.decode("UTF-8")

def get_firebase_secret(project_id, secret_id, version_id="latest"):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response = client.access_secret_version(name=name)
    return response.payload.data.decode("UTF-8")

def get_gemini_secret(project_id, secret_id, version_id="latest"):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response = client.access_secret_version(name=name)
    secret_value = response.payload.data.decode("UTF-8")
    if "=" in secret_value:
        return secret_value.split("=", 1)[1]
    return secret_value