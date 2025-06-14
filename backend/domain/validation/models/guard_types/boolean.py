class BooleanType:
    def __init__(self, value):
        self.value = value

    def execute(self):
        if self.value not in [True, False]:
            raise TypeError('値は真偽値でなければなりません。')
        
        return self.value