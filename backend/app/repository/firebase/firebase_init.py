import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))

from secret_manager.secret_key import initialize_firebase

def get_firebase_connection():
    PROJECT_ID = "jacksen-server"
    SECRET_ID = "firebase-secret-credential"
    firebase_config = initialize_firebase(PROJECT_ID, SECRET_ID)
    return firebase_config
