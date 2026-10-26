const parseDate = (dateString) => {
  if (!dateString) return null;

  const cleaned = dateString
    .trim()
    .replace(/\./g, "-")
    .replace(/\//g, "-");

  const parts = cleaned.split("-");

  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(Number);

  if (!day || !month || !year) return null;

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const isApplicationOpen = (
  applicationStartDate,
  applicationEndDate
) => {
  if (!applicationStartDate || !applicationEndDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(applicationStartDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(applicationEndDate);
  endDate.setHours(23, 59, 59, 999);

  return today >= startDate && today <= endDate;
};

module.exports = {
  parseDate,
  isApplicationOpen,
};