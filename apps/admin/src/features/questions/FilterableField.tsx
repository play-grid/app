import get from 'lodash/get';
import { useListContext, useRecordContext } from 'ra-core';
import { Badge } from '@/components/ui/badge';

export function FilterableField({ source, filterSource }: { source: string; filterSource?: string }) {
  const record = useRecordContext();
  const { filterValues, setFilters } = useListContext();

  if (!record)
    return null;

  const displayValue = get(record, source);
  if (displayValue == null)
    return null;

  const filterKey = filterSource || source;
  const filterValue = get(record, filterKey);

  const handleClick = () => {
    if (filterValues[filterKey] === filterValue) {
      const { [filterKey]: _, ...newFilters } = filterValues;
      setFilters(newFilters, {});
    }
    else {
      setFilters({ ...filterValues, [filterKey]: filterValue }, {});
    }
  };

  return (
    <Badge
      variant={filterValues[filterKey] === filterValue ? 'default' : 'outline'}
      onClick={handleClick}
      className="cursor-pointer"
    >
      {displayValue.toString()}
    </Badge>
  );
}
