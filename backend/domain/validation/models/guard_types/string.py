class StringType:
    def __init__(self, value):
        self.value = value

    def execute(self):
        if not isinstance(self.value, str):
            raise TypeError('値は文字列でなければなりません。')
        
        return self.value