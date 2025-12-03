# Import script for powerlist nominations
import json
import os
from datetime import datetime

def import_powerlist_nominations():
    try:
        print('Starting powerlist nominations import...')

        json_path = os.path.join(os.getcwd(), 'data', 'powerlist-nominations-2025-12-03T14-12-45-249477.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        print(f"Found {len(data['nominations'])} nominations to import")

        imported = 0
        skipped = 0

        # Note: Database import logic would go here
        # For now, just count
        for nomination in data['nominations']:
            print(f"Would import: {nomination['publication_name']}")
            imported += 1

        print(f"\nImport complete!\nImported: {imported}\nSkipped: {skipped}")

    except Exception as error:
        print(f'Import failed: {error}')

if __name__ == "__main__":
    import_powerlist_nominations()
