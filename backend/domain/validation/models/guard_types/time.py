from datetime import datetime

class TimeType:
    def __init__(self, value):
        self.value = value

    def execute(self):
        if not isinstance(self.value, str):
            raise ValueError('値は文字列でなければなりません。')
        
        try:
            # ここではバリデーションのみを行うので、実際の値はdatetime型に変更しない
            change_time = datetime.strptime(self.value, '%H:%M:%S').time()
        except ValueError:
            raise ValueError('時間の形式はHH:MM:SSでなければなりません。')
        
        if not isinstance(change_time, datetime.time):
            raise TypeError('値は時間でなければなりません。')

        return self.value