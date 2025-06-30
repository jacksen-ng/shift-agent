import sqlalchemy

from .db_init import get_session_scope
from .models import tables

def display_all_table_contents():
    print("Attempting to connect to the database to display all table contents...")
    try:
        with get_session_scope() as session:
            inspector = sqlalchemy.inspect(session.bind)
            for table_model in tables:
                table_name = table_model.__tablename__
                print(f"\n----- Contents of table: {table_name} -----")

                try:
                    records = session.query(table_model).all()
                    if not records:
                        print("This table is currently empty.")
                    else:
                        for record in records:
                            print(record)
                except Exception as e:
                    print(f"An error occurred while querying table {table_name}: {e}")
            print("\n----- Successfully displayed all queryable tables. -----")
    except Exception as e:
        print(f"A critical error occurred: {e}")

if __name__ == "__main__":
    display_all_table_contents() 