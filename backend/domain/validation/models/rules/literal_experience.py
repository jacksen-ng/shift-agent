class LiteralExperience:
    def __init__(self, value):
        self.value = value
        
    def execute(self):
        if self.value not in ('veteran', 'beginner'):
            raise ValueError('値は「veteran」または「beginner」でなければなりません。')
        
        return self.value