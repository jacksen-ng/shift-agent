import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "models"))
from models import Base
from db_init import get_db_connection

def create_tables():
    try:
        engine = get_db_connection()
        Base.metadata.create_all(engine)
        print("All tables created successfully")
        return True
    except Exception as e:
        print(f"Failed to create tables: {e}")
        return False

if __name__ == "__main__":
    print("Creating database tables...")
    create_tables() 