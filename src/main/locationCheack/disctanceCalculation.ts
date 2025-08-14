function disctanceCalculation(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  // The math module contains a function
  // named toRadians which converts from
  // degrees to radians.
  lon1 = (lon1 * Math.PI) / 180;
  lon2 = (lon2 * Math.PI) / 180;
  lat1 = (lat1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;

  // Haversine formula
  const dlon = lon2 - lon1;
  const dlat = lat2 - lat1;
  const a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  const c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers. Use 3956
  // for miles
  const r = 6371;
  // calculate the result
  return c * r;
}

export = disctanceCalculation;

// let lat1 = 53.32055555555556;
// let lat2 = 53.31861111111111;
// let lon1 = -1.7297222222222221;
// let lon2 = -1.6997222222222223;
// let DIS = distance(lat1, lat2, lon1, lon2);

// console.log("===", DIS);
