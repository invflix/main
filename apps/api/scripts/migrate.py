#!/usr/bin/env python
import os
import sys
import time
import hashlib
import re
import psycopg

def get_db_url():
    # Load from environment or local .env if run directly
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        # Simple manual fallback to parse .env if present
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    if line.startswith("DATABASE_URL="):
                        db_url = line.strip().split("=", 1)[1]
                        break
    if not db_url:
        db_url = "postgresql://postgres:postgres@localhost:5432/medistock"
    
    # Adapt asyncpg URL format to standard psycopg URL
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


def calculate_checksum(filepath):
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            sha256.update(chunk)
    return sha256.hexdigest()

def ensure_migration_table(conn):
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(20) PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                checksum VARCHAR(64) NOT NULL,
                execution_time_ms INTEGER,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        """)
        conn.commit()

def run_migrations():
    db_url = get_db_url()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    migrations_dir = os.path.abspath(os.path.join(script_dir, "..", "db", "migrations"))
    
    print(f"Connecting to database to run migrations...")
    try:
        conn = psycopg.connect(db_url)
    except Exception as e:
        print(f"Error connecting to database: {e}", file=sys.stderr)
        sys.exit(1)
        
    try:
        ensure_migration_table(conn)
        
        # Scan and sort migrations directory
        files = []
        if os.path.exists(migrations_dir):
            for f in os.listdir(migrations_dir):
                if f.endswith(".sql"):
                    files.append(f)
        else:
            print(f"Migrations directory not found: {migrations_dir}", file=sys.stderr)
            sys.exit(1)
            
        # Sort numerically by prefix
        def get_version(filename):
            match = re.match(r"^(\d+)_", filename)
            return match.group(1) if match else filename
            
        files.sort(key=get_version)
        
        # Load applied migrations
        applied = {}
        with conn.cursor() as cur:
            cur.execute("SELECT version, filename, checksum FROM schema_migrations ORDER BY version;")
            for row in cur.fetchall():
                applied[row[0]] = {"filename": row[1], "checksum": row[2]}
                
        for filename in files:
            version = get_version(filename)
            filepath = os.path.join(migrations_dir, filename)
            checksum = calculate_checksum(filepath)
            
            if version in applied:
                db_info = applied[version]
                if db_info["checksum"] != checksum:
                    print(f"ERROR: Checksum mismatch for migration {filename}!", file=sys.stderr)
                    print(f"Database checksum: {db_info['checksum']}", file=sys.stderr)
                    print(f"Local file checksum: {checksum}", file=sys.stderr)
                    print("Never edit an applied migration file. Create a new sequential migration instead.", file=sys.stderr)
                    sys.exit(1)
                print(f"✓ {filename} already applied")
            else:
                print(f"→ Applying {filename}")
                start_time = time.time()
                
                with open(filepath, "r") as f:
                    sql_content = f.read()
                    
                # Run the migration inside a transaction block
                try:
                    with conn.transaction():
                        with conn.cursor() as cur:
                            for statement in split_sql_statements(sql_content):
                                cur.execute(statement)

                            duration_ms = int((time.time() - start_time) * 1000)

                            cur.execute("""
                                INSERT INTO schema_migrations (version, filename, checksum, execution_time_ms)
                                VALUES (%s, %s, %s, %s);
                            """, (version, filename, checksum, duration_ms))
                    conn.commit()
                    print(f"✓ Applied {filename} ({duration_ms}ms)")
                except Exception as e:
                    conn.rollback()
                    print(f"ERROR: Failed to apply migration {filename}: {e}", file=sys.stderr)
                    sys.exit(1)
                    
        print("All migrations checked and up-to-date.")
    finally:
        conn.close()

if __name__ == "__main__":
    run_migrations()
