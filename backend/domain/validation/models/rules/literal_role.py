class LiteralRole:
    def __init__(self, value):
        self.value = value

    def execute(self):
        if self.value not in ['owner', 'crew']:
            raise ValueError('値は「owner」または「crew」でなければなりません。')
        
        return self.value