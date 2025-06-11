class NotHyphen:
    def __init__(self, value):
        self.value = value

    def execute(self):
        if '-' in self.value:
            raise ValueError('値はハイフンを含むことができません。')
        
        return self.value