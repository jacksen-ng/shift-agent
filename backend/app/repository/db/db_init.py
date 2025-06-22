import os
import sys
from contextlib import contextmanager
from google.cloud.sql.connector import Connector
import sqlalchemy
from sqlalchemy.orm import sessionmaker


sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from secret_manager.secret_key import get_cloudsql_secret

connector = Connector()
engine = None
Session = None

def get_db_connection():
    global engine
    if engine is None:
        PROJECT_ID = "jacksen-server"
        
        db_config_string = get_cloudsql_secret(PROJECT_ID, "cloud-sql-secret")
        config_dict = {}
        for line in db_config_string.split('\n'):
            line = line.strip()
            if line and '=' in line:
                key, value = line.split('=', 1) 
                config_dict[key.strip()] = value.strip()
            
        INSTANCE_CONNECTION_NAME = config_dict.get("INSTANCE_CONNECTION_NAME")
        DB_USER = config_dict.get("DB_USERNAME")
        DB_NAME = config_dict.get("DATABASE")
        DB_PASSWORD = config_dict.get("DB_PASSWORD")
        
        if not INSTANCE_CONNECTION_NAME or not DB_USER or not DB_NAME or not DB_PASSWORD:
            raise ValueError("Missing required database configuration")
        
        try:
            engine = sqlalchemy.create_engine(
                "postgresql+pg8000://",
                creator=lambda: connector.connect(
                    INSTANCE_CONNECTION_NAME,
                    "pg8000",
                    user=DB_USER,
                    password=DB_PASSWORD,
                    db=DB_NAME
                ),
            )
            
        except Exception as e:
            print(f"Error initializing database connection: {e}")
            raise
    
    return engine
    
def init_session():
    global Session
    if Session is None:
        engine = get_db_connection()
        Session = sessionmaker(bind=engine)

def get_db_session():
    init_session()
    return Session()

@contextmanager
def get_session_scope():
    init_session()
    session = Session()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Database operation failed, rolled back: {e}")
        raise
    finally:
        session.close()

def test_db_connection():
    engine = get_db_connection()
    if engine:
        try:
            with engine.connect() as conn:
                result = conn.execute(sqlalchemy.text("SELECT 1"))
                if result.scalar() == 1:
                    print("Database connection successful!")
                    return True
                else:
                    print("Database connection failed: SELECT 1 did not return 1.")
                    return False
        except Exception as e:
            print(f"Error executing test query: {e}")
            return False
    else:
        print("Failed to get database connection pool.")
        return False