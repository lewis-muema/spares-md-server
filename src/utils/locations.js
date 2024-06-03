const organizeLocations = (item) => {
  const locations = {
    description: item.description,
    building: '',
    street: '',
    town: '',
    country: '',
  };
  if (item.terms.length === 1) {
    locations.country = item.terms[0].value;
  }
  if (item.terms.length === 2) {
    locations.town = item.terms[0].value;
    locations.country = item.terms[1].value;
  }
  if (item.terms.length === 3) {
    locations.building = item.terms[0].value;
    locations.town = item.terms[1].value;
    locations.country = item.terms[2].value;
  }
  if (item.terms.length === 4) {
    locations.building = item.terms[0].value;
    locations.street = item.terms[1].value;
    locations.town = item.terms[2].value;
    locations.country = item.terms[3].value;
  }
  if (item.terms.length === 5) {
    locations.building = item.terms[0].value;
    locations.street = item.terms[1].value;
    locations.town = `${item.terms[2].value}, ${item.terms[3].value}`;
    locations.country = item.terms[4].value;
  }
  return locations;
};

module.exports = organizeLocations;
