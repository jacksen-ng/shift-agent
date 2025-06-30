from datetime import datetime, date

class DateType:
    def __init__(self, value):
        self.value = value

    def execute(self):
        if not isinstance(self.value, str):
            raise ValueError('値は文字列でなければなりません。')
        
        try:
            # ここではバリデーションのみを行うので、実際の値はDate型に変更しない
            change_date = datetime.strptime(self.value, '%Y-%m-%d').date()
        except ValueError:
            raise ValueError('日付の形式はYYYY-MM-DDでなければなりません。')
        if not isinstance(change_date, date):
            raise TypeError('値は日付でなければなりません。')

        return self.value