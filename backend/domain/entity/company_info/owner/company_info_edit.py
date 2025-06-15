class CompanyInfoEditEntity:
    def __init__(self,
                company_id,
                company_name,
                store_locate,
                open_time,
                close_time,
                target_sales,
                labor_cost,
                rest_day,
                position_name):
        self.company_id = company_id
        self.company_name = company_name
        self.store_locate = store_locate
        self.open_time = open_time
        self.close_time = close_time
        self.target_sales = target_sales
        self.labor_cost = labor_cost
        self.rest_day = rest_day
        self.position_name = position_name

    def toJson(self):
        company_info_edit_entity_toJson = [
            {
                "company_id": self.company_id,
                "company_name": self.company_name,
                "store_locate": self.store_locate,
                "open_time": self.open_time,
                "close_time": self.close_time,
                "target_sales": self.target_sales,
                "labor_cost": self.labor_cost
            },
            {
                "rest_day": self.rest_day
            },
            {
                "position_name": self.position_name
            }
        ]
        return company_info_edit_entity_toJson