class CompanyInfoEditEntity:
    def __init__(self,
                company_id,
                company_name,
                store_location,
                open_time,
                close_time,
                target_sales,
                labor_cost,
                rest_day,
                position):
        self.company_id = company_id
        self.company_name = company_name
        self.store_location = store_location
        self.open_time = open_time
        self.close_time = close_time
        self.target_sales = target_sales
        self.labor_cost = labor_cost
        self.rest_day = rest_day
        self.position = position

    def to_json(self):
        company_info_edit_entity_to_json = {
            'company_info': {
                'company_id': self.company_id,
                'company_name': self.company_name,
                'store_location': self.store_location,
                'open_time': self.open_time,
                'close_time': self.close_time,
                'target_sales': self.target_sales,
                'labor_cost': self.labor_cost
            },
            'rest_day': self.rest_day,
            'position': self.position
        }
        return company_info_edit_entity_to_json