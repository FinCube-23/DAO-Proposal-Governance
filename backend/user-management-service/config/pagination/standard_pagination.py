from dataclasses import dataclass
from typing import List, Any

@dataclass
class PaginationResult:
    data: List[Any]
    total: int
    page: int
    limit: int
    next_page: Optional[int]
    prev_page: Optional[int]

class StandardPagination:
    
    def __init__(self):
        self.page_size = 10
        self.max_page_size = 100
    
    def paginate_queryset(self, queryset, page, limit):
        limit = min(limit, self.max_page_size)
        offset = (page - 1) * limit
        return list(queryset[offset:offset + limit])
    
    def get_paginated_response(self, data, queryset, page, limit):
        total = queryset.count()
        return PaginationResult(
            data=data,
            total=total,
            page=page,
            limit=limit,
            next_page=page + 1 if page * limit < total else None,
            prev_page=page - 1 if page > 1 else None
        )