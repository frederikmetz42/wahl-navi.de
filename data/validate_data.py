import json
import sys
import os

DB_PATH = '01-projects/wahl-o-mat-muenchen-2026/data/database.json'

def load_db():
    try:
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Database not found at {DB_PATH}")
        sys.exit(1)

def save_db(data):
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Database successfully updated at {DB_PATH}")

def validate_schema(data):
    # Simple validation
    required_keys = ["meta", "theses", "parties"]
    for key in required_keys:
        if key not in data:
            print(f"Validation Error: Missing root key '{key}'")
            return False
    
    if len(data["theses"]) != 25:
        print(f"Validation Warning: Expected 25 theses, found {len(data['theses'])}")
    
    if len(data["parties"]) != 14:
        print(f"Validation Warning: Expected 14 parties, found {len(data['parties'])}")
        
    print("Schema Validation: PASS")
    return True

def get_stats(data):
    total_positions = 0
    total_slots = len(data["parties"]) * len(data["theses"])
    
    for party in data["parties"]:
        total_positions += len(party["positions"])
        
    completion_rate = (total_positions / total_slots) * 100
    print(f"\n--- Data Integrity Status ---")
    print(f"Theses: {len(data['theses'])}")
    print(f"Parties: {len(data['parties'])}")
    print(f"Filled Positions: {total_positions}/{total_slots} ({completion_rate:.1f}%)")
    print("-----------------------------")

if __name__ == "__main__":
    db = load_db()
    if validate_schema(db):
        get_stats(db)
