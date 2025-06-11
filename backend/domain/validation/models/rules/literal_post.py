class LiteralPost:
    def __init__(self, value):
        self.value = value

    def execute(self):
        if self.value not in ['employee', 'part_timer']:
            raise ValueError('値は「employee」または「part_timer」でなければなりません。')
        
        return self.value