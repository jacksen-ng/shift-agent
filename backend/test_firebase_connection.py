#!/usr/bin/env python3

import os
import sys
from typing import Dict, Any
import json

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from google.cloud import firestore as gcs_firestore
except ImportError as e:
    print(f"Missing dependencies: {e}")
    sys.exit(1)


class FirebaseConnectionTester:
    
    def __init__(self, project_id: str = None):
        self.project_id = project_id or "jacksen-server-b595c"
        self.app = None
        self.db = None
        
    def initialize_firebase(self) -> bool:
        try:
            if not firebase_admin._apps:
                service_account_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
                
                if service_account_path and os.path.exists(service_account_path):
                    cred = credentials.Certificate(service_account_path)
                    self.app = firebase_admin.initialize_app(cred)
                else:
                    self.app = firebase_admin.initialize_app()
            else:
                self.app = firebase_admin.get_app()
                
            from google.cloud.firestore import Client
            self.db = Client(project=self.project_id, database='default')
            return True
            
        except Exception:
            return False
    
    def test_firestore_connection(self) -> bool:
        try:
            test_collection = self.db.collection('connection_test')
            
            test_doc = {
                'message': 'Hello from Firebase!',
                'timestamp': firestore.SERVER_TIMESTAMP,
                'test_type': 'connection_test'
            }
            
            doc_ref = test_collection.add(test_doc)
            
            docs = test_collection.limit(1).stream()
            doc_count = 0
            for doc in docs:
                doc_count += 1
            
            if doc_count > 0:
                try:
                    test_docs = test_collection.where('test_type', '==', 'connection_test').stream()
                    for doc in test_docs:
                        doc.reference.delete()
                except Exception:
                    pass
                
                return True
            else:
                return False
                
        except Exception:
            return False
    
    def test_dataconnect_config(self) -> bool:
        try:
            config_files = [
                'dataconnect/dataconnect.yaml',
                'firebase.json',
                '.firebaserc'
            ]
            
            for config_file in config_files:
                if not os.path.exists(config_file):
                    return False
            
            with open('dataconnect/dataconnect.yaml', 'r', encoding='utf-8') as f:
                import yaml
                try:
                    dataconnect_config = yaml.safe_load(f)
                    service_id = dataconnect_config.get('serviceId')
                    location = dataconnect_config.get('location')
                    if not service_id or not location:
                        return False
                except ImportError:
                    content = f.read()
                    if 'serviceId:' not in content or 'location:' not in content:
                        return False
            
            return True
            
        except Exception:
            return False
    
    def run_full_test(self) -> bool:
        config_ok = self.test_dataconnect_config()
        if not config_ok:
            return False
        
        init_ok = self.initialize_firebase()
        if not init_ok:
            return False
        
        firestore_ok = self.test_firestore_connection()
        
        return config_ok and init_ok and firestore_ok


def main():
    if not os.path.exists('firebase.json'):
        return
    
    tester = FirebaseConnectionTester()
    success = tester.run_full_test()
    
    if success:
        print("Firebase test passed")
    else:
        print("Firebase test failed")
        sys.exit(1)


if __name__ == "__main__":
    main() 