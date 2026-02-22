def add_month(year: int, month: int):
    month += 1
    if month > 12:
        month = 1
        year += 1
    return year, month