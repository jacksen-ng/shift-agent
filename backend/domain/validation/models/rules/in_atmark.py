class InAtmarkRule:
    def __init__(self, value):
        self.value = value

    def execute(self):
        if "@" not in self.value:
            raise ValueError('値は@を含む必要があります。')
        
        if self.value.count('@') != 1:
            raise ValueError('値は@を1つだけ含む必要があります。')
        
        return self.value