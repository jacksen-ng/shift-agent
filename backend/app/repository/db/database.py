from .db_init import get_db_connection
from .models import Base

def drop_tables():
    try:
        engine = get_db_connection()
        Base.metadata.drop_all(engine)
        print("All tables dropped successfully")
        return True
    except Exception as e:
        print(f"Failed to drop tables: {e}")
        return False

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
    print("Dropping existing tables...")
    drop_tables()
    print("Creating database tables...")
    create_tables() 