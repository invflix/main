#!/usr/bin/env python
import os
import sys
import psycopg

def get_db_url():
    # Load from environment or local .env if run directly
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    if line.startswith("DATABASE_URL="):
                        db_url = line.strip().split("=", 1)[1]
                        break
    if not db_url:
        db_url = "postgresql://postgres:postgres@localhost:5432/medistock"
    
    if "postgresql+asyncpg://" in db_url:
        db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    return db_url

def split_sql_statements(sql_text):
    statements = []
    current = []
    in_single_quote = False
    in_double_quote = False
    in_line_comment = False
    in_block_comment = False
    i = 0

    while i < len(sql_text):
        ch = sql_text[i]
        nxt = sql_text[i + 1] if i + 1 < len(sql_text) else ''

        if in_line_comment:
            if ch == '\n':
                in_line_comment = False
            i += 1
            continue

        if in_block_comment:
            if ch == '*' and nxt == '/':
                in_block_comment = False
                i += 2
                continue
            i += 1
            continue

        if in_single_quote:
            current.append(ch)
            if ch == "'":
                if nxt == "'":
                    current.append(nxt)
                    i += 2
                    continue
                in_single_quote = False
            i += 1
            continue

        if in_double_quote:
            current.append(ch)
            if ch == '"':
                if nxt == '"':
                    current.append(nxt)
                    i += 2
                    continue
                in_double_quote = False
            i += 1
            continue

        if ch == '-' and nxt == '-':
            in_line_comment = True
            i += 2
            continue

        if ch == '/' and nxt == '*':
            in_block_comment = True
            i += 2
            continue

        if ch == "'":
            in_single_quote = True
            current.append(ch)
            i += 1
            continue

        if ch == '"':
            in_double_quote = True
            current.append(ch)
            i += 1
            continue

        if ch == ';':
            statement = ''.join(current).strip()
            if statement:
                statements.append(statement)
            current = []
            i += 1
            continue

        current.append(ch)
        i += 1

    tail = ''.join(current).strip()
    if tail:
        statements.append(tail)

    return statements


def run_seeds():
    db_url = get_db_url()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    seeds_dir = os.path.abspath(os.path.join(script_dir, "..", "db", "seeds"))
    
    print(f"Connecting to database to run seeds...")
    try:
        conn = psycopg.connect(db_url)
    except Exception as e:
        print(f"Error connecting to database: {e}", file=sys.stderr)
        sys.exit(1)
        
    try:
        if os.path.exists(seeds_dir):
            files = [f for f in os.listdir(seeds_dir) if f.endswith(".sql")]
            files.sort()  # Sorts as 001_, 002_, 003_
        else:
            print(f"Seeds directory not found: {seeds_dir}", file=sys.stderr)
            sys.exit(1)
            
        for filename in files:
            filepath = os.path.join(seeds_dir, filename)
            print(f"→ Applying seed: {filename}")
            
            with open(filepath, "r") as f:
                sql_content = f.read()
                
            try:
                with conn.transaction():
                    with conn.cursor() as cur:
                        for statement in split_sql_statements(sql_content):
                            cur.execute(statement)
                conn.commit()
                print(f"✓ Applied seed {filename}")
            except Exception as e:
                conn.rollback()
                print(f"ERROR: Failed to apply seed {filename}: {e}", file=sys.stderr)
                sys.exit(1)
                
        print("Database seeding completed successfully.")
    finally:
        conn.close()

if __name__ == "__main__":
    run_seeds()
