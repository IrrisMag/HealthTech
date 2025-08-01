# Simple mock for testing
class MockDatabase:
    async def command(self, cmd):
        return {"ok": 1}
    
    @property 
    def blood_inventory(self):
        return MockCollection()
    
    @property
    def optimization_reports(self):
        return MockCollection()

class MockCollection:
    async def aggregate(self, pipeline):
        return MockCursor()
    
    async def find_one(self, query, **kwargs):
        return None
    
    async def insert_one(self, doc):
        return type('Result', (), {'inserted_id': 'mock_id'})()

class MockCursor:
    async def to_list(self, length=None):
        return []

# Replace get_database for testing
def get_mock_database():
    return MockDatabase()