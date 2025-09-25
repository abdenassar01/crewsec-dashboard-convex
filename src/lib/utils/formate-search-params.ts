export function formatSearchParams(searchParams: any[]) {
  console.log('Search params: ', Array.from(searchParams));

  return (
    '?' +
    Array.from(searchParams).map((item, index) =>
      index === Array.from(searchParams).length
        ? `${item[0]}=${item[1]}`
        : `${item[0]}=${item[1]}&`,
    )
  );
}
