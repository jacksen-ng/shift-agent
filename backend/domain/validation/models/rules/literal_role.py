class LiteralRole:
    def __init__(self, value):
        self.value = value

    def execute(self):
        if self.value not in ['owner', 'clue']:
            raise ValueError('値は「owner」または「clue」でなければなりません。')
        
        return self.value