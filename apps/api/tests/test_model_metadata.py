import os
import sys
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app.db.base import Base
import app.db.models  # noqa: F401 - imports all mapped tables into Base.metadata


class ModelMetadataTests(unittest.TestCase):
    def test_all_foreign_keys_resolve_to_registered_tables(self):
        for table in Base.metadata.tables.values():
            for foreign_key in table.foreign_keys:
                self.assertIsNotNone(foreign_key.column)


if __name__ == "__main__":
    unittest.main()
