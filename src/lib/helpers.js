exports.SORT = (a, b) => {
  if (b.admin < a.admin) {
    return -1;
  }
  if (a.admin < b.admin) {
    return 1;
  }
  let nameA = a.name;
  let nameB = b.name;
  if (nameB > nameA) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};
