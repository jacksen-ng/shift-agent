class LiteralEvaluate:
    def __init__(self, value):
        self.value = value

    def execute(self):
        if self.value not in [1, 2, 3, 4, 5]:
            raise ValueError('値は「1」「2」「3」「4」「5」のいずれかでなければなりません。')
        
        return self.value