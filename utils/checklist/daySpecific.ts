function weekdayExtras(weekday: number): string[] {
  switch (weekday) {
    case 0:
      return ["Sanitize fridge handles and wipe exterior"];
    case 1:
      return ["Wipe baseboards in one high-traffic room"];
    case 2:
      return ["Disinfect door handles and light switches"];
    case 3:
      return ["Deep clean sink drains and polish fixtures"];
    case 4:
      return ["Clean inside microwave and small appliances"];
    case 5:
      return ["Vacuum couch cushions and under furniture edges"];
    case 6:
      return ["Rotate and air out cleaning cloths and mop heads"];
    default:
      return [];
  }
}

export function buildChecklistForDay(day: string, baseItems: string[]) {
  const date = new Date(`${day}T00:00:00`);
  const extras = weekdayExtras(date.getDay());
  const monthDay = date.getDate();

  const monthlyExtra =
    monthDay <= 7 ? ["Restock and audit all cleaning supplies"] : [];

  return [...baseItems, ...extras, ...monthlyExtra];
}
