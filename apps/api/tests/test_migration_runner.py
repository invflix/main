import os
import sys
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from scripts.migrate import split_sql_statements


class SplitSqlStatementsTests(unittest.TestCase):
    def test_multiple_statements_are_split_correctly(self):
        sql = """
        CREATE TABLE users (
            id UUID PRIMARY KEY
        );

        CREATE INDEX idx_users_email ON users(id);

        INSERT INTO users (id) VALUES ('a0000000-0000-0000-0000-000000000001');
        """

        statements = split_sql_statements(sql)

        self.assertEqual(len(statements), 3)
        self.assertIn("CREATE TABLE users", statements[0])
        self.assertIn("CREATE INDEX idx_users_email", statements[1])
        self.assertIn("INSERT INTO users", statements[2])


if __name__ == "__main__":
    unittest.main()
