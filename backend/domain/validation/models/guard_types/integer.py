class IntegerType:
    def __init__(self, value):
        self.value = value

    def execute(self):
        if not isinstance(self.value, int):
            raise TypeError('値は整数でなければなりません。')
        
        return self.value