#!/usr/bin/env python3

import os
import sys
import json
import requests
from typing import Dict, Any

def test_dataconnect_endpoint() -> bool:
    try:
        with open('dataconnect/dataconnect.yaml', 'r', encoding='utf-8') as f:
            import yaml
            config = yaml.safe_load(f)
            
        service_id = config.get('serviceId')
        location = config.get('location')
        
        if not service_id or not location:
            return False
            
        endpoint_url = f"https://{location}-{service_id}.googleapis.com/graphql"
        
        introspection_query = {
            "query": """
            query IntrospectionQuery {
                __schema {
                    queryType {
                        name
                    }
                    mutationType {
                        name
                    }
                }
            }
            """
        }
        
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Firebase-DataConnect-Test-Script'
        }
        
        response = requests.post(
            endpoint_url,
            json=introspection_query,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and data['data']['__schema']:
                return True
            else:
                return False
        else:
            return False
            
    except Exception:
        return False

def check_schema_files() -> bool:
    try:
        schema_dir = "dataconnect/schema"
        connector_dir = "dataconnect/connector"
        
        if not os.path.exists(schema_dir):
            return False
            
        schema_file = os.path.join(schema_dir, "schema.gql")
        if os.path.exists(schema_file):
            with open(schema_file, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                active_lines = [line.strip() for line in lines if line.strip() and not line.strip().startswith('#')]
                
                if not active_lines:
                    return False
        else:
            return False
            
        if not os.path.exists(connector_dir):
            return False
                
        return True
        
    except Exception:
        return False

def main():
    if not os.path.exists('firebase.json'):
        sys.exit(1)
        
    schema_ok = check_schema_files()
    endpoint_ok = test_dataconnect_endpoint()
    
    if schema_ok and endpoint_ok:
        print("DataConnect test passed")
    else:
        print("DataConnect test failed")

if __name__ == "__main__":
    main() 